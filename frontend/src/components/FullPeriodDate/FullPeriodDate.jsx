import './FullPeriodDate.scss';
import '../../pages/OneSpectacle/OneSpectacle.scss';

function FullPeriodDate({ startISODate, endISODate, className }) {
  let startDate = new Date(startISODate);
  let endDate = new Date(endISODate);

  // Tableau des noms des mois
  const monthNames = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];

  // Obtenir les composants de date de début en UTC
  let startDay = startDate.getUTCDate();
  let startMonthIndex = startDate.getUTCMonth();
  let startYear = startDate.getUTCFullYear();

  // Obtenir les composants de date de date de fin en UTC
  let endDay = endDate.getUTCDate();
  let endMonthIndex = endDate.getUTCMonth();
  let endYear = endDate.getUTCFullYear();

  // Formats de date complet
  let fullStartDateString = function () {
    if (startYear === endYear && startMonthIndex === endMonthIndex) {
      return ((startDay < 10 ? '0' : '') + startDay);
    } else if (startYear === endYear && startMonthIndex !== endMonthIndex) {
      return ((startDay < 10 ? '0' : '') + startDay + ' ' + monthNames[startMonthIndex]);
    } else {
      return (((startDay < 10 ? '0' : '') + startDay + ' ' + monthNames[startMonthIndex] + ' ' + startYear));
    }
  };

  // Corriger la déclaration de fullEndDateString pour en faire une fonction
  let fullEndDateString = function () {
    return (endDay < 10 ? '0' : '') + endDay + ' ' + monthNames[endMonthIndex] + ' ' + endYear;
  };

  return (
    <span className={className}>{fullStartDateString()} au {fullEndDateString()}</span>
  );
}

export default FullPeriodDate;