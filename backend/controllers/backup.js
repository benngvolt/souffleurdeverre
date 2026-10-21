const { runBackup } = require('../services/backup');

exports.runBackup = async (req, res) => {
  try {
    const report = await runBackup();

    // 500 si une destination a échoué : le cron App Engine le signale et réessaie
    return res.status(report.ok ? 200 : 500).json(report);
  } catch (error) {
    if (error.code === 'BACKUP_NOT_CONFIGURED') {
      return res.status(503).json({ error: error.message });
    }

    console.error('Erreur sauvegarde :', error.message);
    return res.status(500).json({ error: 'Erreur lors de la sauvegarde.' });
  }
};
