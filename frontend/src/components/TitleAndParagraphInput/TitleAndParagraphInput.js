import './TitleAndParagraphInput.scss'
 
function TitleAndParagraphInput({setList, topic, list, paragraphTopic, titleTopic, paragraphProp, titleProp}) {


    const handleAddItem = () => {
        setList([...list, { [paragraphProp]: '', [titleProp]: '' }]);
    };
    const handleSupprItem = (index) => {
        setList(list.filter((_, i) => i !== index));
    }

    return  (      
        <div className='projectForm_projectPressList'>
            <p>{topic}</p>
            {list.map((item, index) => (
                <div key={index} className='projectForm_projectPressList_line'>
                    <div>
                        <label htmlFor={`inputProjectPressQuote${index}`}>{paragraphTopic}</label>
                        <textarea
                            type='textarea'
                            id={`inputProjectPressQuote${index}`}
                            value= {item[paragraphProp].replace(/<br>/g, "\n")}
                            onChange={(e) => {
                                const updatedList = [...list];
                                updatedList[index][paragraphProp] = e.target.value;
                                setList(updatedList);
                            }}
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor={`inputProjectPressMediaName${index}`}>{titleTopic}</label>
                        <input
                            type='text'
                            id={`inputProjectPressMediaName${index}`}
                            value={item[titleProp]}
                            onChange={(e) => {
                                const updatedList = [...list];
                                updatedList[index][titleProp] = e.target.value;
                                setList(updatedList);
                            }}
                        ></input>
                    </div>
                    <button type='button' onClick={() => handleSupprItem(index)}>SUPPRIMER</button>
                </div>              
            ))}
            <button type='button' onClick={() =>handleAddItem()} >+ AJOUTER UN ARTICLE DE PRESSE</button>
        </div>
    )
}

export default TitleAndParagraphInput