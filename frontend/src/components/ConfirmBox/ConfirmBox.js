import './ConfirmBox.scss'

function ConfirmBox({confirmBoxState, affirmativeChoice, negativeChoice}) {
    
    return (
        <div className={confirmBoxState === false ? "editWorkModal_confirmBox editWorkModal_confirmBox--displayOff" : "editWorkModal_confirmBox editWorkModal_confirmBox--displayOn"}>
            <div className='editWorkModal_confirmBox_container'>
                <p className='editWorkModal_confirmBox_container_question'>Es-tu sûr ?</p>
                <div className='editWorkModal_confirmBox_container_buttons'>
                    <button aria-label="non" onClick={() => negativeChoice() } type='button'>NON</button>
                    <button aria-label="oui" onClick={() => { 
                                                affirmativeChoice();
                                                negativeChoice();
                    }} type='button'>OUI</button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmBox