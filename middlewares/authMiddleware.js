const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        // Si c'est une requête AJAX, renvoyer une réponse JSON
        res.status(401).json({ success: false, message: 'Non authentifié' });
    } else {
        // Sinon, rediriger vers la page de connexion
        res.redirect('/login');
    }
};

module.exports = { isAuthenticated };
