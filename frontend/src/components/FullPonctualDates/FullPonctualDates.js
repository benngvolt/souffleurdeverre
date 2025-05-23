import '../../pages/OneSpectacle/OneSpectacle.scss'
import '../../pages/Actualite/Actualite.scss'
import FullPeriodDate from '../FullPeriodDate/FullPeriodDate';


function FullPonctualDates({datesArray, className}) {

    const monthNames = [
        "janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre"
      ];

    // const formatDay = (dateString, index, totalDates) => {
    //     const date = new Date(dateString);
    //     const day = ("0" + date.getDate()).slice(-2); // Ajoute un zéro devant si nécessaire

    //     if (index === totalDates - 1) {
    //         const month = monthNames[date.getMonth()];
    //         const year = date.getFullYear();
    //         return `${day} ${month} ${year}`;
    //     } else if (new Date(datesArray[index + 1].day).getMonth() !== date.getMonth() || new Date(datesArray[index + 1].day).getFullYear() !== date.getFullYear()) {
    //         const month = monthNames[date.getMonth()];
    //         const year = date.getFullYear();
    //         return `${day} ${month} ${year}`;
    //     } else {
    //         const month = monthNames[date.getMonth()];
    //         return `${day} ${month}`;
    //     }
    // };
    const formatDay = (dateString, index, totalDates) => {
        const date = new Date(dateString + "T00:00:00Z"); // Interprète toujours comme UTC
        const day = date.getUTCDate();
        const month = monthNames[date.getUTCMonth()];
        const year = date.getUTCFullYear();
    
        if (index === totalDates - 1 || 
            new Date(datesArray[index + 1].day + "T00:00:00Z").getUTCMonth() !== date.getUTCMonth() || 
            new Date(datesArray[index + 1].day + "T00:00:00Z").getUTCFullYear() !== date.getUTCFullYear()) {
            return `${day} ${month} ${year}`;
        } else {
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
                    {date.day &&
                    <p className={`${className}_dates_singleDate_day`}> {`${formatDay(date.day, index, totalDates)}`} </p>
                    }
                    {date.period &&
                    <FullPeriodDate
                        startISODate={date.period.startDate}
                        endISODate={date.period.endDate}
                        className={`${className}_dates_singleDate_day`}
                    />
                    }
                    {date.times.length > 0 && (
                        <p className={`${className}_dates_singleDate_time`}>{formatTimes(date.times)}</p>
                        )}
                    
                </div>
            ))}
        </div> 
    )
}

export default FullPonctualDates;