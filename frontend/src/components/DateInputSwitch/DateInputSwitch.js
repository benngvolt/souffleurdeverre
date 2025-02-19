import { useState, useEffect } from 'react';
import './DateInputSwitch.scss'

function DateInputSwitch({dateIndex, index, date, showsList, setShowsList}) {


    const [dateInputMode, setDateInputMode] = useState(() =>
    date?.period ? 'period' : 'single'
);

    return (     
        <div className='dateInputSwitch' > 
            {dateInputMode==='single' &&
            <div>
                <input
                    className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_date' 
                    key={dateIndex}
                    type='date'
                    id={`inputProjectShowDates${index}`}
                    value={date.day}
                    onChange={(e) => {
                        const updatedShowsList = [...showsList];
                        if (!updatedShowsList[index].dates[dateIndex].period) {
                            updatedShowsList[index].dates[dateIndex].period = {};
                        }
                        updatedShowsList[index].dates[dateIndex].day = e.target.value;
                        updatedShowsList[index].dates[dateIndex].period.endDate = '';
                        updatedShowsList[index].dates[dateIndex].period.startDate = '';
                        setShowsList(updatedShowsList);
                    }}
                />
                <p  className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_switchButton'
                    onClick={(e) => {
                    setDateInputMode('period');
                    }} > ** SWITCH TO<strong> PERIOD </strong></p>
            </div>
            }
            {dateInputMode==='period' &&
            <div>
                <p className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_fromTo' >du</p>
                <input
                    className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_date'
                    key={`inputProjectShowPeriodStartDate${dateIndex}`}
                    type='date'
                    id={`inputProjectShowPeriodStartdate${index}`}
                    value={date.period?.startDate || ''}
                    onChange={(e) => {
                        const updatedShowsList = [...showsList];
                        if (!updatedShowsList[index].dates[dateIndex].period) {
                            updatedShowsList[index].dates[dateIndex].period = {};
                        }
                        updatedShowsList[index].dates[dateIndex].day = '';
                        updatedShowsList[index].dates[dateIndex].period.startDate = e.target.value;
                        setShowsList(updatedShowsList);
                    }}
                />
                <p className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_fromTo'>au</p>
                <input
                    className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_date'
                    key={`inputProjectShowPeriodEndDate${dateIndex}`}
                    type='date'
                    id={`inputProjectShowPeriodEnddate${index}`}
                    value={date.period?.endDate || ''}
                    onChange={(e) => {
                        const updatedShowsList = [...showsList];
                        if (!updatedShowsList[index].dates[dateIndex].period) {
                            updatedShowsList[index].dates[dateIndex].period = {};
                        }
                        updatedShowsList[index].dates[dateIndex].day = '';
                        updatedShowsList[index].dates[dateIndex].period.endDate = e.target.value;
                        setShowsList(updatedShowsList);
                    }}
                />
                <p onClick={(e) => {
                    setDateInputMode('single');
                    }} 
                    className='projectForm_projectShowsList_container_dates_gridDisplay_singleDay_switchButton'
                    > ** SWITCH TO<strong> SINGLE </strong></p>
            </div>
            }
        </div>
    )   
}

export default DateInputSwitch