

function FullPonctualDates({datesArray}) {

    const monthNames = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ];

    // const fullDatesArray = datesArray.map((isoDate) => {

    //     let date = new Date(isoDate);
    //     let minutes = date.getMinutes();
    //     let hours = date.getHours();
    //     let day = date.getDate();
    //     let monthIndex = date.getMonth();
    //     let year = date.getFullYear();

    //     let formattedHours = hours < 10 ? '0' + hours : hours;
    //     let formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        
    //     return (day < 10 ? '0' : '') + day + ' ' + monthNames[monthIndex] + ' ' + year;
    // });
    const groupedDates = datesArray.reduce((acc, isoDate) => {
        const date = new Date(isoDate);
        const monthIndex = date.getMonth();
        const day = date.getDate();
        const year = date.getFullYear();
        // création d'une chaîne de caractères utilisée comme clé pour chaque groupe de dates.
        const key = `${monthIndex}-${year}`;
        /* nous vérifions si cet élément existe déjà dans l'accumulateur acc. 
        Si ce n'est pas le cas, cela signifie qu'il s'agit du premier élément pour ce mois et cette année. 
        Nous initialisons donc un tableau vide pour cette clé.*/
        if (!acc[key]) {
            acc[key] = [];
        }
        
        acc[key].push(day);
        
        return acc;
    }, {});

    const fullDatesArray = Object.entries(groupedDates).map(([key, daysArray]) => {
        const [monthIndex, year] = key.split('-').map(Number);
        const monthName = monthNames[monthIndex];
        const formattedDays = daysArray.map(day => (day < 10 ? '0' : '') + day).join(' et ');
        return `${formattedDays} ${monthName} ${year}`;
    });
    
    
        return  ( 
            <div>
                {fullDatesArray.map((date)=>(
                    <span className='oneSpectacle_residenciesList_rehearsals_list_item_dates'> {date} </span>
                ))}
            </div>   
        )
    }
    
    export default FullPonctualDates