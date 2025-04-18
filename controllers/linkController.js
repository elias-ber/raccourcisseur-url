const argon2 = require('argon2');
const db = require('../models/init-models')(require('../config/sequelize'));
const geoip = require('geoip-lite');
const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const generateShortId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
};

const createLink = async (req, res) => {
    try {
        const { originalUrl, customAlias, password, expiration, customExpirationDate, customExpirationTime } = req.body;
        if (!originalUrl) {
            req.session.errorMessage = 'URL requise';
            return res.redirect('/dashboard');
        }
        let shortId = customAlias || generateShortId();
        let existingLink = await db.links.findOne({ where: { short_id: shortId } });
        while (existingLink) {
            shortId = generateShortId();
            existingLink = await db.links.findOne({ where: { short_id: shortId } });
        }
        let passwordHash = null;
        if (password) {
            passwordHash = await argon2.hash(password, {
                type: argon2.argon2id,
                memoryCost: 2 ** 16,
                timeCost: 3,
                parallelism: 1
            });
        }
        let expiratedAt = null;
        if (expiration && expiration !== 'never') {
            if (expiration === 'custom') {
                const selectedDate = new Date(customExpirationDate);
                const selectedTime = customExpirationTime.split(':');
                selectedDate.setHours(selectedTime[0], selectedTime[1]);
                const currentDate = new Date();
                if (selectedDate <= currentDate) {
                    req.session.errorMessage = 'Veuillez sélectionner une date et une heure futures.';
                    return res.redirect('/dashboard');
                }
                expiratedAt = selectedDate;
            } else {
                expiratedAt = new Date();
                const duration = parseInt(expiration);
                const unit = expiration.slice(-1);
                if (unit === 'h') {
                    expiratedAt.setHours(expiratedAt.getHours() + duration);
                } else if (unit === 'd') {
                    expiratedAt.setDate(expiratedAt.getDate() + duration);
                }
            }
        }
        const newLink = await db.links.create({
            short_id: shortId,
            redirection: originalUrl,
            password_hash: passwordHash,
            expirated_at: expiratedAt,
            is_active: 1,
            created_by: req.user.id
        });
        req.session.successMessage = `Lien court créé : ${req.protocol}://${req.get('host')}/${shortId}`;
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Erreur lors de la création du lien:', err);
        req.session.errorMessage = 'Erreur lors de la création du lien';
        res.redirect('/dashboard');
    }
};

const updateLink = async (req, res) => {
    try {
        const linkId = req.params.id;
        const { url, password, expiration, is_active } = req.body;
        const link = await db.links.findOne({
            where: {
                id: linkId,
                created_by: req.user.id
            }
        });
        if (!link) {
            req.session.errorMessage = 'Lien non trouvé ou non autorisé';
            return res.redirect('/dashboard');
        }
        const updateData = {};
        if (url) {
            updateData.redirection = url;
        }
        if (password) {
            updateData.password_hash = await argon2.hash(password, {
                type: argon2.argon2id,
                memoryCost: 2 ** 16,
                timeCost: 3,
                parallelism: 1
            });
        }
        if (expiration) {
            const expiratedAt = new Date();
            expiratedAt.setDate(expiratedAt.getDate() + parseInt(expiration));
            updateData.expirated_at = expiratedAt;
        }
        if (is_active !== undefined) {
            updateData.is_active = is_active === 'true' ? 1 : 0;
        }
        await link.update(updateData);
        req.session.successMessage = 'Lien mis à jour avec succès';
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Erreur lors de la mise à jour du lien:', err);
        req.session.errorMessage = 'Erreur lors de la mise à jour du lien';
        res.redirect('/dashboard');
    }
};

const deleteLink = async (req, res) => {
    try {
        const linkId = req.params.id;
        const link = await db.links.findOne({
            where: {
                id: linkId,
                created_by: req.user.id
            }
        });
        if (!link) {
            req.session.errorMessage = 'Lien non trouvé ou non autorisé';
            return res.redirect('/dashboard');
        }
        await link.update({ is_active: 0 });
        req.session.successMessage = 'Lien supprimé avec succès';
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Erreur lors de la suppression du lien:', err);
        req.session.errorMessage = 'Erreur lors de la suppression du lien';
        res.redirect('/dashboard');
    }
};

