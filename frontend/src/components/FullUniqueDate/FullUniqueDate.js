import React from 'react';

function FullUniqueDate({ creationDate }) {

  
  function convertirDate(dateStr) {
    const date = new Date(dateStr);

    if (isNaN(date)) return '';

    const moisEnTexte = date.toLocaleString('fr-FR', { month: 'long' });
    const annee = date.getFullYear();

    const heures = date.getHours();
    const minutes = date.getMinutes();
    const jour = date.getDate();

    const moisFormate =
      moisEnTexte.charAt(0).toUpperCase() + moisEnTexte.slice(1);

    // Vérifie si une heure est réellement fournie
    const hasTime =
      dateStr.includes('T') || dateStr.match(/\d{2}:\d{2}/);

    if (hasTime) {
      const h = String(heures).padStart(2, '0');
      const m = String(minutes).padStart(2, '0');
      const j = String(jour).padStart(2, '0');
      return `${j} ${moisFormate} ${annee} à ${h}:${m}`;
    }

    return `${moisFormate} ${annee}`;
  }

  const dateFormatee = creationDate ? convertirDate(creationDate) : '';

  return (
    <p>
      {dateFormatee}
    </p>
  );
}

export default FullUniqueDate;
