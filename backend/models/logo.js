const mongoose = require('mongoose');

// Le nom sert de clé de jointure : les projets référencent leurs logos par ce nom
// (champ `logos` du modèle Project), il doit donc être unique.
const logoSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    // Texte de l'attribut alt de l'image (par défaut : le nom du logo)
    altText: {
        type: String,
        required: false,
        default: '',
        trim: true,
    },
    linkUrl: {
        type: String,
        required: false,
        default: '',
        trim: true,
    },
    // Si vrai, le logo est affiché en bas de la page Compagnie
    isOnCompanyPage: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('Logo', logoSchema);
