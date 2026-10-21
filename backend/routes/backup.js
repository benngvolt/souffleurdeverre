const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const backupCtrl = require('../controllers/backup');

// Appelée chaque nuit par App Engine Cron (voir cron.yaml) ; déclenchable aussi à la main par l'admin connecté.
// App Engine retire l'en-tête X-Appengine-Cron des requêtes venant d'Internet : seul le vrai cron l'ajoute.
// On ne lui fait confiance que sur App Engine (GAE_APPLICATION), jamais en local ni ailleurs.
function cronOrAdmin(req, res, next) {
  const runsOnAppEngine = Boolean(process.env.GAE_APPLICATION);

  if (runsOnAppEngine && req.get('X-Appengine-Cron') === 'true') {
    return next();
  }

  return auth(req, res, next);
}

router.get('/', cronOrAdmin, backupCtrl.runBackup);
router.post('/', cronOrAdmin, backupCtrl.runBackup);

module.exports = router;
