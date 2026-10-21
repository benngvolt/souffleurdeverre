const Project = require('../models/project')

/* -----------------------------
Helper pour parser les champs JSON envoyés en FormData
----------------------------- */
function parseJsonField(value, fallback) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parseRequiredJsonList(value) {
  if (typeof value === 'object' && value !== null) return value;

  try {
    return JSON.parse(value);
  } catch {
    const error = new Error('Champ JSON invalide dans la requête.');
    error.status = 400;
    throw error;
  }
}

function parseLogoNames(value) {
  const names = parseJsonField(value, []);
  if (!Array.isArray(names)) return [];
  return [...new Set(names.filter((name) => typeof name === 'string' && name.trim()).map((name) => name.trim()))];
}

// Documents déjà enregistrés que le client conserve (JSON) : on ne garde que les champs attendus
function sanitizeDocuments(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((document) => document && typeof document.url === 'string' && document.url.trim())
    .map((document) => ({
      name: String(document.name || '').trim() || 'Document',
      url: document.url.trim(),
      size: Number.isFinite(Number(document.size)) ? Number(document.size) : undefined,
      mimeType: typeof document.mimeType === 'string' ? document.mimeType : '',
    }));
}

// Espace pro : documents conservés (envoyés en JSON) + documents tout juste uploadés (middleware uploadProDocuments)
function buildProSpace(rawProSpace, newDocuments = []) {
  const parsed = parseJsonField(rawProSpace, {});
  const documents = [...sanitizeDocuments(parsed.documents), ...newDocuments];
  const zipUrl = typeof parsed.zipUrl === 'string' ? parsed.zipUrl : '';

  return {
    // Sans aucun document (ni ancien ZIP), l'espace pro ne peut pas être affiché
    enabled: Boolean(parsed.enabled) && (documents.length > 0 || Boolean(zipUrl)),
    zipUrl,
    password: typeof parsed.password === 'string' ? parsed.password : '',
    documents,
  };
}

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


/*------------------------
----- GET ALL PROJECTS ---
-------------------------*/

exports.getAllProjects = (req, res) => {
    Project.find()
      .then (projects =>res.status(200).json(projects))
      .catch (error => {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des projets.' });
      })
  }

/*------------------------
----- GET ONE PROJECT ----
-------------------------*/

exports.getOneProject = (req, res) => {
  Project.findOne({_id: req.params.id})
    .then (project =>res.status(200).json(project))
    .catch (error => {
      console.error(error);
      res.status(400).json({ error: 'Erreur lors de la récupération du projet.' });
    })
}

/*------------------------
--- GET PROJECT BY SLUG --
-------------------------*/

exports.getOneProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const projects = await Project.find();

    const project = projects.find((project) => {
      return slugify(project.title) === slug;
    });

    if (!project) {
      return res.status(404).json({ message: 'Projet introuvable' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération du projet.' });
  }
};


/*--------------------------
----- DELETE ONE PROJECT -----
--------------------------*/

exports.deleteOneProject = async (req, res, next) => {
  try {
    const deletedProject = await Project.findOneAndDelete({ _id: req.params.id });
    if (!deletedProject) {
      return res.status(404).json({ message: 'Projet non trouvée' });
    }
    res.status(200).json({ message: 'Projet supprimé !' });
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
  }
};


/*------------------------
----- CREATE PROJECT -----
------------------------*/

exports.createProject = async (req, res) => {
  try {
    const projectData = req.body;
    const images = req.newImagesObjects;
    const pdfList = req.newPdfsObjects;
    const artistsList = parseRequiredJsonList(req.body.artistsList);
    const productionList = parseRequiredJsonList(req.body.productionList);
    const pressList = parseRequiredJsonList(req.body.pressList);
    const paragraphList = parseRequiredJsonList(req.body.paragraphList);
    const linksList = parseRequiredJsonList(req.body.linksList);
    const residenciesList = parseRequiredJsonList(req.body.residenciesList);
    const showsList = parseRequiredJsonList(req.body.showsList);
    const logos = parseLogoNames(req.body.logos);
    const proSpace = buildProSpace(req.body.proSpace, req.newProDocumentsObjects);

    if (!projectData.title || !projectData.projectState) {
      return res.status(400).json({ error: 'Le champ "title" ou "state" est manquant dans la demande.' });
    }

    const project = new Project({
      ...projectData,
      artistsList,
      productionList,
      pressList,
      paragraphList,
      linksList,
      residenciesList,
      showsList,
      logos,
      images,
      pdfList,
      proSpace
    });
    await project.save();
    // L'_id permet à l'éditeur de continuer à modifier le projet (PUT) sans en recréer un autre
    res.status(201).json({ message: 'Projet enregistrée !', _id: project._id });
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).json({ error: error.status ? error.message : 'Erreur lors de la création du projet.' });
  }
};

