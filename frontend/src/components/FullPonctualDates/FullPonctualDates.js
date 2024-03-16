function FullPonctualDates({datesArray}) {

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
            return day;
        }
    };

    const formatTimes = (times) => {
        return times.map((time, index) => {
            const formattedTime = time.timeInfos ? `${time.time} ${time.timeInfos}` : time.time;
            return index === times.length - 1 ? formattedTime : `${formattedTime}, `;
        }).join('');
    };

    const totalDates = datesArray.length;

    return  ( 
        <div>
            {datesArray.map((date, index) => (
                <div key={index}>
                    <span className='oneSpectacle_residenciesList_rehearsals_list_item_dates'> {`${formatDay(date.day, index, totalDates)}  -`} </span>
                    {date.times.length > 0 && (
                        <span>{formatTimes(date.times)}</span>
                    )}
                </div>
            ))}
        </div> 
    )
}

export default FullPonctualDates;

// function FullPonctualDates({ datesArray }) {
//     const monthNames = [
//         "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
//         "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
//     ];

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         const day = date.getDate();
//         const month = monthNames[date.getMonth()];
//         const year = date.getFullYear();
//         return `${day} ${month} ${year}`;
//     };

//     const formatConsecutiveDates = (dates) => {
//         let formattedDates = [];

//         for (let i = 0; i < dates.length; i++) {
//             const currentDate = new Date(dates[i].day);
//             let consecutiveRange = [dates[i]];

//             // Find consecutive dates
//             while (i < dates.length - 1) {
//                 const nextDate = new Date(dates[i + 1].day);
//                 const oneDay = 1000 * 60 * 60 * 24;

//                 if ((nextDate - currentDate) / oneDay === 1) {
//                     consecutiveRange.push(dates[i + 1]);
//                     i++;
//                 } else {
//                     break;
//                 }
//             }

//             // Format consecutive dates
//             if (consecutiveRange.length > 1) {
//                 formattedDates.push(`du ${formatDate(consecutiveRange[0].day)} au ${formatDate(consecutiveRange[consecutiveRange.length - 1].day)}`);
//             } else {
//                 formattedDates.push(formatDate(consecutiveRange[0].day));
//             }
//         }

//         return formattedDates;
//     };

//     return (
//         <div>
//             {formatConsecutiveDates(datesArray).map((formattedDate, index) => (
//                 <div key={index}>
//                     <span className='oneSpectacle_residenciesList_rehearsals_list_item_dates'>{formattedDate}</span>
//                     {datesArray.filter(date => formatDate(date.day) === formattedDate).map((date, index) => (
//                         <div key={index}>
//                             {date.times.map((time, index) => (
//                                 <div key={index}>
//                                     <p>{time.time}</p>
//                                     {time.timeInfos &&
//                                         <p>{time.timeInfos}</p>
//                                     }
//                                 </div>
//                             ))}
//                         </div>
//                     ))}
//                 </div>
//             ))}
//         </div>
//     );
// }

// export default FullPonctualDates;