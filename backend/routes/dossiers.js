const express = require('express');
const router = express.Router();
const dossiersCtrl = require('../controllers/dossiers');
const auth = require('../middlewares/auth');

// Brouillons de dossier artistique : tout est réservé à l'administrateur connecté
router.use(auth);

router.get('/', dossiersCtrl.listDossiers);
// avant « /:id » : sinon « image » serait pris pour un identifiant
router.get('/image', dossiersCtrl.exportImage);
router.get('/:id', dossiersCtrl.getDossier);
router.post('/', dossiersCtrl.createDossier);
router.put('/:id', dossiersCtrl.updateDossier);
router.patch('/:id', dossiersCtrl.renameDossier);
router.post('/:id/duplicate', dossiersCtrl.duplicateDossier);
router.delete('/:id', dossiersCtrl.deleteDossier);

module.exports = router;
