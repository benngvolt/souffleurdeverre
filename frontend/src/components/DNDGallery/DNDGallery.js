import React, {useState, useEffect} from 'react'
import './DNDGallery.scss'

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import DNDGrid from '../DNDGrid/DNDGrid';
import { DNDSortableSingleItem } from '../DNDSortableSingleItem/DNDSortableSingleItem';


function DNDGallery ({ imageFiles, setImageFiles, mainImageIndex, setMainImageIndex}) {

  //GET SERIES
  useEffect(() => {
    setItems(imageFiles)
  },[imageFiles]);

  const [items, setItems] = useState(imageFiles);
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const [mainImageId, setMainImageId] = useState(null)

  /*------------------------------
  ----- OUVERTURE CONFIRMBOX -----
  ------------------------------*/
  const [confirmBoxState, setConfirmBoxState] = useState (false);
  const [indexImageToDelete, setIndexImageToDelete] = useState(null);
    
  function openConfirmBox(index) {
    setConfirmBoxState(true);
    setIndexImageToDelete(index);
  }

  /*------------------------------------
  ----- FERMETURE CONFIRMBOX -----
  ------------------------------------*/
  function closeConfirmBox() {
    setConfirmBoxState(false);
  }

  /*---------------------------
  ----- EFFACER UNE PHOTO -----
  ---------------------------*/
  function deleteImage(indexImageToDelete) {
        
    const items = Array.from(imageFiles);
    items.splice(indexImageToDelete, 1);
    setImageFiles(items);
    if (indexImageToDelete < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1)
    } else if (indexImageToDelete === mainImageIndex) {
      setMainImageIndex(0)
    }
    setConfirmBoxState (false);
};


  return (

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        mainImageIndex={mainImageIndex}
        setMainImageIndex={setMainImageIndex}
      >
        <SortableContext items={items} strategy={rectSortingStrategy} mainImageIndex={mainImageIndex} setMainImageIndex={setMainImageIndex}>
          <DNDGrid>
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <DNDSortableSingleItem 
                itemsNumber={items.length}
                item={item} 
                key={item._id} 
                itemId={item._id} 
                index={index} 
                mainImageIndex={mainImageIndex}
                setMainImageIndex={setMainImageIndex}
                imageFiles={imageFiles}
                setImageFiles={setImageFiles}
                openConfirmBox={() => openConfirmBox(index)}
                />
              ))
            ) : (
                <p className="">Aucune image à afficher</p>
            )}
          </DNDGrid>
        </SortableContext>
        <DragOverlay adjustScale={true}>
          {activeId ? (
            <img  className='projectForm_DNDGallery_overlayImage'
                  itemId={activeId} 
                  index={items.indexOf(activeId)} 
                  alt='' 
                  src={items.find(item => item._id === activeId).imageUrl}/>
          ) : null}
        </DragOverlay>
        <div className={confirmBoxState===false ? 'projectForm_DNDGallery_confirmBox projectForm_DNDGallery_confirmBox--displayOff' : 'projectForm_DNDGallery_confirmBox projectForm_DNDGallery_confirmBox--displayOn'}>
          <p className='projectForm_DNDGallery_confirmBox_label'>Êtes-vous sûr ?</p>
          <div className='projectForm_DNDGallery_confirmBox_buttons'>
            <button aria-label="Valider la suppression de l'image" type='button' onClick={() => deleteImage(indexImageToDelete)}>OUI</button>
            <button aria-label="Annuler la suppression de l'image" type='button' onClick={() => closeConfirmBox () }>NON</button>
          </div>
        </div>
      </DndContext>
  );


  //DÉFINITION DE L'ID DE L'ÉLÉMENT SÉLECTIONNÉ À DÉPLACER
  function handleDragStart(event) {
    setActiveId(event.active.id);
    setMainImageId(items[mainImageIndex]._id);
    console.log(imageFiles);
  }

  //DÉFINITION DE L'ID DE L'ÉLÉMENT D'ARRIVÉE
  async function handleDragEnd(event) {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      //RÉORGANISATION DES ÉLÉMENTS
      const oldIndex = items.findIndex((item) => item._id === active.id);
      const newIndex = items.findIndex((item) => item._id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      
      //MISE A JOUR DE L'IMAGE PRINCIPALE
      const newMainIndex = newItems.findIndex((item) => item._id === mainImageId);
      setMainImageIndex(newMainIndex);
  
      // MISE A JOUR DE L'ÉTAT 'ITEMS'
      setItems(newItems);
  
      // MISE A JOUR DE L'ÉTAT 'IMAGEFILES'
      setImageFiles(newItems);
      
      // RÉINITIALISATION DE L'ACTIVE ID
      setActiveId(null);
      setMainImageId(null);
    } else {
      setActiveId(null);
      setMainImageId(null);
    }
  console.log(imageFiles);
  }

  function handleDragCancel() {
    setActiveId(null);
    setMainImageId(null);
  }
};



export default DNDGallery;