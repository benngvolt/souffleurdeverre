import { API_URL } from './constants';

export const AUTH_TOKEN_KEY = '1';

export function getAuthToken() {
    return window.sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token) {
    window.sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

export function isLoggedIn() {
    return !!getAuthToken();
}

/**
 * Wrapper fetch centralisé : préfixe API_URL, gère le header d'auth,
 * sérialise le JSON, et lève une erreur cohérente (avec .status et .payload)
 * sur toute réponse non-ok.
 */
export async function apiFetch(path, { method = 'GET', auth = false, json, body, headers = {} } = {}) {
    const finalHeaders = { ...headers };
    let finalBody = body;

    if (json !== undefined) {
        finalHeaders['Content-Type'] = 'application/json';
        finalBody = JSON.stringify(json);
    }

    if (auth) {
        finalHeaders['Authorization'] = `Bearer ${getAuthToken()}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers: finalHeaders,
        body: finalBody,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
        ? await response.json().catch(() => null)
        : null;

    if (!response.ok) {
        const error = new Error(payload?.message || payload?.error || 'La requête a échoué');
        error.status = response.status;
        error.payload = payload;
        throw error;
    }

    return payload;
}
