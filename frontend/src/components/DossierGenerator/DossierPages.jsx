import React from 'react';
import Paginator from './Paginator';
import { COMPANY_INFOS, COMPANY_PAGE } from './dossierConfig';
import companyPhotoLeft from '../../assets/Julien_Rocha_Julien_Bruhat.webp';
import companyPhotoRight from '../../assets/Cedric_Veschambre_Julien_Bruhat.webp';
import { sanitizeHtml } from '../../utils/dossier/dossierData';

/* Pages du dossier artistique (A4 paysage). Toutes les zones de texte sont éditables
   directement (contentEditable) : les modifications ne sont pas encore sauvegardées. */

const editable = {
  contentEditable: true,
  suppressContentEditableWarning: true,
  spellCheck: false,
};

function Html({ html, className = '', as: Tag = 'div' }) {
  return <Tag className={`dossierText ${className}`} {...editable} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}

// Hauteurs de ligne (pt) : doivent rester identiques à celles du SCSS (.dossierTypo / .dossierTeamRow_text)
const TEXT_LINE_HEIGHT_PT = 12.2;
const TEAM_LINE_HEIGHT_PT = 10.4;

function Spacer() {
  return <div className='dossierSpacer' />;
}

/* ----------------------------------
   Couverture
---------------------------------- */

export function CoverPage({ title, credits, notes, imageUrl }) {
  return (
    <section className='dossierPage dossierPage--cover dossierTypo'>
      <div className='dossierCover_panel'>
        <div className='dossierCover_content'>
          <div className='dossierCover_logoFrame'>
            <div className='dossierCover_logo' role='img' aria-label='Le Souffleur de Verre' />
          </div>
          <p className='dossierCover_company'>LE SOUFFLEUR DE VERRE</p>
          <h1 className='dossierCover_title' {...editable}>{title}</h1>

          {credits.map((credit) => (
            <p key={credit.label} className='dossierCover_credit' {...editable}>
              <strong>{credit.label.toLowerCase()}</strong>
              <br />
              {credit.value}
            </p>
          ))}

          {notes.map((note, index) => (
            <p key={index} className='dossierCover_note' {...editable}>{note}</p>
          ))}
        </div>
      </div>
      {imageUrl && <img className='dossierCover_photo' src={imageUrl} alt='' />}
    </section>
  );
}

/* ----------------------------------
   Page générique (titre + distribution)
---------------------------------- */

