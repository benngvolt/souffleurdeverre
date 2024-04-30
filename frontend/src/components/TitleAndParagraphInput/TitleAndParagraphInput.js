import React, { useEffect, useRef } from 'react';
import 'trix';
import '../../utils/trix.scss';

function TitleAndParagraphInput({ setList, topic, list, paragraphTopic, titleTopic, paragraphProp, titleProp, trixRefs, displayForm }) {

    const handleAddItem = () => {
        setList([...list, { [paragraphProp]: '', [titleProp]: '' }]);
    };

    const handleSupprItem = (index) => {
        const updatedList = list.filter((_, i) => i !== index);
        const updatedRefs = trixRefs.current.filter((_, i) => i !== index);
        trixRefs.current = updatedRefs;
        setList(updatedList);
    };

    const handleTrixChange = (index, content) => {
        setList(prevList => {
            const updatedList = [...prevList];
            updatedList[index][paragraphProp] = content;
            return updatedList;
        });
    };

    useEffect(() => {
        trixRefs.current.forEach((trix, index) => {
            const trixEditor = trix?.editor;
            if (trix && trixEditor) {
                trixEditor.setSelectedRange([0, 0]);
                trixEditor.loadHTML(list[index][paragraphProp]);
            }
        });
    }, [displayForm, trixRefs.current]);

    useEffect(() => {
        trixRefs.current.forEach((trix, index) => {
            const trixEditor = trix?.editor;
            if (trix && trixEditor) {
                const handleTrixChangeWrapper = (event) => {
                    handleTrixChange(index, event.target.value);
                };
                trix.addEventListener('trix-change', handleTrixChangeWrapper);
                return () => {
                    trix.removeEventListener('trix-change', handleTrixChangeWrapper);
                };
            }
        });
    }, [list, paragraphProp, trixRefs.current]);

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
                    <label htmlFor={`inputProjectParagraphText${paragraphProp}${index}`}>{paragraphTopic}</label>
                    <input
                        id={`trix-paragraph${paragraphProp}${index}`}
                        type="hidden"
                        name="content"
                        defaultValue={item[paragraphProp]}
                    />
                    <trix-editor
                        id={`inputProjectDescription${paragraphProp}${index}`}
                        input={`trix-paragraph${paragraphProp}${index}`}
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