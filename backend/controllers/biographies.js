const Biography = require('../models/biography')

/*--------------------------
----- CREATE BIOGRAPHY -----
--------------------------*/

exports.createBiography = async (req, res) => {

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

    const biographyData = {
      ... req.body,
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