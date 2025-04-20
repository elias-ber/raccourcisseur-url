const passport = require('passport');
const argon2 = require('argon2');
const { Sequelize } = require('sequelize')
const db = require('../models/init-models')(require('../config/sequelize'));

const login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            req.session.errorMessage = info.message || 'Échec de la connexion';
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            return res.redirect('/dashboard');
        });
    })(req, res, next);
};

const register = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;
        if (!username || !email || !password) {
            req.session.errorMessage = 'Tous les champs sont obligatoires';
            return res.redirect('/register');
        }
        if (password !== confirmPassword) {
            req.session.errorMessage = 'Les mots de passe ne correspondent pas';
            return res.redirect('/register');
        }
        const existingUser = await db.users.findOne({
            where: {
                [Sequelize.Op.or]: [
                    { username },
                    { email }
                ]
            }
        });
        if (existingUser) {
            req.session.errorMessage = 'Ce nom d\'utilisateur ou email est déjà utilisé';
            return res.redirect('/register');
        }
        const hashedPassword = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });
        const newUser = await db.users.create({
            username,
            email,
            password_hash: hashedPassword
        });
        req.login(newUser, (err) => {
            if (err) {
                console.error('Erreur de connexion après inscription:', err);
                return next(err);
            }
            req.session.successMessage = 'Compte créé avec succès!';
            return res.redirect('/dashboard');
        });
    } catch (err) {
        console.error('Erreur lors de l\'inscription:', err);
        req.session.errorMessage = 'Une erreur est survenue lors de l\'inscription';
        res.redirect('/register');
    }
};

const logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/login');
        }
        res.redirect('/login');
    });
};

module.exports = { login, register, logout };
