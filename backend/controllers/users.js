const User = require('../models/user')
const bcrypt = require ('bcrypt')
const jwt = require('jsonwebtoken')

exports.logIn = (req, res) => {

    const SECRET_TOKEN = process.env.SECRET_TOKEN;
    User.findOne({ username: req.body.username })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Identifiants incorrects' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then( valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Identifiants incorrects' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign (
                        { userId: user._id },
                            SECRET_TOKEN,
                        { expiresIn: '24h' }
                        )
            })
        })
            .catch(error => {
                console.error(error);
                res.status(500).json({ message: 'Erreur lors de la connexion.' });
            });
        })
    .catch(error => {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la connexion.' });
    });
};
