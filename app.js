const express = require('express');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const passport = require('./config/passport');
const bodyParser = require('body-parser');
const path = require('path');
const { isAuthenticated } = require('./middlewares/authMiddleware');
const { login, register, logout } = require('./controllers/authController');
const { createLink, updateLink, deleteLink, deleteMultipleLinks, bulkUploadLinks, getLinkStats, redirectToLink, verifyLinkPassword } = require('./controllers/linkController');
const { updateProfile } = require('./controllers/userController');
const db = require('./models/init-models')(require('./config/sequelize'));
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.DB_CONNECTION,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes d'authentification
app.post('/login', login);
app.post('/register', register);
app.post('/logout', logout);

// Routes de gestion des liens
app.post('/links', isAuthenticated, createLink);
app.post('/links/:id', isAuthenticated, updateLink);
app.post('/links/:id/delete', isAuthenticated, deleteLink);
app.post('/links/delete', isAuthenticated, deleteMultipleLinks);
app.post('/links/bulk-upload', isAuthenticated, upload.single('file'), bulkUploadLinks);
app.get('/links/:id/stats', isAuthenticated, getLinkStats);



// Route pour vérifier le mot de passe d'un lien
app.post('/:shortId/verify', verifyLinkPassword);

// Routes de gestion des utilisateurs
app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', {
        user: req.user,
        errorMessage: req.session.errorMessage,
        successMessage: req.session.successMessage
    });
    delete req.session.errorMessage;
    delete req.session.successMessage;
});
app.post('/profile', isAuthenticated, updateProfile);

// Routes de base
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login', {
        errorMessage: req.session.errorMessage,
        user: req.user
    });
    delete req.session.errorMessage;
});

app.get('/register', (req, res) => {
    res.render('register', {
        errorMessage: req.session.errorMessage,
        user: req.user
    });
    delete req.session.errorMessage;
});

app.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const links = await db.links.findAll({
            where: { created_by: req.user.id, is_active: 1 },
            include: [{
                model: db.visits,
                as: 'visits'
            }]
        });
        const activeUrlsCount = links.length;
        const totalClicks = links.reduce((sum, link) => sum + link.visits.length, 0);
        const protectedUrlsCount = links.filter(link => link.password_hash).length;
        const formattedLinks = links.map(link => {
            const remainingTime = link.expirated_at ? calculateRemainingTime(link.expirated_at) : 'Permanent';
            return {
                ...link.get(),
                created_at: formatDate(link.created_at),
                expirated_at: link.expirated_at ? formatDate(link.expirated_at) : null,
                remainingTime: remainingTime,
                isExpired: link.expirated_at && new Date(link.expirated_at) < new Date(),
                isPermanent: !link.expirated_at
            };
        });
        res.render('dashboard', {
            user: req.user,
            links: formattedLinks,
            activeUrlsCount: activeUrlsCount,
            totalClicks: totalClicks,
            protectedUrlsCount: protectedUrlsCount,
            errorMessage: req.session.errorMessage,
            successMessage: req.session.successMessage
        });
        delete req.session.errorMessage;
        delete req.session.successMessage;
    } catch (err) {
        console.error('Erreur lors de la récupération des liens:', err);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour rediriger les liens raccourcis
app.get('/:shortId', redirectToLink);

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Page non trouvée',
        error: { status: 404 }
    });
});

// Gestion des erreurs 500
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const formatDate = (date) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString(undefined, options);
};

const calculateRemainingTime = (expiratedAt) => {
    const now = new Date();
    const expiration = new Date(expiratedAt);
    const diff = expiration - now;
    if (diff <= 0) {
        return 'Expiré';
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) {
        return `${days} jours restants`;
    }
    if (hours > 0) {
        return `${hours} heures restantes`;
    }
    return 'Moins d\'une heure restante';
};

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
