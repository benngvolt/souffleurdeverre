import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';

// Liste compacte d'éléments (lieux de résidence, de représentation...) : un résumé par ligne,
// avec modifier / supprimer. Le formulaire complet n'est affiché qu'à la demande par le parent.
function EditableItemList({ items, noun, emptyText, addLabel, addClassName, onAdd }) {
    return (
        <div className='projectForm_itemList'>
            {items.length === 0 ? (
                <p className='projectForm_itemList_empty'>{emptyText}</p>
            ) : (
                <ul className='projectForm_itemList_items'>
                    {items.map(({ key, title, subtitle, onEdit, onDelete }) => (
                        <li key={key} className='projectForm_itemList_item'>
                            <button
                                type='button'
                                className='projectForm_itemList_item_text'
                                onClick={onEdit}
                                aria-label={`Modifier ${noun} : ${title}`}
                            >
                                <span className='projectForm_itemList_item_title'>{title}</span>
                                {subtitle && <span className='projectForm_itemList_item_subtitle'>{subtitle}</span>}
                            </button>
                            <div className='projectForm_itemList_item_buttons'>
                                <button type='button' aria-label={`Modifier ${noun}`} onClick={onEdit}>
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </button>
                                <button type='button' aria-label={`Supprimer ${noun}`} onClick={onDelete}>
                                    <FontAwesomeIcon icon={faTrashCan} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <button className={addClassName} type='button' onClick={onAdd}>{addLabel}</button>
        </div>
    );
}

export default EditableItemList;
