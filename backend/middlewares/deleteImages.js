const { storage, bucket } = require('../config/storage');
const Project = require('../models/project')

async function deleteImageFiles(req) {
    // Obtenez la liste des URLs des images depuis Google Cloud Storage
    
    async function getCloudImageUrls() {
      const [files] = await bucket.getFiles({ prefix: 'project_images/' });
      return files.map((file) => `https://storage.googleapis.com/${bucket.name}/${file.name}`);
    }
      
    // Obtenez la liste des URLs des images depuis MongoDB
    async function getDbImageUrls() {
  
      // Récupérez toutes les séries depuis MongoDB
      const projects = await Project.find();
      const imageUrls = projects.flatMap((project) => project.projectImages.map((image) => decodeURIComponent(image.imageUrl.replace(/\+/g, ' '))));
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
              await bucket.file('project_images/' + fileToDeleteName).delete();
            }
          }
  
        } catch (error) {
          console.error(error.message);
        }
    }
  
async function deleteMoImageFiles(req) {
  // Obtenez la liste des URLs des images depuis Google Cloud Storage
  async function getCloudImageUrls() {
    const [files] = await bucket.getFiles({ prefix: 'makingOf_images/' });
    return files.map((file) => `https://storage.googleapis.com/${bucket.name}/${file.name}`);
  }
    
  // Obtenez la liste des URLs des images depuis MongoDB
  async function getDbImageUrls() {

    // Récupérez toutes les séries depuis MongoDB
    const projects = await Project.find();
    const imageUrls = projects.flatMap((project) => project.makingOfImages.map((image) => decodeURIComponent(image.imageUrl.replace(/\+/g, ' '))));
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
        await bucket.file('makingOf_images/' + fileToDeleteName).delete();
      }
    }

  } catch (error) {
    console.error(error.message);
  }
}

function deleteImages(req) {
    deleteImageFiles();
    deleteMoImageFiles();
}

module.exports = {
    deleteImages,
  };