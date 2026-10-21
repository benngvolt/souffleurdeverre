const express = require ('express');
const projectsCtrl = require ('../controllers/projects');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const uploadImages = require('../middlewares/uploadImages').uploadImages;
const uploadPdfs = require('../middlewares/uploadImages').uploadPdfs;
const uploadProDocuments = require('../middlewares/uploadImages').uploadProDocuments;
const deleteProjectFiles = require('../middlewares/deleteImages').deleteProjectFiles;

router.post('/',
  auth,
  multer.fields([
    { name: 'images' },
    { name: 'pdfFiles' },
    { name: 'proDocuments' },
  ]),
  uploadImages,
  uploadPdfs,
  uploadProDocuments,
  projectsCtrl.createProject
);

router.get('/',
    projectsCtrl.getAllProjects);

router.get('/:slug',
    projectsCtrl.getOneProjectBySlug);

router.delete ('/:id',
    auth,
    projectsCtrl.deleteOneProject,
    deleteProjectFiles);

router.put('/:id',
    auth,
    multer.fields([
      { name: 'images' },
      { name: 'pdfFiles' },
      { name: 'proDocuments' },
    ]),
    uploadImages,
    uploadPdfs,
    uploadProDocuments,
    projectsCtrl.updateOneProject,
    deleteProjectFiles
  );

module.exports = router;
