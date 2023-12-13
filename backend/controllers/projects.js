const Project = require('../models/project')

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

/*------------------------
----- CREATE PROJECT -----
------------------------*/

exports.createProject = async (req, res) => {

    const projectData = req.body;
    const images = req.newImagesObjects;
    const projectDescriptionWithBr = projectData.description.replace(/(\r\n|\n|\r)/g, "<br>");
  
    if (!projectData.title || !images) {
      return res.status(400).json({ error: 'Le champ "title" ou "images" est manquant dans la demande.' });
    }
  
    try {
      // if (serieImages.length === req.newImagesObjects.length) {
        // Si toutes les images ont été traitées, créez une nouvelle instance du modèle Serie
        const project = new Project({
          ... projectData,
          description: projectDescriptionWithBr,
          images: images,
        });
  
        await project.save();
        res.status(201).json({ message: 'Projet enregistrée !' });
      // }
    } catch (error) {
      console.error(error);
      res.status(400).json({ error });
    }
  };

/*----------------------------
----- DELETE ONE PROJECT -----
----------------------------*/

exports.deleteOneProject = async (req, res) => {
    try {
      const deletedProject = await Project.findOneAndDelete({ _id: req.params.id });
      if (!deletedProject) {
        return res.status(404).json({ message: 'Projet non trouvé' });
      }
  
      // Appeler la fonction de suppression d'images après avoir supprimé la série
      await deleteImageFiles(req);
      
      res.status(200).json({ message: 'Projet supprimé !' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
    }
  }
    
async function deleteImageFiles(req) {
    // Obtenez la liste des URLs des images depuis Google Cloud Storage
    async function getCloudImageUrls() {
      const [files] = await bucket.getFiles({ prefix: 'projects_images/' });
      return files.map((file) => `https://storage.googleapis.com/${bucket.name}/${file.name}`);
    }
      
    // Obtenez la liste des URLs des images depuis MongoDB
    async function getDbImageUrls() {
  
      // Récupérez toutes les séries depuis MongoDB
      const projects = await Project.find();
      const imageUrls = projects.flatMap((project) => project.images.map((image) => image.imageUrl));
      return imageUrls;
    }
      
        try {
          const cloudImageUrls = await getCloudImageUrls(); // Utilisez "await" pour attendre la résolution de la promesse
          const dbImageUrls = await getDbImageUrls(); // Utilisez "await" pour attendre la résolution de la promesse
          const imagesToDelete = cloudImageUrls.filter((url) => !dbImageUrls.includes(url));
    
          // Suppression des images non référencées dans le cloud
          for (const imageUrl of imagesToDelete) {
            // Divisez l'URL en parties en utilisant "/" comme séparateur
            const parts = imageUrl.split('/');
            // Récupérez la dernière partie qui contient le nom du fichier
            const fileToDeleteName = parts.pop();
            if (fileToDeleteName) {
              await bucket.file('projects_images/' + fileToDeleteName).delete();
            }
          }
  
        } catch (error) {
          console.error(error.message);
        }
    }

/*--------------------------
----- UPDATE ONE SERIE -----
--------------------------*/

exports.updateOneProject = async (req, res) => {

    // MODIFICATION DU PROJET
    try {
      // RÉCUPÉRATION DU PROJET CONCERNÉ VIA SON ID STOCKÉ EN PARAMÈTRES D'URL
      const project = await Project.findOne({ _id: req.params.id });
      const projectData = req.body;
      const projectDescriptionWithBr = projectData.description.replace(/(\r\n|\n|\r)/g, "<br>");
  
      // SI LA SÉRIE N'EXISTE PAS, ON RETOURNE UNE ERREUR 404
      if (!project) {
        return res.status(404).json({ error: 'Projet non trouvée' });
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
          description: projectDescriptionWithBr,
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
