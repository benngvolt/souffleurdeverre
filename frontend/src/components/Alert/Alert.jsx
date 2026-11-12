
import './Alert.scss'
function Alert({ message }) {
    
    if (!message) return null
  
    return (
    <div className='alert'>
      <div className='alert_box'>
        <p>{message}</p>
      </div>
    </div>
    )
  }

export default Alert