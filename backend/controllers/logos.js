const Logo = require('../models/logo');
const Project = require('../models/project');

const DUPLICATE_KEY_ERROR = 11000;

// Champs communs à la création et à la modification (reçus en FormData : les booléens arrivent en texte)
function readLogoFields(body) {
  const name = (body.name || '').trim();

  return {
    name,
    altText: (body.altText || '').trim() || name,
    linkUrl: (body.linkUrl || '').trim(),
    isOnCompanyPage: body.isOnCompanyPage === true || body.isOnCompanyPage === 'true',
  };
}

/*---------------------
----- GET ALL LOGOS ---
---------------------*/

exports.getAllLogos = async (req, res) => {
  try {
    const logos = await Logo.find().sort({ name: 1 }).collation({ locale: 'fr', strength: 1 });
    return res.status(200).json(logos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des logos.' });
  }
};

/*---------------------
----- CREATE LOGO -----
---------------------*/

exports.createLogo = async (req, res, next) => {
  try {
    const fields = readLogoFields(req.body);

    if (!fields.name || !req.logoImageUrl) {
      req.oldLogoImageUrl = req.logoImageUrl; // upload éventuel devenu inutile
      res.status(400).json({ error: 'Le nom et l’image du logo sont obligatoires.' });
      return next();
    }

    const logo = new Logo({
      ...fields,
      imageUrl: req.logoImageUrl,
    });

    await logo.save();
    res.status(201).json({ message: 'Logo enregistré !' });
    return next();
  } catch (error) {
    req.oldLogoImageUrl = req.logoImageUrl; // l'image uploadée n'est référencée nulle part
    if (error.code === DUPLICATE_KEY_ERROR) {
      res.status(409).json({ error: 'Un logo porte déjà ce nom.' });
    } else {
      console.error(error);
      res.status(400).json({ error: 'Erreur lors de la création du logo.' });
    }
    return next();
  }
};

/*---------------------
----- UPDATE LOGO -----
---------------------*/

exports.updateOneLogo = async (req, res, next) => {
  let saved = false;

  try {
    const logo = await Logo.findById(req.params.id);

    if (!logo) {
      req.oldLogoImageUrl = req.logoImageUrl;
      res.status(404).json({ error: 'Logo introuvable.' });
      return next();
    }

    const previousName = logo.name;
    const previousImageUrl = logo.imageUrl;
    const { name, ...otherFields } = readLogoFields(req.body);

    if (!name) {
      req.oldLogoImageUrl = req.logoImageUrl;
      res.status(400).json({ error: 'Le nom du logo est obligatoire.' });
      return next();
    }

    logo.name = name;
    logo.altText = otherFields.altText || name;
    logo.linkUrl = otherFields.linkUrl;
    logo.isOnCompanyPage = otherFields.isOnCompanyPage;
    if (req.logoImageUrl) {
      logo.imageUrl = req.logoImageUrl;
    }

    await logo.save();
    saved = true;

    // Les projets référencent les logos par leur nom : on répercute le renommage.
    if (name !== previousName) {
      await Project.updateMany(
        { logos: previousName },
        { $set: { 'logos.$[renamed]': name } },
        { arrayFilters: [{ renamed: previousName }] }
      );
    }

    if (req.logoImageUrl && previousImageUrl && previousImageUrl !== req.logoImageUrl) {
      req.oldLogoImageUrl = previousImageUrl;
    }

    res.status(200).json({ message: 'Logo modifié !' });
    return next();
  } catch (error) {
    if (!saved) {
      req.oldLogoImageUrl = req.logoImageUrl; // la nouvelle image n'a pas été enregistrée
    }
    if (error.code === DUPLICATE_KEY_ERROR) {
      res.status(409).json({ error: 'Un logo porte déjà ce nom.' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du logo.' });
    }
    return next();
  }
};

/*---------------------
----- DELETE LOGO -----
---------------------*/

exports.deleteOneLogo = async (req, res, next) => {
  try {
    const deletedLogo = await Logo.findOneAndDelete({ _id: req.params.id });

    if (!deletedLogo) {
      return res.status(404).json({ error: 'Logo introuvable.' });
    }

    // Retire le logo supprimé de tous les projets qui l'affichaient.
    await Project.updateMany({ logos: deletedLogo.name }, { $pull: { logos: deletedLogo.name } });

    req.oldLogoImageUrl = deletedLogo.imageUrl;

    res.status(200).json({ message: 'Logo supprimé !' });
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur lors de la suppression du logo.' });
  }
};