const deleteMultipleLinks = async (req, res) => {
    try {
        const { ids } = req.body;
        await db.links.update({ is_active: 0 }, {
            where: {
                id: ids,
                created_by: req.user.id
            }
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Erreur lors de la suppression des liens:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

const bulkUploadLinks = async (req, res) => {
    try {
        const results = [];
        const filePath = req.file.path;
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                if (Object.keys(row).length !== 1) {
                    return;
                }
                const originalUrl = Object.values(row)[0];
                if (isValidUrl(originalUrl)) {
                    results.push(originalUrl);
                }
            })
            .on('end', async () => {
                const createdLinks = [];
                for (const url of results) {
                    const shortId = generateShortId();
                    const newLink = await db.links.create({
                        short_id: shortId,
                        redirection: url,
                        is_active: 1,
                        created_by: req.user.id
                    });
                    createdLinks.push(newLink);
                }
                req.session.successMessage = `${createdLinks.length} URLs importées avec succès.`;
                res.redirect('/dashboard');
                fs.unlinkSync(filePath);
            });
    } catch (err) {
        console.error('Erreur lors de l\'import en masse des URLs:', err);
        req.session.errorMessage = 'Erreur lors de l\'import en masse des URLs';
        res.redirect('/dashboard');
    }
};

const getLinkStats = async (req, res) => {
    try {
        const linkId = req.params.id;
        const link = await db.links.findOne({
            where: { id: linkId, created_by: req.user.id },
            include: [{
                model: db.visits,
                as: 'visits'
            }]
        });
        if (!link) {
            return res.status(404).json({ success: false, message: 'Lien non trouvé' });
        }
        const clicksByDate = link.visits.reduce((acc, visit) => {
            const date = visit.visited_at.toISOString().split('T')[0];
            acc[date] = (acc[date] || []).concat(visit);
            return acc;
        }, {});
        const clicksByIp = link.visits.reduce((acc, visit) => {
            acc[visit.ip_address] = (acc[visit.ip_address] || 0) + 1;
            return acc;
        }, {});
        res.json({
            success: true,
            clicksByDate: Object.keys(clicksByDate).map(date => ({ date, clicks: clicksByDate[date] })),
            clicksByIp: Object.keys(clicksByIp).map(ip => ({ ip, clicks: clicksByIp[ip] }))
        });
    } catch (err) {
        console.error('Erreur lors de la récupération des statistiques:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};


const redirectToLink = async (req, res) => {
    try {
        const link = await db.links.findOne({
            where: {
                short_id: req.params.shortId,
                is_active: 1
            }
        });
        if (!link) {
            return res.status(404).send('Lien non trouvé');
        }
        if (link.expirated_at && new Date(link.expirated_at) < new Date()) {
            return res.status(410).send('Ce lien a expiré');
        }
        if (link.password_hash) {
            if (!req.session.authorizedLinks || !req.session.authorizedLinks.includes(link.id)) {
                return res.render('password-prompt', { shortId: req.params.shortId });
            }
        }
        const geo = geoip.lookup(req.ip);
        const country = geo ? geo.country : null;
        await db.visits.create({
            link_id: link.id,
            visited_at: new Date(),
            ip_address: req.ip,
            country: country
        });
        res.redirect(link.redirection);
    } catch (err) {
        console.error('Erreur lors de la redirection:', err);
        res.status(500).send('Erreur serveur');
    }
};
const verifyLinkPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const link = await db.links.findOne({
            where: {
                short_id: req.params.shortId,
                is_active: 1
            }
        });
        if (!link) {
            return res.status(404).send('Lien non trouvé');
        }
        const isValid = await argon2.verify(link.password_hash, password);
        if (!isValid) {
            return res.render('password-prompt', {
                shortId: req.params.shortId,
                errorMessage: 'Mot de passe incorrect'
            });
        }
        if (!req.session.authorizedLinks) {
            req.session.authorizedLinks = [];
        }
        req.session.authorizedLinks.push(link.id);
        const geo = geoip.lookup(req.ip);
        const country = geo ? geo.country : null;
        await db.visits.create({
            link_id: link.id,
            visited_at: new Date(),
            ip_address: req.ip,
            country: country
        });
        res.redirect(link.redirection);
    } catch (err) {
        console.error('Erreur lors de la vérification du mot de passe:', err);
        res.status(500).send('Erreur serveur');
    }
};

module.exports = {
    createLink,
    updateLink,
    deleteLink,
    deleteMultipleLinks,
    bulkUploadLinks,
    getLinkStats,
    redirectToLink,
    verifyLinkPassword
};
