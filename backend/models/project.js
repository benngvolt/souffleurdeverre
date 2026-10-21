const mongoose = require('mongoose');

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
    paragraphList: [
        {
        paragraphText: {type: String, required: false},
        paragraphTitle: {type: String, required: false},
        }
    ],
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
    linksList: [
        {   
        linkName: {type: String, required: false},
        linkUrl: {type: String, required: false},
        linkType: {type: String, required: false}
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
        moreInfos: {type: String, required: false},
        releaseDate: {type: String, required: false},
        }
    ],
    showsList: [
        {
        dates: [ 
            {
                day: {type: String, required: false},
                period: {
                    startDate: {type: String, required: false},
                    endDate: {type: String, required: false}
                },
                times: [
                    {
                        time: {type: String, required: false},
                        timeInfos: {type: String, required: false}
                    }
                ]
            }
        ],
        city: {type: String, required: false},
        placeName: {type: String, required: false},
        placeLink: {type: String, required: false},
        showsNumber: {type: Number, required: false},
        moreInfos: {type: String, required: false}
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
    // Noms des logos (modèle Logo) à afficher en bas de la page du projet
    logos: [{type: String}],
    proSpace: {
        enabled: {
            type: Boolean,
            default: false,
        },
    
        // Ancien format (un seul ZIP) : conservé en lecture pour les projets existants
        zipUrl: {
            type: String,
            default: '',
        },
        // Documents téléchargeables indépendamment par les pros (PDF, images, .doc...)
        documents: [
            {
                name: {type: String, required: false},
                url: {type: String, required: false},
                size: {type: Number, required: false},
                mimeType: {type: String, required: false},
            }
        ],
        password: {
            type: String,
            default: '',
            trim: true,
        },
    },
});


module.exports = mongoose.model('Project', projectSchema);