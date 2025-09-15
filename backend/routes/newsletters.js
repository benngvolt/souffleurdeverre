// routes/newsletters.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middlewares/auth');
// Optionnel : inline du CSS si tu en as dans <style> (utile pour l'email)
// const juice = require('juice');

const BREVO_API_KEY = process.env.BREVO_API_KEY;

// const requireAuth = (req, res, next) => { /* TODO: vérifier JWT/role */ next(); };

router.post('/template', auth, async (req, res) => {
    
    // console.log('HIT /api/newsletters/template', req.method, {
    //     hasHtml: !!req.body?.htmlContent
    //   });
    //   console.log('coucou')

    try {
      if (!BREVO_API_KEY) {
        return res.status(500).json({ error: 'BREVO_API_KEY manquant' });
      }
  
      const { templateName, subject, htmlContent, htmlUrl, sender } = req.body || {};
  
      if (!templateName || !subject || (!htmlContent && !htmlUrl)) {
        return res.status(400).json({
          error: 'Champs requis: templateName, subject, et htmlContent OU htmlUrl'
        });
      }
  
      const api = axios.create({
        baseURL: 'https://api.brevo.com/v3',
        headers: { 'api-key': BREVO_API_KEY }
      });
  
      const payload = {
        templateName,
        subject,
        sender: sender || { name: 'Compagnie Le Souffleur de Verre', email: 'contact@souffleurdeverre.fr' }
      };
  
      if (htmlContent) payload.htmlContent = htmlContent;
      if (htmlUrl) payload.htmlUrl = htmlUrl;
  
      // Log facultatif pour debug : voir le HTML qui part
      console.log('Envoi template vers Brevo:', {
        templateName,
        subject,
        htmlLength: htmlContent?.length
      });
  
      const { data } = await api.post('/smtp/templates', payload);
      res.status(200).json({ id: data?.id, ...data });
  
    } catch (err) {
      console.error('Erreur Brevo:', err?.response?.data || err.message);
      res
        .status(err?.response?.status || 500)
        .json(err?.response?.data || { error: 'Brevo error' });
    }
  });

module.exports = router;
