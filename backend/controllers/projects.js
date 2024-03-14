const Project = require('../models/project')
const { storage, bucket } = require('../config/storage');

/*------------------------
----- GET ALL PROJECTS ---
-------------------------*/

exports.getAllProjects = (req, res) => {
    Project.find()
      .then (projects =>res.status(200).json(projects))
      .catch (error => res.status (400).json({error}))
  }

/*------------------------
----- GET ONE PROJECT ----
-------------------------*/

exports.getOneProject = (req, res) => {
  Project.findOne({_id: req.params.id})
    .then (project =>res.status(200).json(project))
    .catch (error => res.status (400).json({error}))
}


/*--------------------------
----- DELETE ONE PROJECT -----
--------------------------*/

exports.deleteOneProject = async (req, res, next) => {
  try {
    const deletedProject = await Project.findOneAndDelete({ _id: req.params.id });
    if (!deletedProject) {
      return res.status(404).json({ message: 'Projet non trouvée' });
    }
    const projects = await Project.find();
    const imageUrls = projects.flatMap((project) => project.images.map((image) => image.imageUrl));
    const pdfLinks = projects.flatMap((project) => project.pdfList.map((pdf) => pdf.pdfLink));
    // Appeler la fonction de suppression d'images après avoir supprimé la série
    res.status(200).json({ message: 'Projet supprimé !' });
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
  }
};


/*------------------------
----- CREATE PROJECT -----
------------------------*/

exports.createProject = async (req, res) => {

    const projectData = req.body;
    const images = req.newImagesObjects;
    const pdfList = req.newPdfsObjects;
    const artistsList = JSON.parse(req.body.artistsList);
    const productionList = JSON.parse(req.body.productionList);
    const pressList = JSON.parse(req.body.pressList);
    const paragraphList = JSON.parse(req.body.paragraphList);
    const videoList = JSON.parse(req.body.videoList);
    const residenciesList = JSON.parse(req.body.residenciesList);
    const showsList = JSON.parse(req.body.showsList);
  
    const descriptionWithBr = req.body.description.replace(/(\r\n|\n|\r)/g, "<br>");

    const paragraphListWithBr = paragraphList.map((paragraph) => {
      const paragraphTextWithBr = paragraph.paragraphText.replace(/(\r\n|\n|\r)/g, "<br>");
      return {
          ...paragraph, // Spread des propriétés de paragraph
          paragraphText: paragraphTextWithBr // Modification de la propriété paragraphText
      };
    });

    const pressListWithBr = pressList.map((press) => {
      const quoteTextWithBr = press.quote.replace(/(\r\n|\n|\r)/g, "<br>");
      return {
          ...press, // Spread des propriétés de paragraph
          quote: quoteTextWithBr // Modification de la propriété paragraphText
      };
    });
  
    if (!projectData.title || !projectData.projectState) {
      return res.status(400).json({ error: 'Le champ "title" ou "state" est manquant dans la demande.' });
    }
  
    try {
      // if (serieImages.length === req.newImagesObjects.length) {
        // Si toutes les images ont été traitées, créez une nouvelle instance du modèle Serie
        const project = new Project({
          ... projectData,
          description: descriptionWithBr,
          artistsList: artistsList,
          productionList: productionList,
          pressList: pressListWithBr,
          paragraphList: paragraphListWithBr,
          videoList: videoList,
          residenciesList: residenciesList,
          showsList: showsList,
          images: images,
          pdfList: pdfList
        });
        await project.save();
        res.status(201).json({ message: 'Projet enregistrée !' });
      // }
    } catch (error) {
      console.error(error);
      res.status(400).json({ error });
    }
  };

/*--------------------------
----- UPDATE ONE PROJECT -----
--------------------------*/

