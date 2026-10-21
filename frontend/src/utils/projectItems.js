// Helpers pour les listes de résidences / représentations de l'éditeur de projet.

// 'YYYY-MM-DD' (ou ISO complet) -> '22 janv. 2024'. Parsé à la main pour éviter
// tout décalage de fuseau horaire d'un `new Date('YYYY-MM-DD')` (interprété en UTC).
export function formatShortDate(isoDay) {
    if (!isoDay) return '';

    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDay);
    if (!match) return String(isoDay);

    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatDateRange(startDate, endDate) {
    if (startDate && endDate && startDate !== endDate) {
        return `du ${formatShortDate(startDate)} au ${formatShortDate(endDate)}`;
    }
    return formatShortDate(startDate || endDate);
}

// Résumé lisible des dates d'une représentation : "12 mars 2025, du 3 au 6 avr. 2025 +2"
export function summarizeShowDates(dates, maxVisible = 3) {
    // Affichage chronologique, sans modifier l'ordre réellement saisi
    const sortKey = (date) => date?.day || date?.period?.startDate || '';
    const labels = [...(dates || [])]
        .sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
        .map((date) => {
            if (date?.period?.startDate && date?.period?.endDate) {
                return formatDateRange(date.period.startDate, date.period.endDate);
            }
            return formatShortDate(date?.day);
        })
        .filter(Boolean);

    if (labels.length === 0) return '';
    if (labels.length <= maxVisible) return labels.join(' · ');
    return `${labels.slice(0, maxVisible).join(' · ')} +${labels.length - maxVisible}`;
}

export function blankResidency() {
    return {
        residencyType: '',
        startDates: '',
        endDates: '',
        releaseDate: '',
        city: '',
        placeName: '',
        placeLink: '',
        moreInfos: '',
    };
}

export function blankShow() {
    return {
        dates: [{ day: '', period: { startDate: '', endDate: '' }, times: [{ time: '', timeInfos: '' }] }],
        city: '',
        placeName: '',
        placeLink: '',
        showsNumber: '',
        moreInfos: '',
    };
}

export function blankShowDate() {
    return { day: '', period: { startDate: '', endDate: '' }, times: [{ time: '', timeInfos: '' }] };
}

const isEmpty = (value) => value === undefined || value === null || String(value).trim() === '';

export function isBlankResidency(residency) {
    if (!residency) return true;

    return ['residencyType', 'startDates', 'endDates', 'releaseDate', 'city', 'placeName', 'placeLink', 'moreInfos']
        .every((field) => isEmpty(residency[field]));
}

export function isBlankShow(show) {
    if (!show) return true;

    const hasText = ['city', 'placeName', 'placeLink', 'moreInfos'].some((field) => !isEmpty(show[field]));
    if (hasText) return false;

    return !(show.dates || []).some((date) =>
        !isEmpty(date?.day) ||
        !isEmpty(date?.period?.startDate) ||
        !isEmpty(date?.period?.endDate) ||
        (date?.times || []).some((time) => !isEmpty(time?.time) || !isEmpty(time?.timeInfos))
    );
}

// Tri chronologique pour l'affichage en liste ; on garde l'index d'origine pour éditer/supprimer.
export function withOriginalIndex(list) {
    return (list || []).map((item, index) => ({ item, index }));
}

export function sortByDate(entries, getDate) {
    return [...entries].sort((a, b) => {
        const dateA = getDate(a.item);
        const dateB = getDate(b.item);

        // Les éléments sans date passent en fin de liste
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.localeCompare(dateB);
    });
}

export const getResidencySortDate = (residency) => residency?.startDates || '';

export const getShowSortDate = (show) => {
    const firstDate = show?.dates?.[0];
    return firstDate?.day || firstDate?.period?.startDate || '';
};
