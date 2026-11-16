import { createPortal } from 'react-dom';
import { PHOTO_LAYOUTS } from '../../utils/dossier/dossierState';

/* Petit schéma d'une disposition : la page (zone blanche à gauche, comme dans le dossier) et les photos. */
export function LayoutIcon({ layout }) {
  return (
    <span className={`layoutIcon layoutIcon--${layout}`} aria-hidden='true'>
      <span className='layoutIcon_margin' />
      <span className='layoutIcon_grid'>
        {Array.from({ length: PHOTO_LAYOUTS[layout].count }, (_, index) => (
          <span key={index} className='layoutIcon_photo' />
        ))}
      </span>
    </span>
  );
}

const GROUPS = [
  { title: '3 photos', layouts: ['three-bottom', 'three-left'] },
  { title: '2 photos', layouts: ['two-stacked', 'two-columns'] },
  { title: '1 photo', layouts: ['one'] },
];

/* Panneau de réglage d'une page photo : choix de la disposition par de petits schémas. */
function PhotoLayoutPanel({ page, pageNumber, onChoose, onClose }) {
  return createPortal(
    <aside className='dossierPanel' aria-label='Disposition de la page photo'>
      <div className='dossierPanel_header'>
        <p className='dossierPanel_title'>PAGE PHOTO{pageNumber ? ` · ${pageNumber}` : ''}</p>
        <button type='button' className='dossierPanel_done' onClick={onClose}>
          TERMINÉ
        </button>
      </div>

      <p className='dossierPanel_label'>Disposition des photos</p>
      <p className='dossierPanel_hint'>
        La zone occupée reste la même (même largeur, toute la hauteur). Si vous passez à moins de photos que celles déjà placées,
        vous choisirez celles que vous gardez.
      </p>

      {GROUPS.map((group) => (
        <div key={group.title} className='layoutPicker_group'>
          <p className='layoutPicker_title'>{group.title}</p>
          <div className='layoutPicker_options'>
            {group.layouts.map((layout) => (
              <button
                key={layout}
                type='button'
                className={`layoutPicker_option ${page.layout === layout ? 'layoutPicker_option--current' : ''}`}
                onClick={() => onChoose(page.id, layout)}
                aria-label={PHOTO_LAYOUTS[layout].label}
                aria-pressed={page.layout === layout}
                title={PHOTO_LAYOUTS[layout].label}
              >
                <LayoutIcon layout={layout} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>,
    document.body
  );
}

export default PhotoLayoutPanel;
