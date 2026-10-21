#!/usr/bin/env node
// Restauration d'une sauvegarde chiffrée (fichier souffleur-backup-*.json.gz.enc).
//
//   BACKUP_ENCRYPTION_KEY="..." node scripts/restore-backup.js <fichier> [options]
//
//   (aucune option)      déchiffre et affiche le contenu (nombre de documents) : rien n'est écrit
//   --json <sortie.json> écrit aussi le contenu déchiffré dans un fichier JSON lisible
//   --uri <mongodb-uri>  base cible (OBLIGATOIRE pour restaurer : jamais déduite de l'environnement)
//   --drop               vide chaque collection avant d'y réinsérer les documents
//   --confirm            exécute réellement la restauration (sans lui : simulation)
//   --allow-production   nécessaire si --uri est la base de production de l'application
//
// Conseil : restaurez d'abord dans une base de test pour vérifier la sauvegarde.

const fs = require('fs');
const mongoose = require('mongoose');
const { decryptBuffer, parseDump } = require('../services/backupCrypto');

const { EJSON } = mongoose.mongo.BSON;

function readArgs(argv) {
  const args = { flags: new Set(), values: {}, positional: [] };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (['--uri', '--json'].includes(arg)) {
      args.values[arg.slice(2)] = argv[(i += 1)];
    } else if (arg.startsWith('--')) {
      args.flags.add(arg.slice(2));
    } else {
      args.positional.push(arg);
    }
  }

  return args;
}

async function main() {
  const args = readArgs(process.argv.slice(2));
  const [file] = args.positional;

  if (!file) {
    console.error('Usage : BACKUP_ENCRYPTION_KEY="..." node scripts/restore-backup.js <fichier.enc> [--json out.json] [--uri mongodb://... [--drop] [--confirm]]');
    process.exit(1);
  }

  const dump = parseDump(decryptBuffer(fs.readFileSync(file), process.env.BACKUP_ENCRYPTION_KEY));
  const names = Object.keys(dump.collections);

  console.log(`Sauvegarde du ${new Date(dump.createdAt).toLocaleString('fr-FR')}`);
  names.forEach((name) => console.log(`  ${name} : ${dump.collections[name].length} documents`));

  if (args.values.json) {
    fs.writeFileSync(args.values.json, EJSON.stringify(dump, { relaxed: true }, 2));
    console.log(`Contenu déchiffré écrit dans ${args.values.json}`);
  }

  if (!args.values.uri) {
    console.log("Aucune base cible (--uri) : rien n'a été restauré.");
    return;
  }

  if (args.values.uri === process.env.SECRET_MONGODBKEY && !args.flags.has('allow-production')) {
    console.error("Cette base est celle de l'application : ajoutez --allow-production si c'est bien voulu.");
    process.exit(1);
  }

  if (!args.flags.has('confirm')) {
    console.log(`Simulation : ajoutez --confirm pour restaurer ${args.flags.has('drop') ? '(avec --drop : collections vidées avant)' : ''} dans la base cible.`);
    return;
  }

  const connection = await mongoose.createConnection(args.values.uri).asPromise();

  try {
    for (const name of names) {
      const documents = dump.collections[name];
      const collection = connection.db.collection(name);

      if (args.flags.has('drop')) {
        await collection.deleteMany({});
      }
      if (documents.length > 0) {
        await collection.insertMany(documents, { ordered: false });
      }
      console.log(`  ${name} : ${documents.length} documents restaurés`);
    }
  } finally {
    await connection.close();
  }
}

main().catch((error) => {
  console.error(`Échec : ${error.message}`);
  process.exit(1);
});
