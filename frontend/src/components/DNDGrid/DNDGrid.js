import  './DNDGrid.scss'

function DNDGrid ({children}) {
    
    return (
        <div className={`dndGrid`}>
            {children}
        </div>
    );
}
export default DNDGrid