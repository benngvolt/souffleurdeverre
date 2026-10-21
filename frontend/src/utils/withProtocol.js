// Les liens saisis à la main (ex. "clermont-ferrand.fr") doivent être absolus, sinon le navigateur
// les interprète comme un chemin relatif du site.
export function withProtocol(url) {
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
