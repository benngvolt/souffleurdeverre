import '../ProjectForm/ProjectForm.scss';
import { useEffect, useRef } from 'react';
import 'trix';
import '../../utils/trix.scss';

function TitleAndParagraphInput({ setList, topic, list, paragraphTopic, titleTopic, paragraphProp, titleProp }) {
    
    // Référence pour stocker les instances Trix
    const trixRefs = useRef([]);

    const handleAddItem = () => {
        setList([...list, { [paragraphProp]: '', [titleProp]: '' }]);
    };

    const handleSupprItem = (index) => {
        const trixEditor = trixRefs.current[index];
        if (trixEditor) {
            trixEditor.removeEventListener('trix-change', handleTrixChange);
        }
        // Supprimer l'élément de la liste
        const updatedList = list.filter((_, i) => i !== index);
        // Mettre à jour le contenu des Trix Editors
        updatedList.forEach((item, idx) => {
            const trixEditor = trixRefs.current[idx].editor;
            if (trixEditor) {
                trixEditor.setSelectedRange([0, 0]);
                trixEditor.loadHTML(item[paragraphProp]);
            }
        });
        // Mettre à jour la liste
        setList(updatedList);
    };

    useEffect(() => {
        // Mettre à jour le contenu du Trix Editor lorsque bioBiography change
        trixRefs.current.forEach((trix, index) => {
            const trixEditor = trix?.editor;
            if (trixEditor) {
                trixEditor.setSelectedRange([0, 0]);
                trixEditor.loadHTML(list[index][paragraphProp]);
            }
        });
    }, [setList]);

    

    useEffect(() => {
        // Mettre en place les gestionnaires d'événements trix-change pour chaque Trix Editor
        trixRefs.current.forEach((trix, index) => {
            if (trix) {
                trix.addEventListener('trix-change', (event) => {
                    handleTrixChange(index, event.target.value);
                });
            }
        });
    }, [list, paragraphProp, trixRefs.current]);

    const handleTrixChange = (index, content) => {
        setList(prevList => {
            const updatedList = [...prevList];
            updatedList[index][paragraphProp] = content;
            return updatedList;
        });
        console.log(list);
    };

    return (
        <div className='projectForm_projectParagraphList'>
            <p className='projectForm_projectParagraphList_topic'>{topic}</p>
            {list.map((item, index) => (
            <div key={index} className='projectForm_projectParagraphList_line'>
                <div className='projectForm_projectParagraphList_line_title'>
                    <label htmlFor={`inputProjectParagraphTitle${index}`}>{titleTopic}</label>
                    <input
                        type='text'
                        id={`inputProjectParagraphTitle${index}`}
                        value={item[titleProp]}
                        onChange={(e) => {
                            const updatedList = [...list];
                            updatedList[index][titleProp] = e.target.value;
                            setList(updatedList);
                        }}
                    />
                </div>
                <div className='projectForm_projectParagraphList_line_paragraph'>
                    <label htmlFor={`inputProjectParagraphText${index}`}>{paragraphTopic}</label>
                    <input
                        id={`trix-paragraph${index}`}
                        type="hidden"
                        name="content"
                        defaultValue={item[paragraphProp]}
                    />
                    <trix-editor
                        id={`inputProjectDescription${index}`}
                        input={`trix-paragraph${index}`}
                        ref={trixRef => trixRefs.current[index] = trixRef}
                    />
                </div>
                <button className='projectForm_projectParagraphList_line_supprButton' type='button' onClick={() => handleSupprItem(index)}>SUPPRIMER</button>
            </div>
            ))}
            <button className='projectForm_projectParagraphList_addButton' type='button' onClick={handleAddItem}>+ AJOUTER UN PARAGRAPHE</button>
        </div>
    );
}

export default TitleAndParagraphInput;