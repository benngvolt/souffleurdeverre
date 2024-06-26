

const { Storage } = require('@google-cloud/storage');

const storage = new Storage ({

  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

module.exports = { storage, bucket };