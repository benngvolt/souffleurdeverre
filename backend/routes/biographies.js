const express = require ('express');
const router = express.Router();
const biographiesCtrl = require ('../controllers/biographies');
const multer = require('../middlewares/multer-config');
const deleteBiographyImageFiles = require('../middlewares/deleteImages').deleteBiographyImageFiles;
const auth = require('../middlewares/auth');
const uploadImage = require('../middlewares/uploadImages').uploadImage;

router.post('/',
    auth,
    multer.single('image'),
    uploadImage,
    biographiesCtrl.createBiography,
    deleteBiographyImageFiles
    );
router.get('/',
    biographiesCtrl.getAllBiographies);
router.get('/:id',
    biographiesCtrl.getOneBiography);
router.delete ('/:id',
    auth,
    biographiesCtrl.deleteOneBiography,
    deleteBiographyImageFiles);
router.put ('/:id',
    auth,
    multer.single('image'),
    uploadImage,
    biographiesCtrl.updateOneBiography,
    deleteBiographyImageFiles
    );

module.exports = router;
