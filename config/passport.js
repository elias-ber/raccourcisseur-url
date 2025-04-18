const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const argon2 = require('argon2');
const db = require('../models/init-models')(require('./sequelize'));

passport.use(new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done) => {
        try {
            const user = await db.users.findOne({ where: { username } });
            if (!user) {
                return done(null, false, { message: 'Nom d\'utilisateur incorrect' });
            }
            const isValid = await argon2.verify(user.password_hash, password);
            if (!isValid) {
                return done(null, false, { message: 'Mot de passe incorrect' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.users.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;
