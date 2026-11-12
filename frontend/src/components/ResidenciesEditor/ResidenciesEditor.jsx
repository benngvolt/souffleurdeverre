import { useEffect, useState } from 'react';
import EditableItemList from '../EditableItemList/EditableItemList';
import {
    blankResidency,
    formatDateRange,
    getResidencySortDate,
    isBlankResidency,
    sortByDate,
    withOriginalIndex,
} from '../../utils/projectItems';

// Résidences d'un projet : liste de résumés par défaut, formulaire complet au clic
// sur "modifier" ou "ajouter". Les champs écrivent directement dans la liste du parent
// (comme avant) : "retour à la liste" ne perd donc jamais de saisie.
function ResidenciesEditor({ residenciesList, setResidenciesList, residencyTypes, resetSignal }) {
    const [editing, setEditing] = useState(null); // { index, isNew } | null

    // Le parent change ce signal quand il restaure la section (bouton ANNULER) :
    // les indices peuvent alors ne plus correspondre, on revient donc à la liste.
    useEffect(() => {
        setEditing(null);
    }, [resetSignal]);

    function updateField(index, changes) {
        setResidenciesList((previous) =>
            previous.map((residency, i) => (i === index ? { ...residency, ...changes } : residency))
        );
    }

    function removeResidency(index) {
        setResidenciesList((previous) => previous.filter((_, i) => i !== index));
    }

    function handleAdd() {
        setEditing({ index: residenciesList.length, isNew: true });
        setResidenciesList((previous) => [...previous, blankResidency()]);
    }

    function closeEditor() {
        // Un ajout laissé vide ne doit pas créer de résidence fantôme.
        if (editing?.isNew && isBlankResidency(residenciesList[editing.index])) {
            removeResidency(editing.index);
        }
        setEditing(null);
    }

    function handleDelete(index) {
        removeResidency(index);
        setEditing(null);
    }

    /* ---------------------- FORMULAIRE COMPLET ---------------------- */
    const residency = editing ? residenciesList[editing.index] : null;

    if (editing && residency) {
        const index = editing.index;

        return (
            <div className='projectForm_projectResidenciesList'>
                <div className='projectForm_itemEditor'>
                    <button type='button' className='projectForm_itemEditor_back' onClick={closeEditor}>
                        &lt; RETOUR À LA LISTE DES RÉSIDENCES
                    </button>
                    <p className='projectForm_itemEditor_title'>
                        {editing.isNew ? 'NOUVELLE RÉSIDENCE' : 'MODIFIER LA RÉSIDENCE'}
                    </p>
                </div>

                <div className='projectForm_projectResidenciesList_container'>
                    <div className='projectForm_projectResidenciesList_line'>
                        <div>
                            <label htmlFor={`inputProjectResidencyType${index}`}>TYPE DE RÉSIDENCE</label>
                            <select
                                id={`inputProjectResidencyType${index}`}
                                value={residency.residencyType || ''}
                                onChange={(e) => updateField(index, { residencyType: e.target.value })}
                            >
                                <option value=""></option>
                                {residencyTypes.map((residencyType) => (
                                    <option key={residencyType} value={residencyType}>{residencyType}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor={`inputProjectResidencyStartDates${index}`}>DÉBUT RÉSIDENCE</label>
                            <input
                                type='date'
                                id={`inputProjectResidencyStartDates${index}`}
                                value={residency.startDates || ''}
                                onChange={(e) => {
                                    const changes = { startDates: e.target.value };

                                    // La fin est pré-remplie au lendemain du début (champ vidé : on n'y touche pas)
                                    if (e.target.value) {
                                        const nextDay = new Date(e.target.value);
                                        nextDay.setDate(nextDay.getDate() + 1);
                                        changes.endDates = nextDay.toISOString().split('T')[0];
                                    }
                                    updateField(index, changes);
                                }}
                            />
                        </div>
                        <div>
                            <label htmlFor={`inputProjectResidencyEndDates${index}`}>FIN RÉSIDENCE</label>
                            <input
                                type='date'
                                id={`inputProjectResidencyEndDates${index}`}
                                value={residency.endDates || ''}
                                min={residency.startDates}
                                onChange={(e) => updateField(index, { endDates: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor={`inputProjectResidencyCity${index}`}>COMMUNE</label>
                            <input
                                type='text'
                                id={`inputProjectResidencyCity${index}`}
                                value={residency.city || ''}
                                onChange={(e) => updateField(index, { city: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor={`inputProjectResidencyInfos${index}`}>INFOS+</label>
                            <input
                                type='text'
                                id={`inputProjectResidencyInfos${index}`}
                                value={residency.moreInfos || ''}
                                onChange={(e) => updateField(index, { moreInfos: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor={`inputProjectResidencyPlaceName${index}`}>SALLE, LIEU</label>
                            <input
                                type='text'
                                id={`inputProjectResidencyPlaceName${index}`}
                                value={residency.placeName || ''}
                                onChange={(e) => updateField(index, { placeName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor={`inputProjectResidencyPlaceLink${index}`}>LIEN DE LA SALLE, DU LIEU</label>
                            <input
                                type='text'
                                id={`inputProjectResidencyPlaceLink${index}`}
                                value={residency.placeLink || ''}
                                onChange={(e) => updateField(index, { placeLink: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor={`inputProjectResidencyReleaseDate${index}`}>SORTIE DE RÉSIDENCE</label>
                            <input
                                type='datetime-local'
                                id={`inputProjectResidencyReleaseDate${index}`}
                                value={residency.releaseDate || ''}
                                onChange={(e) => updateField(index, { releaseDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className='projectForm_itemEditor_actions'>
                    <button type='button' className='projectForm_itemEditor_actions_done' onClick={closeEditor}>
                        TERMINER
                    </button>
                    <button type='button' className='projectForm_itemEditor_actions_delete' onClick={() => handleDelete(index)}>
                        SUPPRIMER
                    </button>
                </div>
            </div>
        );
    }

    /* ------------------------- LISTE (par défaut) ------------------------- */
    const items = sortByDate(withOriginalIndex(residenciesList), getResidencySortDate).map(({ item, index }) => ({
        key: index,
        title: [item.residencyType || 'Résidence', item.city].filter(Boolean).join(' — '),
        subtitle: [formatDateRange(item.startDates, item.endDates) || 'Dates à définir', item.placeName]
            .filter(Boolean)
            .join(' · '),
        onEdit: () => setEditing({ index, isNew: false }),
        onDelete: () => removeResidency(index),
    }));

    return (
        <div className='projectForm_projectResidenciesList'>
            <EditableItemList
                items={items}
                noun='cette résidence'
                emptyText="Aucune résidence pour l'instant."
                addLabel='+ AJOUTER UNE RÉSIDENCE'
                addClassName='projectForm_projectResidenciesList_addButton'
                onAdd={handleAdd}
            />
        </div>
    );
}

export default ResidenciesEditor;
