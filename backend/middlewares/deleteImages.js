const { bucket } = require('../config/storage');
const Project = require('../models/project')

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

  // Documents de l'espace pro retirés d'un projet (ou projet supprimé) : on les efface du bucket
  async function deleteProjectProDocumentFiles() {
    try {
      const [cloudFiles] = await bucket.getFiles({ prefix: 'pro_space_documents/' });
      const projects = await Project.find();

      const referencedUrls = new Set(
        projects
          .flatMap((project) => project?.proSpace?.documents || [])
          .map((document) => document?.url)
          .filter(Boolean)
          .map((url) => decodeURIComponent(url.replace(/\+/g, ' ')))
      );

      for (const file of cloudFiles) {
        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

        if (!referencedUrls.has(fileUrl)) {
          await bucket.file(file.name).delete({ ignoreNotFound: true });
        }
      }
    } catch (error) {
      console.error('Erreur suppression documents espace pro :', error.message);
    }
  }

  async function deleteProjectZipFiles(req) {
    async function getCloudZipUrls() {
      const [files] = await bucket.getFiles({ prefix: 'pro_space_zips/' });

      return files.map((file) =>
        `https://storage.googleapis.com/${bucket.name}/${file.name}`
      );
    }

    async function getDbZipUrls() {
      const projects = await Project.find();

      const zipUrls = projects
        .map((project) => project?.proSpace?.zipUrl)
        .filter(Boolean)
        .map((zipUrl) => decodeURIComponent(zipUrl.replace(/\+/g, ' ')));

      return zipUrls;
    }

    try {
      const cloudZipUrls = await getCloudZipUrls();
      const dbZipUrls = await getDbZipUrls();

      const zipsToDelete = cloudZipUrls.filter(
        (url) => !dbZipUrls.includes(url)
      );

      for (const zipUrl of zipsToDelete) {
        const filePath = extractFilePathFromGcsUrl(zipUrl);

        if (filePath) {
          await bucket.file(filePath).delete({ ignoreNotFound: true });
        }
      }
    } catch (error) {
      console.error('Erreur suppression ZIP projet :', error.message);
    }
  }
  
/* -----------------------------
   Helpers
----------------------------- */

function extractFilePathFromGcsUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string') {
    return null;
  }

  const baseUrl = `https://storage.googleapis.com/${bucket.name}/`;

  if (!fileUrl.startsWith(baseUrl)) {
    return null;
  }

  return fileUrl.replace(baseUrl, '');
}

/* -----------------------------------
   Delete only targeted biography image
----------------------------------- */

async function deleteBiographyImageFiles(req, res, next) {
  try {
    const imageUrlToDelete = req.oldBioImageUrl;

    if (!imageUrlToDelete) {
      return next();
    }

    const filePath = extractFilePathFromGcsUrl(imageUrlToDelete);

    if (!filePath) {
      return next();
    }

    await bucket.file(filePath).delete({ ignoreNotFound: true });

    return next();
  } catch (error) {
    console.error('Erreur suppression image biographie :', error.message);
    return next();
  }
}

/* -------------------------------
   Delete a replaced/removed logo image
------------------------------- */

async function deleteLogoImageFile(req, res, next) {
  try {
    const filePath = extractFilePathFromGcsUrl(req.oldLogoImageUrl);

    if (filePath) {
      await bucket.file(filePath).delete({ ignoreNotFound: true });
    }
  } catch (error) {
    console.error('Erreur suppression image logo :', error.message);
  }

  return next();
}


function deleteProjectFiles(req) {
  deleteProjectImageFiles();
  deleteProjectPdfFiles();
  deleteProjectProDocumentFiles();
  deleteProjectZipFiles()
}


module.exports = {
    deleteProjectFiles,
    deleteBiographyImageFiles,
    deleteLogoImageFile
  };