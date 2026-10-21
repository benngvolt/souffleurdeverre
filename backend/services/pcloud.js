// Client minimal de l'API pCloud (https://docs.pcloud.com) : dossier, envoi, liste, suppression.
// Authentification : jeton OAuth 2.0 passé en paramètre global `access_token`.

const BACKUP_FILE_PREFIX = 'souffleur-backup-';

// PCLOUD_API_HOST : "eapi.pcloud.com" (compte européen, par défaut) ou "api.pcloud.com" (compte américain).
// Une URL complète est acceptée (utile pour les tests).
function apiBase() {
  const host = process.env.PCLOUD_API_HOST || 'eapi.pcloud.com';
  return host.includes('://') ? host.replace(/\/$/, '') : `https://${host}`;
}

function isConfigured() {
  return Boolean(process.env.PCLOUD_ACCESS_TOKEN);
}

function backupFolder() {
  return process.env.PCLOUD_BACKUP_FOLDER || '/Sauvegardes Souffleur de Verre';
}

async function callApi(method, params = {}, body) {
  const query = new URLSearchParams({ access_token: process.env.PCLOUD_ACCESS_TOKEN, ...params });
  const response = await fetch(`${apiBase()}/${method}?${query}`, {
    method: body ? 'POST' : 'GET',
    body,
  });

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error(`pCloud ${method} : réponse illisible (HTTP ${response.status}).`);
  }

  if (payload.result !== 0) {
    // 2000/1000 : jeton refusé ; 2003 : accès refusé ; 2008 : quota dépassé ; 2005 : dossier introuvable
    throw new Error(`pCloud ${method} a échoué : ${payload.error || 'erreur inconnue'} (code ${payload.result}).`);
  }

  return payload;
}

async function ensureFolder(path) {
  await callApi('createfolderifnotexists', { path });
}

// createfolderifnotexists ne crée pas les dossiers parents : on remonte le chemin niveau par niveau
async function ensureFolderPath(path) {
  let current = '';

  for (const part of path.split('/').filter(Boolean)) {
    current += `/${part}`;
    await ensureFolder(current);
  }
}

async function uploadFile(folderPath, filename, buffer) {
  // Les paramètres passent dans l'URL : pCloud exige qu'ils précèdent la partie fichier.
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: 'application/octet-stream' }), filename);

  const payload = await callApi('uploadfile', { path: folderPath, filename, nopartial: '1' }, form);
  return payload.metadata?.[0] || null;
}

async function listBackups(folderPath) {
  const payload = await callApi('listfolder', { path: folderPath });

  return (payload.metadata?.contents || [])
    .filter((entry) => !entry.isfolder && entry.name.startsWith(BACKUP_FILE_PREFIX))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Fichiers (hors sous-dossiers) d'un dossier : [{ name, size, fileid }]
async function listFiles(folderPath) {
  const payload = await callApi('listfolder', { path: folderPath });

  return (payload.metadata?.contents || []).filter((entry) => !entry.isfolder);
}

async function deleteFile(fileId) {
  await callApi('deletefile', { fileid: String(fileId) });
}

module.exports = { isConfigured, backupFolder, ensureFolder, ensureFolderPath, uploadFile, listBackups, listFiles, deleteFile, BACKUP_FILE_PREFIX };
