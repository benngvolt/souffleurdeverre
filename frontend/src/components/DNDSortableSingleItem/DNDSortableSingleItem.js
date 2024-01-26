import './DNDSortableSingleItem.scss'
import {useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faTrashCan, faCertificate, faCircle} from '@fortawesome/free-solid-svg-icons'

export const DNDSortableSingleItem = (props) => {
  const sortable = useSortable({id: props.itemId});
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = sortable;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

/*-------------------------------------------------
----- CHOISIR LA PHOTO PRINCIPALE DE LA SÉRIE -----
-------------------------------------------------*/

async function handleMainImage(index) {
    if (index >= 0 && index <= props.imageFiles.length -1) {
      props.setMainImageIndex(index)
    } else {
      props.setMainImageIndex(0)
    }
}


  return (
    <div className={`dndItem dndItem_${props.itemsNumber}_item_${props.index}`} ref={setNodeRef}
      style={style}
      {...props}
      {...attributes}
      {...listeners}>
      <img className='dndItem_image'
        src={props.item.imageUrl ?? (props.item instanceof File ? props.item.sampleImageUrl : '')}
        alt=''/>
      <div className='dndItem_buttons'>
          <button aria-label="Supprimer l'image" className='dndItem_buttons_supprButton'
            onMouseDown={() => {
              props.openConfirmBox(props.index);
          }}
          draggable="false"
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </button>
          <button aria-label="Définir cette image comme image principale de la série" className='dndItem_buttons_isMainButton'
            onMouseDown={() => { handleMainImage(props.index); }} >
            <FontAwesomeIcon icon={props.index === props.mainImageIndex ? faCertificate : faCircle} className={props.index === props.mainImageIndex ? 'dndItem_buttons_isMainButton--isOrange' : 'dndItem_buttons_isMainButton--isWhite'} />
          </button>
      </div>
    </div>
  );
};
