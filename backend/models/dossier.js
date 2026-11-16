const mongoose = require('mongoose');

/* Brouillon de dossier artistique (générateur de dossier du back-office).

   On n'enregistre que ce qui est modifiable dans l'éditeur : photo de couverture, pages de la partie
   centrale et ordre des biographies. Le reste (infos et distribution, calendrier, textes des
   biographies, logos) est recalculé depuis le projet à l'ouverture. */

const photoSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, default: '' },
    // cadrage de la photo dans son cadre, en % (50 = centré)
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 },
  },
  { _id: false }
);

const pageSchema = new mongoose.Schema(
  {
    pageId: { type: String, required: true },
    type: { type: String, enum: ['text', 'photos'], required: true },
    // page texte
    title: { type: String, default: '' },
    html: { type: String, default: '' },
    align: { type: String, enum: ['top', 'center', 'bottom'], default: 'top' },
    // page photo : disposition des photos et emplacements (1, 2 ou 3 selon la disposition)
    layout: {
      type: String,
      enum: ['three-bottom', 'three-left', 'two-stacked', 'two-columns', 'one'],
      default: 'three-bottom',
    },
    slots: { type: [photoSchema], default: [] },
  },
  { _id: false }
);

const dossierSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    format: { type: String, enum: ['A4-RVB'], default: 'A4-RVB' },
    cover: { type: photoSchema, default: () => ({}) },
    middle: { type: [pageSchema], default: [] },
    teamOrder: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Biography' }], default: [] },
    // permet de faire évoluer le format des brouillons plus tard
    schemaVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dossier', dossierSchema);
