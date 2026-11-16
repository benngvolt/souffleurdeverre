const mongoose = require('mongoose');
const Dossier = require('../models/dossier');

/* Brouillons de dossier artistique : toutes les routes sont réservées à l'administrateur connecté
   (jamais exposées publiquement). */

const LIMITS = {
  name: 120,
  pages: 60,
  title: 200,
  html: 60000,
  url: 1000,
  teamMembers: 200,
};
const PAGE_TYPES = ['text', 'photos'];
const ALIGNS = ['top', 'center', 'bottom'];
const PHOTOS_PER_PAGE = 3;

class ValidationError extends Error {}

function fail(message) {
  throw new ValidationError(message);
}

function validPhoto(value, where) {
  if (!value || typeof value !== 'object') fail(`${where} : photo invalide.`);
  const imageUrl = value.imageUrl === undefined || value.imageUrl === null ? '' : value.imageUrl;
  if (typeof imageUrl !== 'string' || imageUrl.length > LIMITS.url) fail(`${where} : adresse de photo invalide.`);
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) fail(`${where} : adresse de photo invalide.`);

  const clamp = (n) => {
    const number = Number(n);
    return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 50;
  };

  return { imageUrl, x: clamp(value.x), y: clamp(value.y) };
}

function validName(value) {
  if (typeof value !== 'string' || !value.trim()) fail('Le nom du brouillon est obligatoire.');
  if (value.trim().length > LIMITS.name) fail(`Le nom du brouillon est limité à ${LIMITS.name} caractères.`);
  return value.trim();
}

/* Vérifie et nettoie le contenu envoyé par l'éditeur (jamais de confiance dans le client) */
function validContent(body) {
  const cover = validPhoto(body.cover || {}, 'Couverture');

  if (!Array.isArray(body.middle)) fail('La partie centrale est invalide.');
  if (body.middle.length > LIMITS.pages) fail(`Un dossier est limité à ${LIMITS.pages} pages dans la partie centrale.`);

  const seen = new Set();
  const middle = body.middle.map((page, index) => {
    const where = `Page ${index + 1}`;
    if (!page || typeof page !== 'object') fail(`${where} : page invalide.`);
    if (typeof page.pageId !== 'string' || !page.pageId || page.pageId.length > 80) fail(`${where} : identifiant invalide.`);
    if (seen.has(page.pageId)) fail(`${where} : identifiant en double.`);
    seen.add(page.pageId);
    if (!PAGE_TYPES.includes(page.type)) fail(`${where} : type de page inconnu.`);

    if (page.type === 'text') {
      const title = page.title === undefined || page.title === null ? '' : page.title;
      const html = page.html === undefined || page.html === null ? '' : page.html;
      if (typeof title !== 'string' || title.length > LIMITS.title) fail(`${where} : titre invalide ou trop long.`);
      if (typeof html !== 'string' || html.length > LIMITS.html) fail(`${where} : texte trop long (${LIMITS.html} caractères maximum).`);
      const align = page.align === undefined ? 'top' : page.align;
      if (!ALIGNS.includes(align)) fail(`${where} : position du texte invalide.`);
      return { pageId: page.pageId, type: 'text', title, html, align, slots: [] };
    }

    if (!Array.isArray(page.slots) || page.slots.length !== PHOTOS_PER_PAGE) {
      fail(`${where} : une page photo contient exactement ${PHOTOS_PER_PAGE} emplacements.`);
    }
    return {
      pageId: page.pageId,
      type: 'photos',
      title: '',
      html: '',
      align: 'top',
      slots: page.slots.map((slot, slotIndex) => validPhoto(slot, `${where}, photo ${slotIndex + 1}`)),
    };
  });

  const teamOrder = body.teamOrder === undefined ? [] : body.teamOrder;
  if (!Array.isArray(teamOrder) || teamOrder.length > LIMITS.teamMembers) fail("L'ordre de l'équipe est invalide.");
  if (!teamOrder.every((id) => mongoose.isValidObjectId(id))) fail("L'ordre de l'équipe est invalide.");

  return { cover, middle, teamOrder };
}

