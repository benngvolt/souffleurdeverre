const { bucket } = require('../config/storage');
const sharp = require('sharp');
const { format } = require('url');
const path = require('path');
const crypto = require('crypto');
const { PRO_DOCUMENT_MAX_SIZE } = require('../config/proDocuments');

/* ----------------------------
   Helpers
---------------------------- */

function sanitizeFilename(filename) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);

  return base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function createUniqueFileName(folder, originalname, extension) {
  const safeName = sanitizeFilename(originalname || 'file');
  const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
  return `${folder}/${safeName}-${uniqueSuffix}.${extension}`;
}

function buildPublicUrl(filePath) {
  return format(`https://storage.googleapis.com/${bucket.name}/${filePath}`);
}

function normalizeToArray(value) {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function parseOptionalIndex(indexValue) {
  if (indexValue === undefined || indexValue === null || indexValue === '') {
    return undefined;
  }

  try {
    return JSON.parse(indexValue);
  } catch (error) {
    return indexValue;
  }
}

function uploadBufferToGCS(filePath, buffer, contentType, extraMetadata = {}) {
  return new Promise((resolve, reject) => {
    const blob = bucket.file(filePath);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType,
        ...extraMetadata,
      },
    });

    blobStream.on('finish', () => {
      resolve(buildPublicUrl(filePath));
    });

    blobStream.on('error', (error) => {
      reject(error);
    });

    blobStream.end(buffer);
  });
}

/* ----------------------------
   Upload multiple project images
---------------------------- */

async function uploadImages(req, res, next) {
  try {
    const newImagesObjects = [];
    const fileIndexes = normalizeToArray(req.body.fileIndexes);
    const files = req.files?.images;

    if (!files || files.length === 0) {
      return next();
    }

    const uploadPromises = files.map(async (file, index) => {
      const { originalname, buffer } = file;

      const resizedImageBuffer = await sharp(buffer)
        .resize({
          width: 1500,
          fit: 'cover',
          kernel: 'lanczos3',
        })
        .toFormat('webp')
        .toBuffer();

      const filePath = createUniqueFileName(
        'projects_images',
        originalname,
        'webp'
      );

      const publicUrl = await uploadBufferToGCS(
        filePath,
        resizedImageBuffer,
        'image/webp'
      );

      const parsedIndex = parseOptionalIndex(fileIndexes[index]);

      if (parsedIndex !== undefined) {
        newImagesObjects.push({
          imageUrl: publicUrl,
          index: parsedIndex,
        });
      } else {
        newImagesObjects.push({
          imageUrl: publicUrl,
        });
      }

      return publicUrl;
    });

    await Promise.all(uploadPromises);

    req.newImagesObjects = newImagesObjects;
    return next();
  } catch (error) {
    console.error('Erreur uploadImages :', error);
    return res.status(500).json({
      error: 'Erreur lors du traitement des images.',
    });
  }
}

/* ----------------------------
   Upload multiple PDFs
---------------------------- */

async function uploadPdfs(req, res, next) {
  try {
    const newPdfsObjects = [];
    const pdfFileIndexes = normalizeToArray(req.body.pdfFileIndexes);
    const pdfNames = normalizeToArray(req.body.pdfNames);
    const files = req.files?.pdfFiles;

    if (!files || files.length === 0) {
      return next();
    }

    const uploadPromises = files.map(async (file, index) => {
      const { originalname, buffer, mimetype } = file;
      const pdfName = pdfNames[index] || '';

      const filePath = createUniqueFileName(
        'pdfList',
        originalname,
        'pdf'
      );

      const publicUrl = await uploadBufferToGCS(
        filePath,
        buffer,
        mimetype || 'application/pdf'
      );

      const parsedIndex = parseOptionalIndex(pdfFileIndexes[index]);

      if (parsedIndex !== undefined) {
        newPdfsObjects.push({
          pdfLink: publicUrl,
          pdfName,
          index: parsedIndex,
        });
      } else {
        newPdfsObjects.push({
          pdfLink: publicUrl,
          pdfName,
        });
      }

      return publicUrl;
    });

    await Promise.all(uploadPromises);

    req.newPdfsObjects = newPdfsObjects;
    return next();
  } catch (error) {
    console.error('Erreur uploadPdfs :', error);
    return res.status(500).json({
      error: 'Erreur lors du traitement des pdfs.',
    });
  }
}