exports.updateOneProject = async (req, res, next) => {

    // MODIFICATION DU PROJET
    try {
      // RÉCUPÉRATION DU PROJET CONCERNÉ VIA SON ID STOCKÉ EN PARAMÈTRES D'URL
      const project = await Project.findOne({ _id: req.params.id });

      // SI LE PROJET N'EXISTE PAS, ON RETOURNE UNE ERREUR 404
      if (!project) {
        return res.status(404).json({ error: 'Projet non trouvé' });
      }

      const projectData = req.body;
      const descriptionWithBr = req.body.description.replace(/(\r\n|\n|\r)/g, "<br>");
      const artistsList = JSON.parse(req.body.artistsList);
      const productionList = JSON.parse(req.body.productionList);
      const pressList = JSON.parse(req.body.pressList);
      const paragraphList = JSON.parse(req.body.paragraphList);
      const videoList = JSON.parse(req.body.videoList);
      const residenciesList = JSON.parse(req.body.residenciesList);
      const showsList = JSON.parse(req.body.showsList);
      
      const paragraphListWithBr = paragraphList.map((paragraph) => {
        const paragraphTextWithBr = paragraph.paragraphText.replace(/(\r\n|\n|\r)/g, "<br>");
        return {
            ...paragraph, // Spread des propriétés de paragraph
            paragraphText: paragraphTextWithBr // Modification de la propriété paragraphText
        };
      });
  
      const pressListWithBr = pressList.map((press) => {
        const quoteTextWithBr = press.quote.replace(/(\r\n|\n|\r)/g, "<br>");
        return {
            ...press, // Spread des propriétés de paragraph
            quote: quoteTextWithBr // Modification de la propriété paragraphText
        };
      });
      // RÉCUPÉRATION DES IMAGES EXISTANTES DEPUIS LE FRONTEND, PARSE DES DONNÉES
      const existingImages = req.body.existingImages || [];
      const existingImagesObjects = existingImages.map((imageStr) => JSON.parse(imageStr));
      
      // RÉCUPÉRATION DES PDFS EXISTANTES DEPUIS LE FRONTEND, PARSE DES DONNÉES
      const existingPdfs = req.body.existingPdfs || [];
      const existingPdfsObjects = existingPdfs.map((pdfStr) => JSON.parse(pdfStr));
  
      async function processAndSortImages(existingImagesObjects, newImagesObjects) {
        const allImages = existingImagesObjects.map((image, index) => ({
          imageUrl: image.imageUrl,
          index,
        })).concat(newImagesObjects);
        allImages.sort((a, b) => a.index - b.index);
        const updatedImages = allImages.filter((image) => image != null && image !== "empty");
        return updatedImages;
      }
  
      async function processAndSortPdfs(existingPdfsObjects, newPdfsObjects) {
        const allPdfs = existingPdfsObjects.concat(newPdfsObjects);
        const updatedPdfs = allPdfs.filter((pdf) => pdf != null && pdf !== "");
        return updatedPdfs;
      }
  
      // MISE À JOUR DE LA SÉRIE DANS LA BASE DE DONNÉES
      async function updateProject(updatedImages) {
        const updatedMainImageIndex = req.body.mainImageIndex || 0;

        if (!projectData.title || !projectData.projectState) {
          return res.status(400).json({ error: 'Le champ "title" ou "state" est manquant dans la demande.' });
        }
        
        const projectObject = {
          ...projectData,
          description: descriptionWithBr,
          artistsList: artistsList,
          productionList: productionList,
          pressList: pressListWithBr,
          paragraphList: paragraphListWithBr,
          videoList: videoList,
          residenciesList: residenciesList,
          showsList: showsList,
          mainImageIndex: updatedMainImageIndex,
          images: updatedImages,
          pdfList: updatedPdfs
        };
  
        await Project.updateOne({ _id: req.params.id }, projectObject);
        console.log('Project updated successfully');
        res.status(200).json({ message: 'Projet modifiée' });
        next();
        // À ce stade, vous pouvez appeler d'autres fonctions si nécessaire
      }
  
      const newImagesObjects = req.newImagesObjects || [];
      const newPdfsObjects = req.newPdfsObjects || [];

      const updatedImages = await processAndSortImages(existingImagesObjects, newImagesObjects);
      const updatedPdfs = await processAndSortPdfs(existingPdfsObjects, newPdfsObjects);

      await updateProject(updatedImages, updatedPdfs);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la série.' });
    }
  };
