const mongoose = require('mongoose');
const validator = require('validator');

const projectSchema = mongoose.Schema({
    title: {type: String, required: true},
    projectState: {type: String, required: true},
    subtitle: {type: String, required: false},
    duration: {type: String, required: false},
    creationDate: {type: String, required: false},
    description: {type: String, required: false},
    moreInfos: {type: String, required: false},
    mainImageIndex: { type: Number, required: true },
    artistList: [
        {
        artistFunction: {type: String, required: false},
        artistName: {type: String, required: false},
        }
    ],
    productionList: [
        {
        prodFunction: {type: String, required: false},
        prodName: {type: String, required: false},
        }
    ],
    pdfList : [
        {
        pdfName: {type: String, required: false},
        pdfLink: {type: String, required: false},
        }
    ],
    press: [
        {
        quote: {type: String, required: false},
        mediaName: {type: String, required: false},
        }
    ],
    videos: [
        {   
        videoName: {type: String, required: false},
        videoLink: {type: String, required: false},
        }
    ],
    images: [
        {
        imageUrl: {type: String, required: false},
        photograph: {type: String, required: false},
        }
    ],
    agendaList: {
        residencies: [
            {
            residencyType : {type: String, required: false},
            dates: {type: String, required: false},
            city: {type: String, required: false},
            placeName: {type: String, required: false},
            placeLink: {type: String, required: false},
            }
        ],
        shows: [
            {
            dates: {type: String, required: false},
            city: {type: String, required: false},
            placeName: {type: String, required: false},
            placeLink: {type: String, required: false},
            showsNumber: {type: Number, required: false},
            }
        ],
    }
});


module.exports = mongoose.model('Project', projectSchema);