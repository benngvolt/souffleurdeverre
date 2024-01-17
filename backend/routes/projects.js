const express = require ('express');
const projectsCtrl = require ('../controllers/projects');
const router = express.Router();
const multer = require('../middlewares/multer-config');
// const auth = require('../middlewares/auth');
const uploadImages = require('../middlewares/uploadImages').uploadImages;
const uploadPdfs = require('../middlewares/uploadImages').uploadPdfs;
// const uploadImage = require('../middlewares/uploadImages').uploadImage;

// Cette partie du code définit un  **** MIDDLEWARE **** pour notre application Express. 
// Un middleware est une fonction qui peut être utilisée pour effectuer des actions sur une requête avant qu'elle n'atteigne sa route finale.
// Dans ce cas, le middleware est défini à l'aide de app.use(), qui indique à Express d'utiliser ce middleware pour toutes les requêtes entrantes. 
// Le middleware prend deux arguments, req (pour la requête) et res (pour la réponse). 
// Dans cet exemple, il envoie une réponse JSON contenant le message "Votre requête a bien été reçue !" à chaque requête entrante.
// l'argument next permet de passer au middleware suivant

router.post('/', multer.fields([{ name: 'images' }, { name: 'pdfFiles' }]), uploadImages, uploadPdfs, projectsCtrl.createProject);
router.get('/', projectsCtrl.getAllProjects);
router.get('/:id', projectsCtrl.getOneProject);
router.delete ('/:id', 
// auth, 
projectsCtrl.deleteOneProject);
router.put ('/:id', multer.fields([{ name: 'images' }, { name: 'pdfFiles' }]), uploadImages, uploadPdfs, projectsCtrl.updateOneProject);

module.exports = router;