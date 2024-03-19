const mongoose = require('mongoose');
const validator = require('validator');

const biographySchema = mongoose.Schema({
    surname: {type: String, required: true},
    name: {type: String, required: true},
    role: {type: String, required: true},
    field: {type: String, required: true},
    biography: {type: String, required: false},
    linkUrl: {type: String, required: false},
    bioImageUrl: {type: String, required: false},
});


module.exports = mongoose.model('Biography', biographySchema);