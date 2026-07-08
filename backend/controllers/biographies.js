// const Biography = require('../models/biography');
// const { storage, bucket } = require('../config/storage');

// /*------------------------------
// ----- DELETE ONE BIOGRAPHY -----
// ------------------------------*/

// exports.deleteOneBiography = async (req, res, next) => {
//   try {
//     const deletedBiography = await Biography.findOneAndDelete({ _id: req.params.id });

//     if (!deletedBiography) {
//       return res.status(404).json({ message: 'Bio non trouvée' });
//     }

//     if (deletedBiography.bioImageUrl) {
//       req.oldBioImageUrl = deletedBiography.bioImageUrl;
//     }

//     res.status(200).json({ message: 'Bio supprimée !' });
//     return next();
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Erreur lors de la suppression de la bio.' });
//   }
// };

// /*--------------------------
// ----- CREATE BIOGRAPHY -----
// --------------------------*/

// exports.createBiography = async (req, res, next) => {
//   try {
//     const biographyData = req.body;

//     if (
//       !biographyData.surname ||
//       !biographyData.name ||
//       !biographyData.role ||
//       !biographyData.field
//     ) {
//       return res.status(400).json({
//         error: 'Tous les champs obligatoires ne sont pas remplis.'
//       });
//     }

//     const biography = new Biography({
//       surname: biographyData.surname,
//       name: biographyData.name,
//       role: biographyData.role,
//       field: biographyData.field,
//       biography: biographyData.biography || '',
//       linkUrl: biographyData.linkUrl || '',
//       bioImageUrl: req.imageUrl || null,
//     });

//     await biography.save();

//     res.status(201).json({ message: 'Biographie enregistrée !' });
//     return next();
//   } catch (error) {
//     console.error(error);
//     return res.status(400).json({ error: 'Erreur lors de la création de la biographie.' });
//   }
// };

// /*-----------------------------
// ----- GET ALL BIOGRAPHIES -----
// -----------------------------*/

// exports.getAllBiographies = async (req, res) => {
//   try {
//     const biographies = await Biography.find();
//     return res.status(200).json(biographies);
//   } catch (error) {
//     console.error(error);
//     return res.status(400).json({ error: 'Erreur lors de la récupération des biographies.' });
//   }
// };

// /*----------------------------
// ----- GET ONE BIOGRAPHY -----
// ----------------------------*/

// exports.getOneBiography = async (req, res) => {
//   try {
//     const biography = await Biography.findById(req.params.id);

//     if (!biography) {
//       return res.status(404).json({
//         message: 'Aucune biographie trouvée.'
//       });
//     }

//     return res.status(200).json(biography);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       error: 'Erreur serveur lors de la recherche de la biographie.'
//     });
//   }
// };

// /*-----------------------------
// ----- UPDATE ONE BIOGRAPHY -----
// -----------------------------*/

// exports.updateOneBiography = async (req, res, next) => {
//   try {
//     const biography = await Biography.findById(req.params.id);

//     if (!biography) {
//       return res.status(404).json({
//         message: 'Aucune biographie trouvée.'
//       });
//     }

//     const biographyData = {
//       surname: req.body.surname,
//       name: req.body.name,
//       role: req.body.role,
//       field: req.body.field,
//       biography: req.body.biography,
//       linkUrl: req.body.linkUrl,
//       bioImageUrl: req.imageUrl || biography.bioImageUrl,
//     };

//     await Biography.updateOne(
//       { _id: req.params.id },
//       { $set: biographyData }
//     );

//     if (req.imageUrl && biography.bioImageUrl && req.imageUrl !== biography.bioImageUrl) {
//       req.oldBioImageUrl = biography.bioImageUrl;
//     }

//     res.status(200).json({
//       message: 'Biographie modifiée !'
//     });

//     return next();
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       error: 'Erreur serveur lors de la mise à jour de la biographie.'
//     });
//   }
// };

const Biography = require('../models/biography');
const { storage, bucket } = require('../config/storage');

/*------------------------------
----- DELETE ONE BIOGRAPHY -----
------------------------------*/

exports.deleteOneBiography = async (req, res, next) => {
  try {
    const deletedBiography = await Biography.findOneAndDelete({ _id: req.params.id });

    if (!deletedBiography) {
      return res.status(404).json({ message: 'Bio non trouvée' });
    }

    if (deletedBiography.bioImageUrl) {
      req.oldBioImageUrl = deletedBiography.bioImageUrl;
    }

    res.status(200).json({ message: 'Bio supprimée !' });
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur lors de la suppression de la bio.' });
  }
};

/*--------------------------
----- CREATE BIOGRAPHY -----
--------------------------*/

exports.createBiography = async (req, res, next) => {
  try {
    const biographyData = req.body;

    if (
      !biographyData.surname ||
      !biographyData.name ||
      !biographyData.role ||
      !biographyData.field
    ) {
      return res.status(400).json({
        error: 'Tous les champs obligatoires ne sont pas remplis.'
      });
    }

    const biography = new Biography({
      surname: biographyData.surname,
      name: biographyData.name,
      role: biographyData.role,
      field: biographyData.field,
      biography: biographyData.biography || '',
      linkUrl: biographyData.linkUrl || '',
      bioImageUrl: req.imageUrl || null,
      isPermanentTeam: biographyData.isPermanentTeam === 'true',
    });

    await biography.save();

    res.status(201).json({ message: 'Biographie enregistrée !' });
    return next();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Erreur lors de la création de la biographie.' });
  }
};

/*-----------------------------
----- GET ALL BIOGRAPHIES -----
-----------------------------*/

exports.getAllBiographies = async (req, res) => {
  try {
    const biographies = await Biography.find();
    return res.status(200).json(biographies);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Erreur lors de la récupération des biographies.' });
  }
};

/*----------------------------
----- GET ONE BIOGRAPHY -----
----------------------------*/

exports.getOneBiography = async (req, res) => {
  try {
    const biography = await Biography.findById(req.params.id);

    if (!biography) {
      return res.status(404).json({
        message: 'Aucune biographie trouvée.'
      });
    }

    return res.status(200).json(biography);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Erreur serveur lors de la recherche de la biographie.'
    });
  }
};

/*-----------------------------
----- UPDATE ONE BIOGRAPHY -----
-----------------------------*/

exports.updateOneBiography = async (req, res, next) => {
  try {
    const biography = await Biography.findById(req.params.id);

    if (!biography) {
      return res.status(404).json({
        message: 'Aucune biographie trouvée.'
      });
    }

    const biographyData = {
      surname: req.body.surname,
      name: req.body.name,
      role: req.body.role,
      field: req.body.field,
      biography: req.body.biography,
      linkUrl: req.body.linkUrl,
      bioImageUrl: req.imageUrl || biography.bioImageUrl,
      isPermanentTeam: req.body.isPermanentTeam === 'true',
    };

    await Biography.updateOne(
      { _id: req.params.id },
      { $set: biographyData }
    );

    if (req.imageUrl && biography.bioImageUrl && req.imageUrl !== biography.bioImageUrl) {
      req.oldBioImageUrl = biography.bioImageUrl;
    }

    res.status(200).json({
      message: 'Biographie modifiée !'
    });

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Erreur serveur lors de la mise à jour de la biographie.'
    });
  }
};