const mongoose = require('mongoose');
const validator = require('validator');

const projectSchema = mongoose.Schema({
    title: {type: String, required: true},
    subtitle: {type: String, required: false},
    projectState: {type: String, required: false},
    projectType: {type: String, required: true},
    duration: {type: String, required: false},
    creationDate: {type: String, required: false},
    description: {type: String, required: false},
    moreInfos: {type: String, required: false},
    mainImageIndex: { type: Number, required: false },
    artistsList: [
        {
        artistFunction: {type: String, required: false},
        artistName: {type: String, required: false},
        }
    ],
    productionList: [
        {
        productionFunction: {type: String, required: false},
        productionName: {type: String, required: false},
        }
    ],
    pressList: [
        {
        quote: {type: String, required: false},
        mediaName: {type: String, required: false},
        }
    ],
    videoList: [
        {   
        videoName: {type: String, required: false},
        videoLink: {type: String, required: false},
        }
    ],
    residenciesList: [
        {
        residencyType : {type: String, required: false},
        startDates: {type: String, required: false},
        endDates: {type: String, required: false},
        city: {type: String, required: false},
        placeName: {type: String, required: false},
        placeLink: {type: String, required: false},
        }
    ],
    showsList: [
        {
        dates: [
            {type: String, required: false},
        ],
        city: {type: String, required: false},
        placeName: {type: String, required: false},
        placeLink: {type: String, required: false},
        showsNumber: {type: Number, required: false},
        }
    ],
    pdfList : [
        {
        pdfName: {type: String, required: false},
        pdfLink: {type: String, required: false},
        }
    ],
    images: [
        {
        imageUrl: {type: String, required: false},
        photograph: {type: String, required: false},
        }
    ],
});


module.exports = mongoose.model('Project', projectSchema);