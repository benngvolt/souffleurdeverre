import { useEffect, useState } from 'react';
import DateInputSwitch from '../DateInputSwitch/DateInputSwitch';
import EditableItemList from '../EditableItemList/EditableItemList';
import {
    blankShow,
    blankShowDate,
    getShowSortDate,
    isBlankShow,
    sortByDate,
    summarizeShowDates,
    withOriginalIndex,
} from '../../utils/projectItems';

// Représentations d'un projet : liste de résumés par défaut, formulaire complet (lieu, dates,
// horaires) au clic sur "modifier" ou "ajouter". Les champs écrivent directement dans la liste
// du parent : "retour à la liste" ne perd jamais de saisie.
function ShowsEditor({ showsList, setShowsList, resetSignal }) {
    const [editing, setEditing] = useState(null); // { index, isNew } | null

    useEffect(() => {
        setEditing(null);
    }, [resetSignal]);

    // Copie profonde du lieu modifié : on ne mute jamais l'état React (ni les instantanés Valider/Annuler)
    function updateShow(index, mutate) {
        setShowsList((previous) =>
            previous.map((show, i) => {
                if (i !== index) return show;
                const copy = structuredClone(show);
                mutate(copy);
                return copy;
            })
        );
    }

    function removeShow(index) {
        setShowsList((previous) => previous.filter((_, i) => i !== index));
    }

    function handleAdd() {
        setEditing({ index: showsList.length, isNew: true });
        setShowsList((previous) => [...previous, blankShow()]);
    }

    function closeEditor() {
        // Un ajout laissé vide ne doit pas créer de lieu fantôme.
        if (editing?.isNew && isBlankShow(showsList[editing.index])) {
            removeShow(editing.index);
        }
        setEditing(null);
    }

    function handleDelete(index) {
        removeShow(index);
        setEditing(null);
    }

    const addDate = (index) => updateShow(index, (show) => {
        show.dates = [...(show.dates || []), blankShowDate()];
    });
    const removeDate = (index, dateIndex) => updateShow(index, (show) => {
        show.dates = (show.dates || []).filter((_, i) => i !== dateIndex);
    });
    const addTime = (index, dateIndex) => updateShow(index, (show) => {
        const date = show.dates[dateIndex];
        date.times = [...(date.times || []), { time: '', timeInfos: '' }];
    });
    const removeTime = (index, dateIndex, timeIndex) => updateShow(index, (show) => {
        const date = show.dates[dateIndex];
        date.times = (date.times || []).filter((_, i) => i !== timeIndex);
    });

    /* ---------------------- FORMULAIRE COMPLET ---------------------- */
    const show = editing ? showsList[editing.index] : null;

    if (editing && show) {
        const index = editing.index;

        return (
            <div className='projectForm_projectShowsList'>
                <div className='projectForm_itemEditor'>
                    <button type='button' className='projectForm_itemEditor_back' onClick={closeEditor}>
                        &lt; RETOUR À LA LISTE DES REPRÉSENTATIONS
                    </button>
                    <p className='projectForm_itemEditor_title'>
                        {editing.isNew ? 'NOUVEAU LIEU DE REPRÉSENTATION' : 'MODIFIER LE LIEU DE REPRÉSENTATION'}
                    </p>
                </div>

                <div className='projectForm_projectShowsList_container'>
                    <div>
                        <div className='projectForm_projectShowsList_container_infos'>
                            <div>
                                <label htmlFor={`inputProjectShowCity${index}`}>COMMUNE DE REPRÉSENTATION:</label>
                                <input
                                    type='text'
                                    id={`inputProjectShowCity${index}`}
                                    value={show.city || ''}
                                    onChange={(e) => updateShow(index, (copy) => { copy.city = e.target.value; })}
                                />
                            </div>
                            <div>
                                <label htmlFor={`inputProjectShowPlaceName${index}`}>LIEU DE REPRÉSENTATION</label>
                                <input
                                    type='text'
                                    id={`inputProjectShowPlaceName${index}`}
                                    value={show.placeName || ''}
                                    onChange={(e) => updateShow(index, (copy) => { copy.placeName = e.target.value; })}
                                />
                            </div>
                            <div>
                                <label htmlFor={`inputProjectShowPlaceLink${index}`}>LIEN VERS LE LIEU</label>
                                <input
                                    type='text'
                                    id={`inputProjectShowPlaceLink${index}`}
                                    value={show.placeLink || ''}
                                    onChange={(e) => updateShow(index, (copy) => { copy.placeLink = e.target.value; })}
                                />
                            </div>
                            <div>
                                <label htmlFor={`inputProjectShowInfos${index}`}>INFOS+</label>
                                <input
                                    type='text'
                                    id={`inputProjectShowInfos${index}`}
                                    value={show.moreInfos || ''}
                                    onChange={(e) => updateShow(index, (copy) => { copy.moreInfos = e.target.value; })}
                                />
                            </div>
                        </div>

                        <div className='projectForm_projectShowsList_container_dates'>
                            <label>DATES DE REPRÉSENTATION:</label>
                            <div className='projectForm_projectShowsList_container_dates_gridDisplay'>
                                {show.dates?.map((date, dateIndex) => (
                                    <div className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay' key={dateIndex}>
                                        <DateInputSwitch
                                            dateIndex={dateIndex}
                                            index={index}
                                            date={date}
                                            showsList={showsList}
                                            setShowsList={setShowsList}
                                        />

                                        <div className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_times'>
                                            {date.times?.map((time, timeIndex) => (
                                                <div className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_times_timeContainer' key={timeIndex}>
                                                    <input
                                                        className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_times_timeContainer_singleTime'
                                                        type='time'
                                                        value={time.time || ''}
                                                        onChange={(e) => updateShow(index, (copy) => {
                                                            copy.dates[dateIndex].times[timeIndex].time = e.target.value;
                                                        })}
                                                    />
                                                    <label>INFOS SUPP.:</label>
                                                    <input
                                                        className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_times_timeContainer_moreInfosInput'
                                                        type='text'
                                                        value={time.timeInfos || ''}
                                                        onChange={(e) => updateShow(index, (copy) => {
                                                            copy.dates[dateIndex].times[timeIndex].timeInfos = e.target.value;
                                                        })}
                                                    />
                                                    <button
                                                        className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_times_timeContainer_supprButton'
                                                        type='button'
                                                        onClick={() => removeTime(index, dateIndex, timeIndex)}
                                                    >
                                                        SUPPR HORAIRE
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_times_addButton'
                                                type='button'
                                                onClick={() => addTime(index, dateIndex)}
                                            >
                                                +HORAIRE
                                            </button>
                                        </div>
                                        <button
                                            className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_supprButton'
                                            type='button'
                                            onClick={() => removeDate(index, dateIndex)}
                                        >
                                            SUPPRIMER DATE
                                        </button>
                                    </div>
                                ))}
                                <button
                                    className='projectForm_projectShowsList_container_dates_gridDisplay_addButton'
                                    type='button'
                                    onClick={() => addDate(index)}
                                >
                                    +AJOUTER UNE DATE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='projectForm_itemEditor_actions'>
                    <button type='button' className='projectForm_itemEditor_actions_done' onClick={closeEditor}>
                        TERMINER
                    </button>
                    <button type='button' className='projectForm_itemEditor_actions_delete' onClick={() => handleDelete(index)}>
                        SUPPRIMER LE LIEU
                    </button>
                </div>
            </div>
        );
    }

    /* ------------------------- LISTE (par défaut) ------------------------- */
    const items = sortByDate(withOriginalIndex(showsList), getShowSortDate).map(({ item, index }) => ({
        key: index,
        title: [item.city, item.placeName].filter(Boolean).join(' — ') || 'Lieu sans nom',
        subtitle: summarizeShowDates(item.dates) || 'Dates à définir',
        onEdit: () => setEditing({ index, isNew: false }),
        onDelete: () => removeShow(index),
    }));

    return (
        <div className='projectForm_projectShowsList'>
            <EditableItemList
                items={items}
                noun='ce lieu de représentation'
                emptyText="Aucun lieu de représentation pour l'instant."
                addLabel='+ AJOUTER UN LIEU'
                addClassName='projectForm_projectShowsList_addButton'
                onAdd={handleAdd}
            />
        </div>
    );
}

export default ShowsEditor;
