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

/*------------------------------------------------------------
----- SUPPRESSION DES IMAGES NON UTILISÉES DANS LE CLOUD -----
------------------------------------------------------------*/
    
async function deleteImageFiles(req, imageUrls, pdfLinks) {
  // Obtenez la liste des URLs des images depuis Google Cloud Storage
  
  async function getCloudImageUrls() {
    const [imagesFiles] = await bucket.getFiles();
    return imagesFiles.map((file) => `https://storage.googleapis.com/${bucket.name}/${file.name}`);
  }

  async function getCloudPdfLinks() {
    const [pdfFiles] = await bucket.getFiles({
      prefix: 'pdfList/',
    });
    return pdfFiles.map((file) => `https://storage.googleapis.com/${bucket.name}/${file.name}`);
  } 

  try {
    const [cloudImageUrls] = await Promise.all([getCloudImageUrls(), imageUrls]);
    const [cloudPdfLinks] = await Promise.all([getCloudPdfLinks(), pdfLinks]);
    const dbImageUrls = new Set(imageUrls);
    const dbPdfLinks = new Set(pdfLinks);
    const imagesToDelete = cloudImageUrls.filter((url) => !dbImageUrls.has(url));
    const pdfToDelete = cloudPdfLinks.filter((url) => !dbPdfLinks.has(url));

    const deleteImagesPromises = imagesToDelete.map(async (imageUrl) => {
      const parts = imageUrl.split('/');
      const fileToDeleteName = parts.pop();
      if (fileToDeleteName) {
        const fileToDelete = bucket.file(fileToDeleteName);
        const [exists] = await fileToDelete.exists();
        if (exists) {
          try {
            await fileToDelete.delete();
          } catch (error) {
            console.error(`Erreur lors de la suppression de ${fileToDeleteName}: ${error.message}`);
          }
        }
      }
    });

    const deletePdfPromises = pdfToDelete.map(async (pdfLink) => {
      const parts = pdfLink.split('/');
      const fileToDeleteName = parts.pop();
      if (fileToDeleteName) {
        const fileToDelete = bucket.file(`pdfList/${fileToDeleteName}`);
        const [exists] = await fileToDelete.exists();
        if (exists) {
          try {
            await fileToDelete.delete();
          } catch (error) {
            console.error(`Erreur lors de la suppression de ${fileToDeleteName}: ${error.message}`);
          }
        }
      }
    });

    await Promise.all([...deleteImagesPromises, ...deletePdfPromises]);


  } catch (error) {
    console.error(error.message);
  }
}

/*--------------------------
----- DELETE ONE PROJECT -----
--------------------------*/

exports.deleteOneProject = async (req, res) => {
  try {
    const deletedProject = await Project.findOneAndDelete({ _id: req.params.id });
    if (!deletedProject) {
      return res.status(404).json({ message: 'Projet non trouvée' });
    }
    const projects = await Project.find();
    const imageUrls = projects.flatMap((project) => project.images.map((image) => image.imageUrl));
    const pdfLinks = projects.flatMap((project) => project.pdfList.map((pdf) => pdf.pdfLink));
    // Appeler la fonction de suppression d'images après avoir supprimé la série
    await deleteImageFiles(req, imageUrls, pdfLinks);
    
    res.status(200).json({ message: 'Projet supprimé !' });
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
    const videoList = JSON.parse(req.body.videoList);
    const residenciesList = JSON.parse(req.body.residenciesList);
    const showsList = JSON.parse(req.body.showsList);

    console.log(pdfList);
  
    // const projectDescriptionWithBr = projectData.description.replace(/(\r\n|\n|\r)/g, "<br>");
  
    if (!projectData.title || !projectData.state) {
      return res.status(400).json({ error: 'Le champ "title" ou "state" est manquant dans la demande.' });
    }
  
    try {
      // if (serieImages.length === req.newImagesObjects.length) {
        // Si toutes les images ont été traitées, créez une nouvelle instance du modèle Serie
        const project = new Project({
          ... projectData,
          // description: projectDescriptionWithBr,
          artistsList: artistsList,
          productionList: productionList,
          pressList: pressList,
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

exports.updateOneProject = async (req, res) => {

    // MODIFICATION DU PROJET
    try {
      // RÉCUPÉRATION DU PROJET CONCERNÉ VIA SON ID STOCKÉ EN PARAMÈTRES D'URL
      const project = await Project.findOne({ _id: req.params.id });
      const projectData = req.body;
      // const images = req.newImagesObjects;
      const artistsList = JSON.parse(req.body.artistsList);
      const productionList = JSON.parse(req.body.productionList);
      const pressList = JSON.parse(req.body.pressList);
      const videoList = JSON.parse(req.body.videoList);
      const residenciesList = JSON.parse(req.body.residenciesList);
      const showsList = JSON.parse(req.body.showsList);
      // const projectDescriptionWithBr = projectData.description.replace(/(\r\n|\n|\r)/g, "<br>");
  
      // SI LE PROJET N'EXISTE PAS, ON RETOURNE UNE ERREUR 404
      if (!project) {
        return res.status(404).json({ error: 'Projet non trouvé' });
      }
  
      // RÉCUPÉRATION DES IMAGES EXISTANTES DEPUIS LE FRONTEND, PARSE DES DONNÉES
      const existingImages = req.body.existingImages || [];
      const existingImagesObjects = existingImages.map((imageStr) => JSON.parse(imageStr));
  
      // TRI DES IMAGES PAR ORDRE D'INDEX ET MISE À JOUR DE MAINIMAGEINDEX ET CONSTRUCTION DU TABLEAU IMAGES AVEC LES NOUVELLES IMAGES ET LES EXISTANTES
      async function processAndSortImages(existingImagesObjects, newImagesObjects) {
        const allImages = existingImagesObjects.map((image, index) => ({
          imageUrl: image.imageUrl,
          index,
        })).concat(newImagesObjects);
        allImages.sort((a, b) => a.index - b.index);
        const updatedImages = allImages.filter((image) => image != null && image !== "empty");
        return updatedImages;
      }
  
      // MISE À JOUR DE LA SÉRIE DANS LA BASE DE DONNÉES
      async function updateProject(updatedImages) {
        const updatedMainImageIndex = req.body.mainImageIndex || 0;

        const projectObject = {
          ...projectData,
          artistsList: artistsList,
          productionList: productionList,
          pressList: pressList,
          videoList: videoList,
          residenciesList: residenciesList,
          showsList: showsList,
          // description: projectDescriptionWithBr,
          mainImageIndex: updatedMainImageIndex,
          images: updatedImages
        };
  
        await Project.updateOne({ _id: req.params.id }, projectObject);
        console.log('Project updated successfully');
        res.status(200).json({ message: 'Projet modifiée' });
        // À ce stade, vous pouvez appeler d'autres fonctions si nécessaire
      }
  
      // Appel de la fonction de tri des images et de mise à jour
      processAndSortImages(existingImagesObjects, req.newImagesObjects)
        .then((updatedImages) => updateProject(updatedImages))
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de la mise à jour de la série.' });
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la série.' });
    }
  };
