import React from 'react';

function FullUniqueDate(props) {
  const { creationDate } = props;

  function convertirDate(dateStr) {
    const [annee, mois] = dateStr.split('-');
    const moisEnTexte = new Date(`${annee}-${mois}-01`).toLocaleString('fr-FR', { month: 'long' });
    return `${moisEnTexte.charAt(0).toUpperCase()}${moisEnTexte.slice(1)} ${annee}`;
  }

  // Vérification pour s'assurer que creationDate est défini avant de convertir la date
  const dateFormatee = creationDate ? convertirDate(creationDate) : '';

  return (
    <p className='oneSpectacle_mainDatas_creationDate'> création {dateFormatee}</p>
  );
}

export default FullUniqueDate;