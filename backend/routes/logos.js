const express = require('express');
const router = express.Router();
const logosCtrl = require('../controllers/logos');
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const uploadLogoImage = require('../middlewares/uploadImages').uploadLogoImage;
const deleteLogoImageFile = require('../middlewares/deleteImages').deleteLogoImageFile;

router.get('/', logosCtrl.getAllLogos);

router.post('/',
  auth,
  multer.single('logoImage'),
  uploadLogoImage,
  logosCtrl.createLogo,
  deleteLogoImageFile
);

router.put('/:id',
  auth,
  multer.single('logoImage'),
  uploadLogoImage,
  logosCtrl.updateOneLogo,
  deleteLogoImageFile
);

router.delete('/:id',
  auth,
  logosCtrl.deleteOneLogo,
  deleteLogoImageFile
);

module.exports = router;
