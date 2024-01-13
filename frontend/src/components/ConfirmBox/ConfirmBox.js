import './ConfirmBox.scss'
    
function ConfirmBox({closeConfirmBox, deleteProject, deleteBio, confirmBoxState, deleteMode}) {
    
    return (
        <div className={confirmBoxState === false ? "editWorkModal_confirmBox editWorkModal_confirmBox--displayOff" : "editWorkModal_confirmBox editWorkModal_confirmBox--displayOn"}>
            <div className='editWorkModal_confirmBox_container'>
                <p className='editWorkModal_confirmBox_container_question'>{deleteMode==='serie' ? 'Voulez-vous vraiment supprimer cette série?' : 'Voulez-vous vraiment supprimer cet event?'}</p>
                <div className='editWorkModal_confirmBox_container_buttons'>
                    <button aria-label="Valider la suppression" onClick={() => {deleteMode==='bio' ? deleteBio() : deleteProject()}}>OUI</button>
                    <button aria-label="Annuler la suppression" onClick={() => closeConfirmBox() } type='button'>NON</button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmBox