import React, { useLayoutEffect, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import Paginator from './Paginator';
import PhotoFrame from './PhotoFrame';
import { COMPANY_INFOS, COMPANY_PAGE } from './dossierConfig';
import companyPhotoLeft from '../../assets/Julien_Rocha_Julien_Bruhat.webp';
import companyPhotoRight from '../../assets/Cedric_Veschambre_Julien_Bruhat.webp';
import { sanitizeHtml, escapeHtml, groupTeam } from '../../utils/dossier/dossierData';

/* Pages du dossier artistique (A4 paysage).
   Seuls sont modifiables : la photo de couverture, les pages texte et photo de la partie 3 et l'ordre
   des biographies. Les autres pages reprennent les données du projet (ou sont fixes). */

function Html({ html, className = '', placeholder }) {
  return (
    <div
      className={`dossierText ${className}`}
      data-placeholder={placeholder}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}

function Spacer() {
  return <div className='dossierSpacer' />;
}

/* Page dont le contenu dépasse : détection en direct (rapport hauteur de colonne / hauteur de page,
   donc indépendant du zoom d'affichage). */
function useOverflowFlag(pageRef, columnRef, capacityMm, dependencies) {
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const column = columnRef.current;
    const page = pageRef.current;
    if (!column || !page || typeof ResizeObserver === 'undefined') return undefined;

    const check = () => {
      const pageHeight = page.getBoundingClientRect().height;
      if (!pageHeight) return;
      const columnMm = (column.getBoundingClientRect().height / pageHeight) * 210;
      setOverflowing(columnMm > capacityMm + 0.5);
    };

    const observer = new ResizeObserver(check);
    observer.observe(column);
    check();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(check);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capacityMm, ...dependencies]);

  return overflowing;
}

/* ----------------------------------
   1. Couverture (seule la photo est modifiable)
---------------------------------- */

export function CoverPage({ title, credits, notes, photo, onPan, onChoose }) {
  return (
    <section className='dossierPage dossierPage--cover dossierTypo' data-section='cover'>
      <div className='dossierCover_panel'>
        <div className='dossierCover_content'>
          <div className='dossierCover_logoFrame'>
            <div className='dossierCover_logo' role='img' aria-label='Le Souffleur de Verre' />
          </div>
          <p className='dossierCover_company'>LE SOUFFLEUR DE VERRE</p>
          <h1 className='dossierCover_title'>{title}</h1>

          {credits.map((credit) => (
            <p key={credit.label} className='dossierCover_credit'>
              <strong>{credit.label.toLowerCase()}</strong>
              <br />
              {credit.value}
            </p>
          ))}

          {notes.map((note, index) => (
            <p key={index} className='dossierCover_note'>{note}</p>
          ))}
        </div>
      </div>

      <PhotoFrame
        className='dossierCover_photo'
        imageUrl={photo.imageUrl}
        x={photo.x}
        y={photo.y}
        onPan={onPan}
        onChoose={onChoose}
      />
    </section>
  );
}

/* ----------------------------------
   2. Infos et distribution
---------------------------------- */

