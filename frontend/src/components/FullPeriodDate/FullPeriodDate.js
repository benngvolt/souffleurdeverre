import './FullPeriodDate.scss'
import '../../pages/OneSpectacle/OneSpectacle.scss'
 
function FullPeriodDate({startISODate, endISODate}) {

let startDate = new Date(startISODate);
let endDate = new Date(endISODate);

// Tableau des noms des mois
const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

// Obtenir les composants de date de début
let startDay = startDate.getDate();
let startMonthIndex = startDate.getMonth();
let startYear = startDate.getFullYear();

// Obtenir les composants de date de date de fin
let endDay = endDate.getDate();
let endMonthIndex = endDate.getMonth();
let endYear = endDate.getFullYear();

// Formats de date complet

let fullStartDateString = function () {
    if (startYear===endYear && startMonthIndex===endMonthIndex) {
        return ((startDay < 10 ? '0' : '') + startDay )
    }
    else if (startYear===endYear && startMonthIndex!=endMonthIndex) {
        return ((startDay < 10 ? '0' : '') + startDay + ' ' + monthNames[startMonthIndex])
    } 
    else {
        return (((startDay < 10 ? '0' : '') + startDay + ' ' + monthNames[startMonthIndex] + ' ' + startYear))
    }
}

let fullEndDateString = (endDay < 10 ? '0' : '') + endDay + ' ' + monthNames[endMonthIndex] + ' ' + endYear;


    return  (      
        <span className='oneSpectacle_mainDatas_residenciesAndShows_residenciesList_typeContainer_list_item_text_date'>du {fullStartDateString()} au {fullEndDateString} </span>
    )
}

export default FullPeriodDate