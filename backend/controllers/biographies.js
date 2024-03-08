const Biography = require('../models/biography')
const { storage, bucket } = require('../config/storage');

async function deleteImageFile(bioImageUrl) {
  
  // Obtenez la liste des URLs des images depuis Google Cloud Storage
  async function getCloudImageUrls() {
    const [files] = await bucket.getFiles();
    return files.map((file) => `https://storage.googleapis.com/${bucket.name}/${file.name}`);
  }
    
  // Obtenez la liste des URLs des images depuis MongoDB

  try {
    const cloudImageUrls = await getCloudImageUrls();
    const dbImageUrl = bioImageUrl;
    
    // Suppression des images non référencées dans le cloud
    const imagesToDelete = cloudImageUrls.filter((url) => !dbImageUrl.includes(url));

    for (const imageUrl of imagesToDelete) {
      // Divisez l'URL en parties en utilisant "/" comme séparateur
      const parts = imageUrl.split('/');
      // Récupérez la dernière partie qui contient le nom du fichier
      const fileToDeleteName = parts.pop();
      if (fileToDeleteName) {
        await bucket.file(fileToDeleteName).delete();
      }
    }

  } catch (error) {
    console.error(error.message);
  }
}

/*------------------------------
----- DELETE ONE BIOGRAPHY -----
------------------------------*/

exports.deleteOneBiography = async (req, res) => {
  try {
    const biography = await Biography.findOne ({ _id: req.params.id });
    const bioImageUrl = biography.bioImageUrl; 
    const deletedBiography = await Biography.findOneAndDelete({ _id: req.params.id });
    if (!deletedBiography) {
      return res.status(404).json({ message: 'Bio non trouvée' });
    }

    // Appeler la fonction de suppression d'images après avoir supprimé la série
    await deleteImageFile(bioImageUrl);
    
    res.status(200).json({ message: 'Bio supprimée !' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la série' });
  }
};

/*--------------------------
----- CREATE BIOGRAPHY -----
--------------------------*/


exports.createBiography = async (req, res) => {

    const biographyWithBr = req.body.biography.replace(/(\r\n|\n|\r)/g, "<br>");
    const biographyData = req.body;
    const imageUrl = req.imageUrl;
    // const biographyWithBr = biographyData.biography.replace(/(\r\n|\n|\r)/g, "<br>");
    

    if (!biographyData.surname || !biographyData.name || !biographyData.role || !biographyData.biography) {
      return res.status(400).json({ error: 'Tous les champs ne sont pas remplis' });
    }
  
    try {
      // if (serieImages.length === req.newImagesObjects.length) {
        // Si toutes les images ont été traitées, créez une nouvelle instance du modèle Serie
        const biography = new Biography({
          ... biographyData,
          biography: biographyWithBr,
          bioImageUrl: imageUrl,
        });
  
        await biography.save();
        res.status(201).json({ message: 'Biographie enregistrée !' });
      // }
    } catch (error) {
      console.error(error);
      res.status(400).json({ error });
    }
  };

  exports.getAllBiographies = async (req, res) => {
    Biography.find()
      .then(biographies => res.status(200).json(biographies)) // status 200 'OK'
      .catch(error =>{
        console.log(error);
        res.status(400).json({ error }); // status 400 'Bad Request' > pour indiquer une erreur côté client
      });
  };

  exports.getOneBiography = (req, res) => {
    Biography.findOne({ surname: req.params.id })
      .then(biography => {
        if (!biography) {
          // Aucune correspondance trouvée, renvoyer une réponse appropriée
          return res.status(404).json({ message: 'Aucune biographie trouvée pour le nom de famille spécifié.' });
        }

        // Correspondance trouvée, renvoyer la biographie
        res.status(200).json(biography);
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la recherche de la biographie.' });
      });
  };

  exports.updateOneBiography = (req, res) => {

    const biographyWithBr = req.body.biography.replace(/(\r\n|\n|\r)/g, "<br>");
    const biographyData = {
      ... req.body,
      biography: biographyWithBr,
      bioImageUrl: req.imageUrl,
    }

    Biography.findOne({ _id: req.params.id })
      .then(biography => {
        if (!biography) {
          // Aucune correspondance trouvée, renvoyer une réponse appropriée
          return res.status(404).json({ message: 'Aucune biographie trouvée pour le nom de famille spécifié.' });
        }
        
        Biography.updateOne({ _id: req.params.id }, biographyData)
              .then(() => {
                  res.status(200).json({ message: 'Evènement modifiée!' });
              })
              .catch(error => {
                  res.status(400).json({ error });
                  console.log(error);
              });

       
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la recherche de la biographie.' });
      });
  };