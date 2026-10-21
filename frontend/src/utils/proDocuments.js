import {
    faFile,
    faFileAudio,
    faFileExcel,
    faFileImage,
    faFileLines,
    faFilePdf,
    faFilePowerpoint,
    faFileVideo,
    faFileWord,
    faFileZipper,
} from '@fortawesome/free-solid-svg-icons';

// Documents de l'espace pro. La même liste existe côté backend (config/proDocuments.js) : à garder synchronisée.
export const PRO_DOCUMENT_MAX_SIZE = 10 * 1024 * 1024; // 10 Mo par document

// App Engine refuse les requêtes de plus de 32 Mo : on garde une marge pour un enregistrement unique.
export const MAX_REQUEST_FILES_SIZE = 30 * 1024 * 1024;

export const PRO_DOCUMENT_EXTENSIONS = [
    'pdf', 'doc', 'docx', 'odt', 'rtf', 'txt', 'md',
    'xls', 'xlsx', 'ods', 'csv', 'ppt', 'pptx', 'odp', 'key', 'pages', 'numbers',
    'jpg', 'jpeg', 'png', 'webp', 'gif', 'tif', 'tiff', 'heic',
    'zip',
    'mp3', 'wav', 'm4a', 'mp4', 'mov',
];

export function getExtension(fileName = '') {
    const match = /\.([a-z0-9]+)$/i.exec(fileName);
    return match ? match[1].toLowerCase() : '';
}

export function formatFileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`;
}

// Retourne un message d'erreur, ou '' si le fichier est accepté.
export function validateProDocument(file) {
    const extension = getExtension(file.name);

    if (!PRO_DOCUMENT_EXTENSIONS.includes(extension)) {
        return `« ${file.name} » : ce type de fichier n'est pas accepté (.${extension || '?'}).`;
    }
    if (file.size > PRO_DOCUMENT_MAX_SIZE) {
        return `« ${file.name} » dépasse la limite de ${PRO_DOCUMENT_MAX_SIZE / (1024 * 1024)} Mo.`;
    }
    return '';
}

const ICONS_BY_EXTENSION = {
    pdf: faFilePdf,
    doc: faFileWord, docx: faFileWord, odt: faFileWord, rtf: faFileWord, pages: faFileWord,
    xls: faFileExcel, xlsx: faFileExcel, ods: faFileExcel, csv: faFileExcel, numbers: faFileExcel,
    ppt: faFilePowerpoint, pptx: faFilePowerpoint, odp: faFilePowerpoint, key: faFilePowerpoint,
    jpg: faFileImage, jpeg: faFileImage, png: faFileImage, webp: faFileImage, gif: faFileImage, tif: faFileImage, tiff: faFileImage, heic: faFileImage,
    zip: faFileZipper,
    mp3: faFileAudio, wav: faFileAudio, m4a: faFileAudio,
    mp4: faFileVideo, mov: faFileVideo,
    txt: faFileLines, md: faFileLines,
};

// L'icône se déduit de l'extension de l'URL (ou du nom) du document.
export function getDocumentIcon(urlOrName = '') {
    const cleanName = String(urlOrName).split('?')[0];
    return ICONS_BY_EXTENSION[getExtension(cleanName)] || faFile;
}
