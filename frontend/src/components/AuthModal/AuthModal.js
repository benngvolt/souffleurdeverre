import React, { useContext, useState } from 'react';
import './AuthModal.scss';
import { Context } from '../../utils/Context';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../utils/constants';
import ErrorText from '../ErrorText/ErrorText';

function AuthModal({ handleAuthModal, authModalDisplay }) {
    const { setLoggedIn, setLoggedOut } = useContext(Context);
    const navigate = useNavigate();

    const [displayError, setDisplayError] = useState(false);
    const [displayServerError, setDisplayServerError] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const onSubmit = async (event) => {
        event.preventDefault();
    
        const authData = {
            username,
            password
        };
    
        try {
            const response = await fetch(`${API_URL}/api/users/`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(authData)
            });
    
            // Vérifier le code de réponse HTTP
            if (response.status === 401) {
                // Erreur d'authentification
                setDisplayError(true);
                setLoggedOut();
                console.log('Non authentifié');
            } else if (response.status === 500) {
                // Erreur interne du serveur
                setDisplayServerError(true);
                console.log('Erreur serveur');
            } else {
                // Si le code de réponse est autre que 401 ou 500
                const data = await response.json();
    
                if (data.token) {
                    setDisplayError(false);
                    const tokenValue = JSON.stringify(data.token);
                    const token = tokenValue.replace(/"/g, '');
                    setLoggedIn();
                    handleAuthModal();
                    navigate('/edit');
                    window.sessionStorage.setItem("1", token);
                    console.log('Authentifié');
                } else {
                    setDisplayError(true);
                    setLoggedOut();
                    console.log('Non authentifié');
                }
            }
        } catch (error) {
            // Erreur de connexion
            console.error(error);
            setDisplayServerError(true);
        }
    };

    const closeAuthModal = () => {
        handleAuthModal();
        setDisplayError(false);
        setDisplayServerError(false);
    }

    return (
        <div className={authModalDisplay === true ? 'authModal authModal--displayOn' : 'authModal authModal--displayOff'}>
            <form onSubmit={onSubmit} className='authModal_form'>
                <p className='authModal_form_alert'></p>
                <div className='authModal_form_usernameField'>
                    <label>USERNAME</label>
                    <input type='text' name='username' value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className='authModal_form_passwordField'>
                    <label>PASSWORD</label>
                    <input type='password' name='password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <ErrorText errorText={'Accès non-autorisé'} state={displayError}/>
                <ErrorText errorText={'Une erreur est survenue'} state={displayServerError}/>
                <button type='submit' aria-label="Soumettre le formulaire d'authentification" className='authModal_form_button'>LOGIN</button>
            </form>
            <button onClick={closeAuthModal} aria-label="Fermer la modale d'authentification" className='authModal_button'>CLOSE</button>
        </div>
    );
}

export default AuthModal;