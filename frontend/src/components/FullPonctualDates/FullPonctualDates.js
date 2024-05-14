import '../../pages/OneSpectacle/OneSpectacle.scss'
import '../../pages/Actualite/Actualite.scss'


function FullPonctualDates({datesArray, className}) {

    const monthNames = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    const formatDay = (dateString, index, totalDates) => {
        const date = new Date(dateString);
        const day = ("0" + date.getDate()).slice(-2); // Ajoute un zéro devant si nécessaire

        if (index === totalDates - 1) {
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        } else if (new Date(datesArray[index + 1].day).getMonth() !== date.getMonth() || new Date(datesArray[index + 1].day).getFullYear() !== date.getFullYear()) {
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        } else {
            const month = monthNames[date.getMonth()];
            return `${day} ${month}`;
        }
    };

    const formatTimes = (times) => {
        return times.map((time, index) => {
            const formattedTime = time.timeInfos ? `${time.time} ${time.timeInfos}` : `${time.time}`;
            return index === times.length - 1 ? formattedTime : `${formattedTime}, `;
        }).join('');
    };

    const totalDates = datesArray.length;
    const sortedDatesArray = datesArray.sort((a, b) => new Date(a.day) - new Date(b.day));

    return  ( 
        <div className={`${className}_dates`}>
            {sortedDatesArray.map((date, index) => (
                <div className={`${className}_dates_singleDate`} key={index}>
                    <p className={`${className}_dates_singleDate_day`}> {`${formatDay(date.day, index, totalDates)}`} </p>
                    {date.times.length > 0 && (
                    <p className={`${className}_dates_singleDate_time`}>{formatTimes(date.times)}</p>
                    )}
                </div>
            ))}
        </div> 
    )
}

export default FullPonctualDates;