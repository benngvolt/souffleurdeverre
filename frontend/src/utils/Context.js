import React, { createContext } from 'react';
// import { API_URL } from './constants'

export const Context = createContext()

export const Provider = ({ children }) => {
    
    // useEffect(() => {
    //     fetch(`${API_URL}/api/works`)
    //     .then((res) => res.json())
    //     .then((data) => setWorks(data),
    //         console.log('travaux chargés'),
    //     )
    //     .catch((error)=>console.log(error.message))
    // },[loadWorks]);
    
    return (
        <Context.Provider value={null}>
            {children}
        </Context.Provider>
    )
}