export function GenericPage({ title, tagline, rows }) {
  return (
    <section className='dossierPage dossierPage--generic dossierTypo'>
      <h1 className='dossierGlowTitle' {...editable}>{title}</h1>
      {tagline && <p className='dossierGeneric_tagline' {...editable}>{tagline}</p>}

      <div className='dossierCredits'>
        {rows.map((row, index) => (
          <React.Fragment key={index}>
            <p className={`dossierCredits_label ${row.gap ? 'dossierCredits_label--gap' : ''}`} {...editable}>{row.label}</p>
            <p className={`dossierCredits_value ${row.gap ? 'dossierCredits_value--gap' : ''}`} {...editable}>{row.value}</p>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------
   Pages de texte (répartition automatique)
---------------------------------- */

function FlowPage({ title, showTitle, variant, centered, children }) {
  return (
    <section className={`dossierPage dossierPage--flow dossierPage--${variant} ${centered ? 'dossierPage--centered' : ''} dossierTypo`}>
      {showTitle && <h2 className='dossierTitle' {...editable}>{title}</h2>}
      <div className='dossierColumn'>{children}</div>
    </section>
  );
}

const FLOW_SETTINGS = {
  text: { widthMm: 187, capacityMm: 189, titledCapacityMm: 166 },
  team: { widthMm: 232, capacityMm: 189, titledCapacityMm: 127 },
  calendar: { widthMm: 162, capacityMm: 189, titledCapacityMm: 166 },
};

export function FlowPages({ title, blocks, variant = 'text' }) {
  const settings = FLOW_SETTINGS[variant];
  if (!blocks.length) return null;

  return (
    <Paginator
      blocks={blocks}
      widthMm={settings.widthMm}
      firstCapacityMm={title ? settings.titledCapacityMm : settings.capacityMm}
      capacityMm={settings.capacityMm}
      renderPage={(pageBlocks, pageIndex, pageCount) => (
        <FlowPage
          key={`${variant}-${title || 'sans-titre'}-${pageIndex}`}
          title={title}
          showTitle={Boolean(title) && pageIndex === 0}
          variant={variant}
          centered={!title && pageCount === 1}
        >
          {pageBlocks.map((block) => (
            <div
              key={block.key}
              className={block.tooLong ? 'dossierBlock dossierBlock--tooLong' : 'dossierBlock'}
              data-pages={block.tooLong || undefined}
            >
              {block.node}
            </div>
          ))}
        </FlowPage>
      )}
    />
  );
}

/* Blocs : HTML issu de l'éditeur */

export function htmlBlocks(prefix, htmlBlockList) {
  return htmlBlockList.map((block, index) => ({
    key: `${prefix}-${index}`,
    spacer: block.spacer,
    splittable: !block.spacer,
    lineHeightPt: TEXT_LINE_HEIGHT_PT,
    node: block.spacer ? <Spacer /> : <Html html={block.html} />,
  }));
}

export function subtitleBlock(key, text) {
  return { key, keepWithNext: true, node: <Html html={`<strong>${text}</strong>`} /> };
}

export function spacerBlock(key, keepWithNext = false) {
  return { key, spacer: true, keepWithNext, node: <Spacer /> };
}

/* Blocs : équipe */

export function teamBlock(biography) {
  const name = `${biography.name || ''} ${biography.surname || ''}`.trim();
  const role = biography.role ? `, ${biography.role}` : '';
  // version courte écrite pour le dossier si elle existe, sinon la biographie complète du site
  const text = biography.dossierBiography && biography.dossierBiography.trim() ? biography.dossierBiography : biography.biography;

  return {
    key: `team-${biography._id}`,
    splittable: true,
    lineHeightPt: TEAM_LINE_HEIGHT_PT,
    splitSelector: '.dossierTeamRow_text',
    minFirstMm: 62, // au moins la hauteur du portrait avant de couper
    node: (
      <div className='dossierTeamRow'>
        <div className='dossierTeamRow_photo'>
          {biography.bioImageUrl && <img src={biography.bioImageUrl} alt='' />}
        </div>
        <div className='dossierTeamRow_text'>
          <Html html={`<strong>${name}</strong>${role}.`} />
          <Spacer />
          <Html html={text} />
        </div>
      </div>
    ),
  };
}

/* Blocs : calendrier de création */

export function calendarBlock(group) {
  return {
    key: `calendar-${group.type}`,
    node: (
      <div className='dossierCalendar'>
        <p className='dossierCalendar_heading' {...editable}>{group.type}</p>
        {group.items.map((item, index) => (
          <React.Fragment key={index}>
            <p className='dossierCalendar_dates' {...editable}>{item.dates}</p>
            <p className='dossierCalendar_place' {...editable}>
              {item.lines.map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>
                  {lineIndex > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </p>
          </React.Fragment>
        ))}
      </div>
    ),
  };
}

/* ----------------------------------
   Pages photo
---------------------------------- */

function chunk(list, size) {
  const result = [];
  for (let i = 0; i < list.length; i += size) result.push(list.slice(i, i + size));
  return result;
}

export function PhotoPages({ images }) {
  return chunk(images, 3).map((group, pageIndex) => {
    const credits = [...new Set(group.map((image) => image.photograph).filter(Boolean))];

    return (
      <section key={`photos-${pageIndex}`} className='dossierPage dossierPage--photos dossierPage--noNumber dossierTypo'>
        <div className={`dossierPhotos dossierPhotos--n${group.length}`}>
          {group.map((image, index) => (
            <img key={index} className='dossierPhotos_item' src={image.imageUrl} alt='' />
          ))}
        </div>
        {credits.length > 0 && (
          <p className='dossierPhotos_credit' {...editable}>© {credits.join(' / ')}</p>
        )}
      </section>
    );
  });
}

/* ----------------------------------
   La compagnie
---------------------------------- */

export function CompanyPage() {
  const page = COMPANY_PAGE;

  return (
    <section className='dossierPage dossierPage--company dossierTypo'>
      <h2 className='dossierTitle' {...editable}>{page.title}</h2>

      <div className='dossierCompany_text'>
        {page.paragraphs.map((paragraph, index) => (
          <p key={index} className='dossierText' {...editable}>{paragraph}</p>
        ))}
        <p className='dossierText dossierCompany_quote' {...editable}>{page.quote}</p>
        <p className='dossierCompany_signature' {...editable}>{page.signature}</p>
      </div>

      <p className='dossierCompany_credit' {...editable}>{page.photoCredit}</p>
      <div className='dossierCompany_photos'>
        <img src={companyPhotoLeft} alt='' />
        <img src={companyPhotoRight} alt='' />
      </div>
    </section>
  );
}

/* ----------------------------------
   Contact et crédits
---------------------------------- */

export function ContactPage({ logos }) {
  const infos = COMPANY_INFOS;

  return (
    <section className='dossierPage dossierPage--contact dossierTypo'>
      <div className='dossierContact'>
        {infos.contacts.map((contact) => (
          <div key={contact.role} className='dossierContact_group'>
            <p className='dossierContact_role' {...editable}>{contact.role}</p>
            <div className='dossierContact_person'>
              <p {...editable}><strong>{contact.name}</strong></p>
              <p {...editable}>{contact.lines.map((line, index) => <React.Fragment key={index}>{index > 0 && <br />}{line}</React.Fragment>)}</p>
            </div>
          </div>
        ))}

        <div className='dossierContact_group dossierContact_group--center'>
          <p {...editable}>{infos.email}</p>
        </div>
        <div className='dossierContact_group dossierContact_group--center'>
          <p {...editable}>
            {infos.name}
            <br />
            {infos.address.map((line, index) => <React.Fragment key={index}>{line}<br /></React.Fragment>)}
          </p>
        </div>
        <div className='dossierContact_group dossierContact_group--center'>
          <p {...editable}>{infos.website}</p>
        </div>
        <div className='dossierContact_group dossierContact_group--center'>
          <p className='dossierContact_role' {...editable}>Crédits</p>
          <p {...editable}>{infos.credits.map((line, index) => <React.Fragment key={index}>{index > 0 && <br />}{line}</React.Fragment>)}</p>
        </div>
        <div className='dossierContact_group dossierContact_group--center'>
          <p {...editable}>{infos.conventions.map((line, index) => <React.Fragment key={index}>{index > 0 && <br />}{line}</React.Fragment>)}</p>
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
