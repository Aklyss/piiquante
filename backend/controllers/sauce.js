const Sauce = require('../models/sauce');
const fs = require('fs');
const User = require('../models/user')

require('dotenv').config()
exports.createSauce = (req, res, next) => {
    console.log(req.body)
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id;
    delete sauceObject._userId;
    const file = req.files ? req.files[0]: null
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        likes: 0,
        dislikes: 0,
        usersLiked:[],
        usersDisliked:[],
        imageUrl: `${req.protocol}://${req.get('host')}/images/${file.filename}`
    });
    sauce.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré !' })})
    .catch(error => 
        {console.error(error), res.status(400).json({ error })})
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error}))
}

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }))
}

exports.modifySauce = (req, res, next) => {
    const file = req.files ? req.files[0] : null
    const chaine = JSON.stringify(req.body)
    

    
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                if (file){
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => { console.log(filename) });
                }
                const sauceObject = file ? {
                    userId: req.auth.userId,
                    ...JSON.parse(req.body.sauce),
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${file.filename}`
                } : { ...req.body };
                delete sauceObject._userId;
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié' }))
                    .catch(error => 
                        {console.error(error), res.status(401).json({ error })})
            }
        })
        .catch((error) => {
            console.error(error), res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.likeSauce = (req, res, next) => {
    const Id = req.params.id;
    const userId = req.body.userId;
    const like = JSON.parse(req.body.like);
    User.findOne({ _id: userId })
        .then(user => {
            if (!user) {
                res.status(400).json({ message: "Utilisateur inconnu" })
            } else {
                if (like === 1) {
                    Sauce.updateOne({ _id: Id }, {
                        $push: { usersLiked: userId },
                        $inc: { likes: 1 },
                    })
                        .then(() => res.status(200).json({ message: "L'utilisateur aime la sauce" }))
                        .catch((error) => res.status(500).json({ error }));
                } else if (like === -1) {
                    Sauce.updateOne({ _id: Id }, {
                        $push: { usersDisliked: userId },
                        $inc: { dislikes: 1 },
                    })
                        .then(() => res.status(200).json({ message: "L'utilisateur n'aime pas la sauce" }))
                        .catch((error) => res.status(500).json({ error }));
                } else if (like === 0) {
                    Sauce.findOne({ _id: Id })
                        .then((sauce) => {
                            if (sauce.usersDisliked.includes(userId)) {
                                Sauce.updateOne({ _id: Id }, {
                                    $pull: { usersDisliked: userId },
                                    $inc: { dislikes: -1 },
                                })
                                    .then(() => res.status(200).json({ message: "je n'aime pas enlevé" }))
                                    .catch((error) => res.status(400).json({ error }))
                            } else if (sauce.usersLiked.includes(userId)) {
                                Sauce.updateOne({ _id: Id }, {
                                    $pull: { usersLiked: userId },
                                    $inc: { likes: -1 },
                                })
                                    .then(() => res.status(200).json({ message: "j'aime pas enlevé" }))
                                    .catch((error) => res.status(400).json({ error }))
                            } else {
                                res.status(201).json({ message: "annule" })
                            }
                        })
                        .catch((error) => res.status(404).json({ error }))
                } else {
                    res.status(400).json({ message: "Choix invalide" })
                }
            }
        })
        .catch((error) => res.status(500).json({ message: "l'utilisateur n'est pas reconnu" }));
}