/* ----------------------------
   Upload single biography image
---------------------------- */

async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return next();
    }

    const { originalname, buffer } = req.file;

    const resizedImageBuffer = await sharp(buffer)
      .resize({
        width: 1500,
        fit: 'cover',
        kernel: 'lanczos3',
      })
      .toFormat('webp')
      .toBuffer();

    const filePath = createUniqueFileName(
      'biographies_images',
      originalname,
      'webp'
    );

    const publicUrl = await uploadBufferToGCS(
      filePath,
      resizedImageBuffer,
      'image/webp'
    );

    req.imageUrl = publicUrl;
    return next();
  } catch (error) {
    console.error('Erreur uploadImage :', error);
    return res.status(500).json({
      error: 'Erreur lors du traitement de l’image.',
    });
  }
}

/* ----------------------------
   Upload single logo image
---------------------------- */

async function uploadLogoImage(req, res, next) {
  try {
    if (!req.file) {
      return next();
    }

    const { originalname, buffer, mimetype } = req.file;

    // Un logo ne doit pas être agrandi ni recadré ; webp conserve la transparence.
    // Les SVG sont rastérisés avec une densité élevée pour rester nets.
    const resizedImageBuffer = await sharp(buffer, mimetype === 'image/svg+xml' ? { density: 300 } : undefined)
      .resize({
        width: 800,
        height: 800,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat('webp')
      .toBuffer();

    const filePath = createUniqueFileName('logos', originalname, 'webp');

    req.logoImageUrl = await uploadBufferToGCS(
      filePath,
      resizedImageBuffer,
      'image/webp'
    );

    return next();
  } catch (error) {
    console.error('Erreur uploadLogoImage :', error);
    return res.status(500).json({
      error: 'Erreur lors du traitement du logo.',
    });
  }
}

/* ----------------------------
   Upload pro space documents
---------------------------- */

// En-tête Content-Disposition (RFC 5987) : le navigateur télécharge le fichier sous son nom d'origine.
function buildContentDisposition(displayName, extension) {
  const hasExtension = displayName.toLowerCase().endsWith(`.${extension}`);
  const fileName = hasExtension || !extension ? displayName : `${displayName}.${extension}`;
  const encoded = encodeURIComponent(fileName).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  const asciiFallback = fileName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]|["\\]/g, '_');

  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

async function uploadProDocuments(req, res, next) {
  try {
    const files = req.files?.proDocuments;

    if (!files || files.length === 0) {
      return next();
    }

    const tooBig = files.find((file) => file.size > PRO_DOCUMENT_MAX_SIZE);

    if (tooBig) {
      return res.status(413).json({
        error: `"${tooBig.originalname}" dépasse la limite de ${PRO_DOCUMENT_MAX_SIZE / (1024 * 1024)} Mo.`,
      });
    }

    const names = normalizeToArray(req.body.proDocumentNames);

    req.newProDocumentsObjects = await Promise.all(
      files.map(async (file, index) => {
        const extension = path.extname(file.originalname || '').slice(1).toLowerCase();
        const displayName = (names[index] || '').toString().trim() || file.originalname;
        const filePath = createUniqueFileName('pro_space_documents', file.originalname, extension || 'bin');

        const url = await uploadBufferToGCS(
          filePath,
          file.buffer,
          file.mimetype || 'application/octet-stream',
          { contentDisposition: buildContentDisposition(displayName, extension) }
        );

        return {
          name: displayName,
          url,
          size: file.size,
          mimeType: file.mimetype || '',
        };
      })
    );

    return next();
  } catch (error) {
    console.error('Erreur uploadProDocuments :', error);

    return res.status(500).json({
      error: "Erreur lors de l'envoi des documents de l'espace pro.",
    });
  }
}

module.exports = {
  uploadImages,
  uploadImage,
  uploadLogoImage,
  uploadPdfs,
  uploadProDocuments,
};