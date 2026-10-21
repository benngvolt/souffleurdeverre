import './LogosList.scss';
import { withProtocol } from '../../utils/withProtocol';

// Rangée de logos (partenaires, soutiens...) : même rendu sur la page Compagnie et sur les pages spectacle.
function LogosList({ logos }) {
    if (!logos || logos.length === 0) return null;

    return (
        <ul className='logosList'>
            {logos.map((logo) => (
                <li key={logo._id} className='logosList_item'>
                    {logo.linkUrl ? (
                        <a href={withProtocol(logo.linkUrl)} target='_blank' rel='noreferrer'>
                            <img src={logo.imageUrl} alt={logo.altText || logo.name} loading='lazy' />
                        </a>
                    ) : (
                        <img src={logo.imageUrl} alt={logo.altText || logo.name} loading='lazy' />
                    )}
                </li>
            ))}
        </ul>
    );
}

export default LogosList;
