const { storage, bucket } = require('../config/storage');
 // should be your bucket name
const sharp = require('sharp')
const { format } = require('url'); 


function uploadImages(req, res, next) {
    
    const newImagesObjects = [];
    const fileIndexes = req.body.fileIndexes;
    const files = req.files.images;

    if (!files || files.length === 0) {
      // Aucune image n'a été téléchargée, appeler next() et sortir de la fonction
      return next();
    }
    // Créez un tableau de promesses pour gérer chaque fichier individuellement
    const uploadPromises = files.map( (file, index) => {
      return new Promise(async(resolve, reject) => {
        try {
          const { originalname, buffer } = file;
    
          // Redimensionnez et convertissez l'image avec Sharp
          const resizedImageBuffer = await sharp(buffer)
            .resize({
              width: 1500,
              fit: 'cover',
              kernel: 'lanczos3',
            })
            .toFormat('webp')
            .toBuffer();
    
          // Créez un blob dans le stockage Google Cloud Storage
          const blob = bucket.file(originalname);
          const blobStream = blob.createWriteStream({
            resumable: false
          });
    
          blobStream.on('finish', () => {
            const publicUrl = format(
              `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            );
    
            // Pousser les données dans le tableau newImagesObject
            if (fileIndexes) {
              newImagesObjects.push({
                imageUrl: publicUrl,
                index: JSON.parse(fileIndexes[index])
              });
            } else {
              newImagesObjects.push({
                imageUrl: publicUrl,
              });
            }
  
            // Continuer avec la prochaine promesse
            resolve(publicUrl);
          }).on('error', () => {
            reject(`Unable to upload image: ${originalname}`);
          }).end(resizedImageBuffer);
        } catch (error) {
          // Gérez les erreurs ici...
          reject(`Unable to process image: ${file.originalname}`);
        }
      })
    });

    // Utilisez Promise.all pour attendre que toutes les promesses d'upload se terminent
    Promise.all(uploadPromises)
      .then(() => {
        // Stockez newImagesObjects dans l'objet req pour qu'il soit disponible dans le contrôleur
        req.newImagesObjects = newImagesObjects;
        next(); // Passez au middleware suivant ou à la route
      })
      .catch((error) => {
        // Gérez les erreurs ici...
        res.status(500).json({ error: 'Erreur lors du traitement des images.' });
      });
  };



  function uploadPdfs(req, res, next) {
    
    const newPdfsObjects = [];
    const pdfFileIndexes = req.body.pdfFileIndexes;
    const files = req.files.pdfFiles;
    const pdfName = req.body.pdfName;
  
    if (!files || files.length === 0) {
      // Aucune image n'a été téléchargée, appeler next() et sortir de la fonction
      return next();
    }
  
    // Créez un tableau de promesses pour gérer chaque fichier individuellement
    const uploadPromises = files.map( (file, index) => {
      return new Promise(async(resolve, reject) => {
        try {
          const { originalname, buffer } = file;
    
          // Créez un blob dans le stockage Google Cloud Storage
          const blob = bucket.file('pdfList/' + originalname);
          const blobStream = blob.createWriteStream({
            resumable: false
          });
  
          blobStream.on('finish', () => {
            console.log('étape ok');
            const publicUrl = format(
              `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            );
            
            
            // Pousser les données dans le tableau newImagesObject
            if (pdfFileIndexes) {
              newPdfsObjects.push({
                pdfLink: publicUrl,
                pdfName: pdfName[index],
                index: JSON.parse(pdfFileIndexes[index])
              });
            } else {
              newPdfsObjects.push({
                pdfLink: publicUrl,
                pdfName: pdfName[index],
              });
            }

            console.log(newPdfsObjects);
  
            // Continuer avec la prochaine promesse
            resolve(publicUrl);
          }).on('error', () => {
            reject(`Unable to upload pdf: ${originalname}`);
          }).end(buffer);
        } catch (error) {
          // Gérez les erreurs ici...
          reject(`Unable to process pdf: ${file.originalname}`);
        }
      })
    });

    // Utilisez Promise.all pour attendre que toutes les promesses d'upload se terminent
    Promise.all(uploadPromises)
      .then(() => {
        // Stockez newImagesObjects dans l'objet req pour qu'il soit disponible dans le contrôleur
        req.newPdfsObjects = newPdfsObjects;
        next(); // Passez au middleware suivant ou à la route
      })
      .catch((error) => {
        // Gérez les erreurs ici...
        res.status(500).json({ error: 'Erreur lors du traitement des pdfs.' });
      });
  };



  function uploadImage(req, res, next) {
    try {
      if (!req.file) {
        next(); // Pas de fichier, passez directement au contrôleur suivant
      } else if (req.file) {
        const file = req.file;
        const { originalname, buffer } = file;
      
        // Redimensionnez et convertissez l'image avec Sharp
        sharp(buffer)
          .resize({
            width: 1500,
            fit: 'cover',
            kernel: 'lanczos3',
          })
          .toFormat('webp')
          .toBuffer()
          .then((resizedImageBuffer) => {
            // Créez un blob dans le stockage Google Cloud Storage
            const blob = bucket.file(originalname);
            const blobStream = blob.createWriteStream({
              resumable: false
            });
    
            blobStream.on('finish', () => {
              const publicUrl = format(
                `https://storage.googleapis.com/${bucket.name}/${blob.name}`
              );
    
              // Stockez l'URL de l'image dans req
              req.imageUrl = publicUrl;
              next(); // Passez au middleware suivant ou à la route
            }).on('error', (error) => {
              console.error(error);
              res.status(500).json({ error: `Unable to upload image: ${originalname}` });
            }).end(resizedImageBuffer);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({ error: `Unable to process image: ${file.originalname}` });
          });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors du traitement de l\'image.' });
    }
  }

  module.exports = {
    uploadImages,
    uploadImage,
    uploadPdfs,
  };