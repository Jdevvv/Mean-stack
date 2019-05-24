const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

module.exports = (router) => {

    router.post('/register', (req, res) => {
        if (!req.body.email) {
            res.json({
                success: false,
                message: 'Vous devez renseigner un email'
            });
        } else if (!req.body.username) {
            res.json({
                success: false,
                message: 'Vous devez renseigner un pseudo'
            });
        } else if (!req.body.password) {
            res.json({
                success: false,
                message: 'Vous devez renseigner un mot de passe'
            });
        } else {
            let user = new User({
                email: req.body.email.toLowerCase(),
                username: req.body.username.toLowerCase(),
                password: req.body.password
            });
            user.save((err) => {
                if (err) {
                    if (err.code === 11000) {
                        res.json({
                            success: false,
                            message: 'Le pseudo ou l\'email existe déjà'
                        });
                    } else if (err.errors) {
                        if (err.errors.email) {
                            res.json({
                                success: false,
                                message: err.errors.email.message
                            });
                        } else if (err.errors.username) {
                            res.json({
                                success: false,
                                message: err.errors.username.message
                            });
                        } else if (err.errors.password) {
                            res.json({
                                success: false,
                                message: err.errors.password.message
                            });
                        } else {
                            res.json({
                                success: false,
                                message: err
                            });
                        }
                    } else {
                        res.json({
                            success: false,
                            message: 'Impossible d\'enregistrer l\'utilisateur. Erreur: ',
                            err
                        });
                    }
                } else {
                    res.json({
                        success: true,
                        message: 'Compte enregistré !'
                    });
                }
            });
        }

    });

    router.post('/login', (req, res) => {
        if (!req.body.username) {
            res.json({
                success: false,
                message: 'Aucun pseudo trouvé'
            });
        } else if (!req.body.password) {
            res.json({
                success: false,
                message: 'Pas de mot de passe trouvé'
            });
        } else {
            User.findOne({ // Chercher l'user dans la base de donnée
                username: req.body.username.toLowerCase()
            }, (err, user) => {
                if (err) {
                    res.json({
                        success: false,
                        message: err
                    });
                } else if (!user) {
                    res.json({
                        success: false,
                        message: 'Utilisateur non trouvé'
                    });
                } else {
                    const validPassword = user.comparePassword(req.body.password); // Est ce que c'est bien son mdp
                    if (!validPassword) {
                        res.json({
                            success: false,
                            message: 'Mot de passe invalide'
                        });
                    } else {
                        const token = jwt.sign({
                            userId: user._id
                        }, config.secret, {
                            expiresIn: '24h'
                        });
                        res.json({
                            success: true,
                            message: 'Connecté !',
                            token: token,
                            user: {
                                username: user.username
                            }
                        });
                    }
                }
            });
        }
    });

    router.use((req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) {
            res.json({ success: false, message: 'Pas de token'});
        } else {
            jwt.verify(token, config.secret, (err, decoded) => {
                if (err) {
                    res.json({ success: false, message: 'Token invalide' + err });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        }
     });

    router.get('/profile', (req, res) => {
        User.findOne({ _id: req.decoded.userId }).select('username email').exec((err, user) => {
            if (err) {
                res.json({ success: false, message: err });
            } else if (!user) {
                res.json({ success: false, message: 'Utilisateur non trouvé' });
            } else {
                res.json({ success: true, user: user });
            }
        })
    });

    

    return router;
}