/*--------------------------
----- UPDATE ONE PROJECT -----
--------------------------*/

exports.updateOneProject = async (req, res, next) => {

    // MODIFICATION DU PROJET
    try {
      // RÉCUPÉRATION DU PROJET CONCERNÉ VIA SON ID STOCKÉ EN PARAMÈTRES D'URL
      const project = await Project.findOne({ _id: req.params.id });

      // SI LE PROJET N'EXISTE PAS, ON RETOURNE UNE ERREUR 404
      if (!project) {
        return res.status(404).json({ error: 'Projet non trouvé' });
      }

      const projectData = req.body;
      const artistsList = parseRequiredJsonList(req.body.artistsList);
      const productionList = parseRequiredJsonList(req.body.productionList);
      const pressList = parseRequiredJsonList(req.body.pressList);
      const paragraphList = parseRequiredJsonList(req.body.paragraphList);
      const linksList = parseRequiredJsonList(req.body.linksList);
      const residenciesList = parseRequiredJsonList(req.body.residenciesList);
      const showsList = parseRequiredJsonList(req.body.showsList);
      const proSpace = buildProSpace(req.body.proSpace, req.newProDocumentsObjects);

      // RÉCUPÉRATION DES IMAGES EXISTANTES DEPUIS LE FRONTEND, PARSE DES DONNÉES
      const existingImages = req.body.existingImages || [];
      const existingImagesObjects = existingImages.map((imageStr) => JSON.parse(imageStr));

      // RÉCUPÉRATION DES PDFS EXISTANTES DEPUIS LE FRONTEND, PARSE DES DONNÉES
      const existingPdfs = req.body.existingPdfs || [];
      const existingPdfsObjects = existingPdfs.map((pdfStr) => JSON.parse(pdfStr));

      const newImagesObjects = req.newImagesObjects || [];
      const newPdfsObjects = req.newPdfsObjects || [];

      const allImages = existingImagesObjects
        .map((image, index) => ({ imageUrl: image.imageUrl, index }))
        .concat(newImagesObjects);
      allImages.sort((a, b) => a.index - b.index);
      const updatedImages = allImages.filter((image) => image != null && image !== 'empty');

      const updatedPdfs = existingPdfsObjects
        .concat(newPdfsObjects)
        .filter((pdf) => pdf != null && pdf !== '');

      if (!projectData.title || !projectData.projectState) {
        return res.status(400).json({ error: 'Le champ "title" ou "state" est manquant dans la demande.' });
      }

      const projectObject = {
        ...projectData,
        artistsList,
        productionList,
        pressList,
        paragraphList,
        linksList,
        residenciesList,
        showsList,
        mainImageIndex: req.body.mainImageIndex || 0,
        images: updatedImages,
        pdfList: updatedPdfs,
        proSpace
      };

      // Les logos ne sont modifiés que si le client les envoie (évite de les vider par erreur)
      if (req.body.logos !== undefined) {
        projectObject.logos = parseLogoNames(req.body.logos);
      } else {
        delete projectObject.logos;
      }

      await Project.updateOne({ _id: req.params.id }, projectObject);
      res.status(200).json({ message: 'Projet modifiée' });
      next();

    } catch (error) {
      console.error(error);
      res.status(error.status || 500).json({ error: error.status ? error.message : 'Erreur lors de la mise à jour du projet.' });
    }
  };
