import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMinus, faPlus, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import {
  CoverPage,
  GenericPage,
  FlowPages,
  PhotoPages,
  CompanyPage,
  ContactPage,
  htmlBlocks,
  subtitleBlock,
  spacerBlock,
  teamBlock,
  calendarBlock,
} from './DossierPages';
import {
  htmlToBlocks,
  splitLeadingItalic,
  groupResidencies,
  matchBiographies,
  formatCreationDate,
  firstItem,
} from '../../utils/dossier/dossierData';
import { PAGE } from './dossierConfig';

const PAGE_WIDTH_PX = (PAGE.widthMm * 96) / 25.4;

function fitZoom() {
  const width = window.innerWidth || document.documentElement.clientWidth || 1200;
  return Math.min(1, Math.max(0.3, (width - 48) / PAGE_WIDTH_PX));
}

/* Transforme les données du projet en contenu de dossier. */
function buildContent(project, biographies, allLogos) {
  const images = project.images || [];
  const mainIndex = project.mainImageIndex >= 0 && project.mainImageIndex < images.length ? project.mainImageIndex : 0;
  const mainImage = images[mainIndex];
  const otherImages = images.filter((_, index) => index !== mainIndex);

  const artists = project.artistsList || [];
  const production = project.productionList || [];

  const { lead, blocks: descriptionHtmlBlocks } = splitLeadingItalic(htmlToBlocks(project.description));

  const coverCredits = artists
    .filter((artist) => /^(texte|mise en scène)$/i.test((artist.artistFunction || '').trim()))
    .map((artist) => ({ label: artist.artistFunction, value: firstItem(artist.artistName) }));

  const coverNotes = [
    project.creationDate ? `création ${formatCreationDate(project.creationDate)}` : '',
    lead,
  ].filter(Boolean);

  const genericRows = [
    ...artists.map((artist) => ({ label: artist.artistFunction, value: artist.artistName })),
    ...(project.duration ? [{ label: 'Durée', value: project.duration, gap: true }] : []),
    ...production.map((item, index) => ({ label: item.productionFunction, value: item.productionName, gap: index === 0 })),
  ];

  const paragraphBlocks = [];
  (project.paragraphList || []).forEach((paragraph, index) => {
    if (index > 0) paragraphBlocks.push(spacerBlock(`par-${index}-gap`));
    if (paragraph.paragraphTitle && paragraph.paragraphTitle.trim()) {
      paragraphBlocks.push(subtitleBlock(`par-${index}-title`, paragraph.paragraphTitle.trim()));
      paragraphBlocks.push(spacerBlock(`par-${index}-title-gap`, true));
    }
    paragraphBlocks.push(...htmlBlocks(`par-${index}`, htmlToBlocks(paragraph.paragraphText)));
  });

  const teamBlocks = matchBiographies(project, biographies).map(teamBlock);
  const calendarBlocks = groupResidencies(project.residenciesList).map(calendarBlock);

  const logos = (project.logos || [])
    .map((name) => allLogos.find((logo) => logo.name === name))
    .filter(Boolean);

  return {
    cover: { title: project.title, credits: coverCredits, notes: coverNotes, imageUrl: mainImage?.imageUrl },
    generic: { title: project.title, tagline: project.moreInfos ? project.moreInfos.trim() : '', rows: genericRows },
    descriptionBlocks: htmlBlocks('description', descriptionHtmlBlocks),
    paragraphBlocks,
    otherImages,
    teamBlocks,
    calendarBlocks,
    logos,
  };
}

function DossierEditor({ project, biographies, logos, onBack }) {
  const [zoom, setZoom] = useState(fitZoom);

  const content = useMemo(() => buildContent(project, biographies, logos), [project, biographies, logos]);

  function changeZoom(delta) {
    setZoom((current) => Math.min(1.5, Math.max(0.3, Math.round((current + delta) * 10) / 10)));
  }

  return createPortal(
    <div className='dossierEditor' lang='fr'>
      <header className='dossierEditor_toolbar'>
        <button type='button' className='dossierEditor_toolbar_button' onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> CHANGER DE PROJET
        </button>

        <p className='dossierEditor_toolbar_title'>Dossier artistique · {project.title}</p>

        <div className='dossierEditor_toolbar_group'>
          <button type='button' className='dossierEditor_toolbar_button dossierEditor_toolbar_button--icon' onClick={() => changeZoom(-0.1)} aria-label='Réduire'>
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <span className='dossierEditor_toolbar_zoom'>{Math.round(zoom * 100)} %</span>
          <button type='button' className='dossierEditor_toolbar_button dossierEditor_toolbar_button--icon' onClick={() => changeZoom(0.1)} aria-label='Agrandir'>
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <button type='button' className='dossierEditor_toolbar_button dossierEditor_toolbar_button--primary' onClick={() => window.print()}>
            <FontAwesomeIcon icon={faFilePdf} /> EXPORTER EN PDF
          </button>
        </div>
      </header>

      <p className='dossierEditor_hint'>
        Les textes sont modifiables directement dans les pages (modifications non sauvegardées, prototype).
        Pour l'export : destination « Enregistrer au format PDF », marges « Aucune », option « Graphiques d'arrière-plan » cochée.
      </p>

      <div className='dossierEditor_pages' style={{ zoom }}>
        <CoverPage {...content.cover} />
        <GenericPage {...content.generic} />
        <FlowPages blocks={content.descriptionBlocks} />
        <FlowPages title='Note d’intention' blocks={content.paragraphBlocks} />
        <PhotoPages images={content.otherImages} />
        <FlowPages title='L’équipe' blocks={content.teamBlocks} variant='team' />
        <CompanyPage />
        <FlowPages title='Calendrier de création' blocks={content.calendarBlocks} variant='calendar' />
        <ContactPage logos={content.logos} />
      </div>
    </div>,
    document.body
  );
}

export default DossierEditor;