function respondError(res, error, fallback) {
  if (error instanceof ValidationError) return res.status(400).json({ error: error.message });
  console.error(error);
  return res.status(500).json({ error: fallback });
}

/* ----- liste des brouillons (sans leur contenu) ----- */
exports.listDossiers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.project !== undefined) {
      if (!mongoose.isValidObjectId(req.query.project)) return res.status(400).json({ error: 'Projet invalide.' });
      filter.project = req.query.project;
    }

    const dossiers = await Dossier.find(filter).select('name project format createdAt updatedAt').sort({ updatedAt: -1 }).lean();
    return res.status(200).json(dossiers);
  } catch (error) {
    return respondError(res, error, 'Erreur lors de la récupération des brouillons.');
  }
};

/* ----- un brouillon complet ----- */
exports.getDossier = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Brouillon introuvable.' });
    const dossier = await Dossier.findById(req.params.id);
    if (!dossier) return res.status(404).json({ error: 'Brouillon introuvable.' });
    return res.status(200).json(dossier.toObject());
  } catch (error) {
    return respondError(res, error, 'Erreur lors de la récupération du brouillon.');
  }
};

/* ----- création ----- */
exports.createDossier = async (req, res) => {
  try {
    const body = req.body || {};
    if (!mongoose.isValidObjectId(body.project)) fail('Projet invalide.');
    const name = validName(body.name);
    const content = validContent(body);

    const dossier = new Dossier({ project: body.project, name, format: 'A4-RVB', ...content });
    await dossier.save();
    return res.status(201).json(dossier.toObject());
  } catch (error) {
    return respondError(res, error, 'Erreur lors de la création du brouillon.');
  }
};

/* ----- enregistrement ----- */
exports.updateDossier = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Brouillon introuvable.' });
    const dossier = await Dossier.findById(req.params.id);
    if (!dossier) return res.status(404).json({ error: 'Brouillon introuvable.' });

    const body = req.body || {};
    const name = validName(body.name);
    const content = validContent(body);

    dossier.name = name;
    dossier.cover = content.cover;
    dossier.middle = content.middle;
    dossier.teamOrder = content.teamOrder;
    await dossier.save();
    return res.status(200).json(dossier.toObject());
  } catch (error) {
    return respondError(res, error, "Erreur lors de l'enregistrement du brouillon.");
  }
};

/* ----- renommer (sans renvoyer tout le contenu) ----- */
exports.renameDossier = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Brouillon introuvable.' });
    const dossier = await Dossier.findById(req.params.id);
    if (!dossier) return res.status(404).json({ error: 'Brouillon introuvable.' });

    dossier.name = validName(req.body && req.body.name);
    await dossier.save();
    return res.status(200).json({ _id: dossier._id, name: dossier.name, updatedAt: dossier.updatedAt });
  } catch (error) {
    return respondError(res, error, 'Erreur lors du changement de nom du brouillon.');
  }
};

/* ----- duplication ("Enregistrer sous") ----- */
exports.duplicateDossier = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Brouillon introuvable.' });
    const original = await Dossier.findById(req.params.id);
    if (!original) return res.status(404).json({ error: 'Brouillon introuvable.' });

    const source = original.toObject();
    const requested = req.body && req.body.name;
    const name = requested === undefined ? `${source.name} (copie)`.slice(0, LIMITS.name) : validName(requested);

    const copy = new Dossier({
      project: source.project,
      name,
      format: source.format,
      cover: source.cover,
      middle: source.middle,
      teamOrder: source.teamOrder,
    });
    await copy.save();
    return res.status(201).json(copy.toObject());
  } catch (error) {
    return respondError(res, error, 'Erreur lors de la duplication du brouillon.');
  }
};

/* ----- suppression ----- */
exports.deleteDossier = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Brouillon introuvable.' });
    const deleted = await Dossier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Brouillon introuvable.' });
    return res.status(200).json({ message: 'Brouillon supprimé.' });
  } catch (error) {
    return respondError(res, error, 'Erreur lors de la suppression du brouillon.');
  }
};
