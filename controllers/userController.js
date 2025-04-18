const argon2 = require('argon2');
const db = require('../models/init-models')(require('../config/sequelize'));

const updateProfile = async (req, res) => {
    try {
        const { username, email, currentPassword, newPassword, confirmPassword } = req.body;
        const user = req.user;
        const updateData = {};
        if (username && username !== user.username) {
            const existingUser = await db.users.findOne({ where: { username } });
            if (existingUser && existingUser.id !== user.id) {
                req.session.errorMessage = 'Ce nom d\'utilisateur est déjà utilisé';
                return res.redirect('/profile');
            }
            updateData.username = username;
        }
        if (email && email !== user.email) {
            const existingUser = await db.users.findOne({ where: { email } });
            if (existingUser && existingUser.id !== user.id) {
                req.session.errorMessage = 'Cet email est déjà utilisé';
                return res.redirect('/profile');
            }
            updateData.email = email;
        }
        if (currentPassword && newPassword) {
            if (newPassword !== confirmPassword) {
                req.session.errorMessage = 'Les nouveaux mots de passe ne correspondent pas';
                return res.redirect('/profile');
            }
            const isValidPassword = await argon2.verify(user.password_hash, currentPassword);
            if (!isValidPassword) {
                req.session.errorMessage = 'Mot de passe actuel incorrect';
                return res.redirect('/profile');
            }
            updateData.password_hash = await argon2.hash(newPassword, {
                type: argon2.argon2id,
                memoryCost: 2 ** 16,
                timeCost: 3,
                parallelism: 1
            });
        }
        if (Object.keys(updateData).length > 0) {
            await db.users.update(updateData, { where: { id: user.id } });
            req.session.successMessage = 'Profil mis à jour avec succès';
        } else {
            req.session.errorMessage = 'Aucune modification effectuée';
        }
        res.redirect('/profile');
    } catch (err) {
        console.error('Erreur lors de la mise à jour du profil:', err);
        req.session.errorMessage = 'Une erreur est survenue lors de la mise à jour du profil';
        res.redirect('/profile');
    }
};

module.exports = { updateProfile };
