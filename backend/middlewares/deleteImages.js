const { storage, bucket } = require('../config/storage');
const Project = require('../models/project')
const Biography = require('../models/biography')

async function deleteProjectImageFiles(req) {
    // Obtenez la liste des URLs des images depuis Google Cloud Storage
    
    async function getCloudImageUrls() {
      const [files] = await bucket.getFiles({ prefix: 'projects_images/' });
      return files.map((file) => `https://storage.googleapis.com/${bucket.name}/${file.name}`);
    }
      
    // Obtenez la liste des URLs des images depuis MongoDB
    async function getDbImageUrls() {
      // Récupérez toutes les séries depuis MongoDB
      const projects = await Project.find();
      const imageUrls = projects.flatMap((project) => project.images.map((image) => decodeURIComponent(image.imageUrl.replace(/\+/g, ' '))));
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

async function deleteProjectPdfFiles(req) {
  // Obtenez la liste des URLs des images depuis Google Cloud Storage
  
  async function getCloudPdfUrls() {
    const [files] = await bucket.getFiles({ prefix: 'pdfList/' });
    console.log(files.map((file) => `https://storage.googleapis.com/${bucket.name}/${file.name}`));
    return files.map((file) => `https://storage.googleapis.com/${bucket.name}/${file.name}`);
  }
    
  // Obtenez la liste des URLs des images depuis MongoDB
  async function getDbPdfUrls() {
    // Récupérez toutes les séries depuis MongoDB
    const projects = await Project.find();
    const pdfUrls = projects.flatMap((project) => project.pdfList.map((pdf) => decodeURIComponent(pdf.pdfLink.replace(/\+/g, ' '))));
    return pdfUrls;
  }

  try {
    const cloudPdfUrls = await getCloudPdfUrls(); // Utilisez "await" pour attendre la résolution de la promesse
    const dbPdfUrls = await getDbPdfUrls(); // Utilisez "await" pour attendre la résolution de la promesse
    const pdfToDelete = cloudPdfUrls.filter((url) => !dbPdfUrls.includes(url));
    // Suppression des images non référencées dans le cloud
    for (const pdfUrl of pdfToDelete) {
      // Divisez l'URL en parties en utilisant "/" comme séparateur
      const parts = pdfUrl.split('/');
      // Récupérez la dernière partie qui contient le nom du fichier
      const fileToDeleteName = parts.pop();
      if (fileToDeleteName) {
        await bucket.file('pdfList/' + fileToDeleteName).delete();
      }
    }

  } catch (error) {
    console.error(error.message);
  }
}
  
async function deleteBiographyImageFiles(req) {
  // Obtenez la liste des URLs des images depuis Google Cloud Storage
  async function getCloudImageUrls() {
    const [files] = await bucket.getFiles({ prefix: 'biographies_images/' });
    return files.map((file) => `https://storage.googleapis.com/${bucket.name}/${file.name}`);
  }
    
  // Obtenez la liste des URLs des images depuis MongoDB
  async function getDbImageUrls() {

    // Récupérez toutes les séries depuis MongoDB
    const biographies = await Biography.find();
    const imageUrls = biographies.flatMap((biography) => biography.bioImageUrl.replace(/\+/g, ' '));
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
        await bucket.file('biographies_images/' + fileToDeleteName).delete();
      }
    }

  } catch (error) {
    console.error(error.message);
  }
}

function deleteProjectFiles(req) {
  deleteProjectImageFiles();
  deleteProjectPdfFiles()
}


module.exports = {
    deleteProjectFiles,
    deleteBiographyImageFiles
  };