export function GenericPage({ title, tagline, rows }) {
  return (
    <section className='dossierPage dossierPage--generic dossierTypo' data-section='generic'>
      <h1 className='dossierGlowTitle'>{title}</h1>
      {tagline && <p className='dossierGeneric_tagline'>{tagline}</p>}

      <div className='dossierCredits'>
        {rows.map((row, index) => (
          <React.Fragment key={index}>
            <p className={`dossierCredits_label ${row.gap ? 'dossierCredits_label--gap' : ''}`}>{row.label}</p>
            <p className={`dossierCredits_value ${row.gap ? 'dossierCredits_value--gap' : ''}`}>{row.value}</p>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------
   3. Pages texte et pages photo (modifiables)
---------------------------------- */

const TEXT_PAGE_CAPACITY_MM = 189;
const TEXT_PAGE_TITLED_CAPACITY_MM = 166;

export function TextPage({ page }) {
  const pageRef = React.useRef(null);
  const columnRef = React.useRef(null);
  const title = page.title.trim();
  const align = ['top', 'center', 'bottom'].includes(page.align) ? page.align : 'top';
  const overflowing = useOverflowFlag(pageRef, columnRef, title ? TEXT_PAGE_TITLED_CAPACITY_MM : TEXT_PAGE_CAPACITY_MM, [page.html, title]);

  return (
    <section
      ref={pageRef}
      className={`dossierPage dossierPage--flow dossierPage--text dossierPage--align-${align} ${overflowing ? 'dossierPage--overflow' : ''} dossierTypo`}
      data-section='middle'
      data-page-id={page.id}
    >
      {title && <h2 className='dossierTitle'>{title}</h2>}
      <div ref={columnRef} className='dossierColumn'>
        <Html html={page.html} placeholder='Page vide : cliquez sur MODIFIER pour saisir le texte.' />
      </div>
    </section>
  );
}

export function PhotosPage({ page, images, onPanSlot, onChooseSlot }) {
  const credits = [
    ...new Set(
      page.slots
        .map((slot) => (images.find((image) => image.imageUrl === slot.imageUrl) || {}).photograph)
        .filter(Boolean)
    ),
  ];

  return (
    <section className='dossierPage dossierPage--photos dossierPage--noNumber dossierTypo' data-section='middle' data-page-id={page.id}>
      <div className={`dossierPhotos dossierPhotos--${page.layout || 'three-bottom'}`}>
        {page.slots.map((slot, index) => (
          <PhotoFrame
            key={index}
            className='dossierPhotos_item'
            imageUrl={slot.imageUrl}
            x={slot.x}
            y={slot.y}
            onPan={(position) => onPanSlot(page.id, index, position)}
            onChoose={() => onChooseSlot(page.id, index)}
          />
        ))}
      </div>
      {credits.length > 0 && <p className='dossierPhotos_credit'>© {credits.join(' / ')}</p>}
    </section>
  );
}

/* ----------------------------------
   4. L'équipe : 3 biographies par page (voir groupTeam), déplaçables
   Seule la biographie COURTE écrite pour le dossier est utilisée ; sans elle, le champ reste vide
   (avec le portrait et le nom).
---------------------------------- */

const TEAM_PAGE_CAPACITY_MM = 189;
const TEAM_FIRST_PAGE_CAPACITY_MM = 127;

function TeamRow({ biography }) {
  const id = `bio:${biography._id}`;
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id });
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({ id });

  const name = `${biography.name || ''} ${biography.surname || ''}`.trim();
  const role = biography.role ? `, ${biography.role}` : '';
  const text = biography.dossierBiography && biography.dossierBiography.trim() ? biography.dossierBiography : '';

  return (
    <div
      ref={(node) => {
        setDropRef(node);
        setDragRef(node);
      }}
      className={`dossierTeamRow ${isOver ? 'dossierTeamRow--over' : ''} ${isDragging ? 'dossierTeamRow--dragging' : ''}`}
    >
      <button type='button' className='dossierDragHandle dossierDragHandle--team' aria-label={`Déplacer ${name}`} {...listeners} {...attributes}>
        <FontAwesomeIcon icon={faGripVertical} />
      </button>
      <div className='dossierTeamRow_photo'>
        {biography.bioImageUrl && <img src={biography.bioImageUrl} alt='' />}
      </div>
      <div className='dossierTeamRow_text'>
        <Html html={`<strong>${escapeHtml(name)}</strong>${escapeHtml(role)}.`} />
        <Spacer />
        <Html html={text} placeholder='Biographie courte à saisir (onglet BIOGRAPHIES)…' />
      </div>
    </div>
  );
}

function TeamPage({ title, biographies }) {
  const pageRef = React.useRef(null);
  const columnRef = React.useRef(null);
  const overflowing = useOverflowFlag(pageRef, columnRef, title ? TEAM_FIRST_PAGE_CAPACITY_MM : TEAM_PAGE_CAPACITY_MM, [biographies]);

  return (
    <section
      ref={pageRef}
      className={`dossierPage dossierPage--flow dossierPage--team ${overflowing ? 'dossierPage--overflow' : ''} dossierTypo`}
      data-section='team'
    >
      {title && <h2 className='dossierTitle'>{title}</h2>}
      <div ref={columnRef} className='dossierColumn'>
        {biographies.map((biography) => (
          <TeamRow key={biography._id} biography={biography} />
        ))}
      </div>
    </section>
  );
}

export function TeamPages({ title, biographies }) {
  const sizes = groupTeam(biographies.length);
  let cursor = 0;

  return sizes.map((size, pageIndex) => {
    const group = biographies.slice(cursor, cursor + size);
    cursor += size;
    return <TeamPage key={`team-${pageIndex}`} title={pageIndex === 0 ? title : null} biographies={group} />;
  });
}

/* ----------------------------------
   Calendrier de création (répartition automatique)
---------------------------------- */

function FlowPage({ title, showTitle, variant, children }) {
  return (
    <section className={`dossierPage dossierPage--flow dossierPage--${variant} dossierTypo`} data-section='calendar'>
      {showTitle && <h2 className='dossierTitle'>{title}</h2>}
      <div className='dossierColumn'>{children}</div>
    </section>
  );
}

const FLOW_SETTINGS = {
  calendar: { widthMm: 162, capacityMm: 189, titledCapacityMm: 166 },
};

export function FlowPages({ title, blocks, variant = 'calendar' }) {
  const settings = FLOW_SETTINGS[variant];
  if (!blocks.length) return null;

  return (
    <Paginator
      blocks={blocks}
      widthMm={settings.widthMm}
      firstCapacityMm={title ? settings.titledCapacityMm : settings.capacityMm}
      capacityMm={settings.capacityMm}
      renderPage={(pageBlocks, pageIndex) => (
        <FlowPage key={`${variant}-${title || 'sans-titre'}-${pageIndex}`} title={title} showTitle={Boolean(title) && pageIndex === 0} variant={variant}>
          {pageBlocks.map((block) => (
            <div key={block.key} className='dossierBlock'>
              {block.node}
            </div>
          ))}
        </FlowPage>
      )}
    />
  );
}

/* Un groupe (type de résidence...) devient une suite de blocs : un titre, puis une ligne
   par date. Ainsi une longue liste se répartit sur plusieurs pages, et un titre n'est jamais seul en bas de page. */
export function calendarBlocks(group, prefix = 'calendar') {
  const last = group.items.length - 1;

  return [
    {
      key: `${prefix}-${group.type}-heading`,
      keepWithNext: true,
      node: (
        <div className='dossierCalendar dossierCalendar--heading'>
          <p className='dossierCalendar_heading'>{group.type}</p>
        </div>
      ),
    },
    ...group.items.map((item, index) => ({
      key: `${prefix}-${group.type}-${index}`,
      node: (
        <div className={`dossierCalendar ${index === last ? 'dossierCalendar--last' : ''}`}>
          <p className='dossierCalendar_dates'>{item.dates}</p>
          <p className='dossierCalendar_place'>
            {item.lines.map((line, lineIndex) => (
              <React.Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </p>
        </div>
      ),
    })),
  ];
}

/* ----------------------------------
   5. La compagnie (page fixe)
---------------------------------- */

export function CompanyPage() {
  const page = COMPANY_PAGE;

  return (
    <section className='dossierPage dossierPage--company dossierPage--noNumber dossierTypo' data-section='company'>
      <h2 className='dossierTitle'>{page.title}</h2>

      <div className='dossierCompany_text'>
        {page.paragraphs.map((paragraph, index) => (
          <p key={index} className='dossierText'>{paragraph}</p>
        ))}
        <p className='dossierText dossierCompany_quote'>{page.quote}</p>
        <p className='dossierCompany_signature'>{page.signature}</p>
      </div>

      <p className='dossierCompany_credit'>{page.photoCredit}</p>
      <div className='dossierCompany_photos'>
        <img src={companyPhotoLeft} alt='' />
        <img src={companyPhotoRight} alt='' />
      </div>
    </section>
  );
}

/* ----------------------------------
   6. Infos de la compagnie et logos (page fixe)
---------------------------------- */

export function ContactPage({ logos }) {
  const infos = COMPANY_INFOS;
  const lines = (list) => list.map((line, index) => <React.Fragment key={index}>{index > 0 && <br />}{line}</React.Fragment>);

  return (
    <section className='dossierPage dossierPage--contact dossierTypo' data-section='contact'>
      <div className='dossierContact'>
        {infos.contacts.map((contact) => (
          <div key={contact.role} className='dossierContact_group'>
            <p className='dossierContact_role'>{contact.role}</p>
            <div className='dossierContact_person'>
              <p><strong>{contact.name}</strong></p>
              <p>{lines(contact.lines)}</p>
            </div>
          </div>
        ))}

        <div className='dossierContact_group dossierContact_group--center'>
          <p>{infos.email}</p>
        </div>
        <div className='dossierContact_group dossierContact_group--center'>
          <p>
            {infos.name}
            <br />
            {infos.address.map((line, index) => <React.Fragment key={index}>{line}<br /></React.Fragment>)}
          </p>
        </div>
        <div className='dossierContact_group dossierContact_group--center'>
          <p>{infos.website}</p>
        </div>
        <div className='dossierContact_group dossierContact_group--center'>
          <p className='dossierContact_role'>Crédits</p>
          <p>{lines(infos.credits)}</p>
        </div>
        <div className='dossierContact_group dossierContact_group--center'>
          <p>{lines(infos.conventions)}</p>
        </div>

        {logos.length > 0 && (
          <div className='dossierContact_logos'>
            {logos.map((logo) => (
              <img key={logo._id} src={logo.imageUrl} alt={logo.altText || logo.name} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
