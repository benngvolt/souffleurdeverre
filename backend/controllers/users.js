const User = require('../models/user')
const bcrypt = require ('bcrypt')
const jwt = require('jsonwebtoken')

exports.logIn = (req, res) => {

    const SECRET_TOKEN = process.env.SECRET_TOKEN;
    User.findOne({ username: req.body.username })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Utilisateur non-existant'});
                 // status 401 'Unauthorized' authentification non-validée
            }
            bcrypt.compare(req.body.password, user.password)
                .then( valid => {   
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire username/mot de passe incorrecte' }); // status 401 'Unauthorized' authentification non-validée
                    }
                    res.status(200).json({ // status 200 'OK'
                        userId: user._id,
                        token: jwt.sign (
                        { userId: user._id },
                            SECRET_TOKEN,
                        { expiresIn: '24h' }
                        )
            })
        })
            .catch(error => res.status(500).json({ error })); // status 500 'Internal  Server  Error' > erreur serveur
        })
    .catch(error => res.status(400).json({ error }));  // status 400 'Bad Request' > pour indiquer une erreur côté client
};

// exports.signUp = (req, res) => {
//     bcrypt.hash(req.body.password, 10)
//     .then(hash => {
//       const user = new User({
//         username: req.body.username,
//         password: hash
//       });
//       user.save()
//         .then(() => res.status(201).json({ message: 'Utilisateur créé !' })) // status 201 'Created'
//         .catch(error => res.status(400).json({ error })); // status 400 'Bad Request' > pour indiquer une erreur côté client
//     })
//     .catch(error => res.status(500).json({ error })); // status 500 'Internal  Server  Error' > erreur serveur
// }