import './App.css';
import { useState, useRef, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { LineChart } from '@mui/x-charts';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

//graph function only works for 1 day, after that it needs to be reset (in backend supply only data from current day)
//when receiving data from either microcontroller or frontend assign date in backend
//could add correctness display (when change button is pressed, correctness goes down) - 1-total number of data points/number of times change button is pressed
//when changing the number of people inside, send separate request to backend to add new point to database for this data - to be displayed in the graph
//sanitize input for number of people in the backend
//add threshold for number of people inside (if number of people inside is greater than threshold, display warning)

//assumption that use can only change the number of people inside when there are no people entering or exiting
//visualy only allow for up to 99 people to enter a room

//call checkThreshold() when changing the number of people inside through socket
//notofication when threshold is met

function App() {

  async function getNumberOfPeopleInside() {
    const response = await fetch('http://localhost:3000/numberOfPeopleInside')
    const data = await response.json()
    setValueToDisplay(data.numberOfPeopleInside)
  }

  async function changeNumberOfPeopleInside() {
    const response = await fetch('http://localhost:3000/changeNumberOfPeopleInside', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({numberOfPeopleInside: valueToDisplay})
    })
    const data = await response.json()
    console.log(data)
  }

  const data = [[2023, 11, 5, 14, 51, 1], [2023, 11, 5, 14, 52, 3], [2023, 11, 5, 14, 54, 4], [2023, 11, 5, 14, 55, 2], [2023, 11, 5, 14, 56, 3], [2023, 11, 5, 14, 57, 5], [2023, 11, 5, 14, 58, 8], [2023, 11, 5, 14, 59, 12], [2023, 11, 5, 15, 0, 13], [2023, 11, 5, 15, 1, 12], [2023, 11, 5, 15, 3, 15], [2023, 11, 5, 15, 6, 13], [2023, 11, 5, 15, 7, 12], [2023, 11, 5, 15, 8, 11], [2023, 11, 5, 15, 11, 8], [2023, 11, 5, 15, 12, 7], [2023, 11, 5, 15, 13, 5], [2023, 11, 5, 15, 15, 1], [2023, 11, 5, 15, 16, 0], [2023, 11, 5, 15, 17, 0]]
  
  const [edit, setEdit] = useState(true)

  const [valueToDisplay, setValueToDisplay] = useState(0)

  const [overlappingDiv2, setOverlappingDiv2] = useState(true)

  const [thresholdMet, setThresholdMet] = useState(false)

  function handleChange() {
    setEdit(!edit)
    setSettingPeopleInside(false)
    setOverlappingDiv2(true)

    if (valueToDisplay === '' || parseInt(valueToDisplay) <= 0 || valueToDisplay == -0) {
      setValueToDisplay(0)
    } else {
      setValueToDisplay(parseInt(valueToDisplay))
    }

    checkThreshold()
  }

  const [settingThreshold, setSettingThreshold] = useState(false)

  const [threshold, setThreshold] = useState(30)

  const [overlappingDiv, setOverlappingDiv] = useState(true)

  const [settingPeopleInside, setSettingPeopleInside] = useState(false)

  function checkThreshold() {
    if (valueToDisplay >= threshold) {
      setThresholdMet(true)
    } else {
      setThresholdMet(false)
      return false
    }
  }

  const formattedData = data.map(timestamp => {
    const [year, month, day, hours, minutes, seconds] = timestamp;
    return new Date(year, month - 1, day, hours, minutes, seconds);
  });

  return (
    <div className='main-padding'>
      <div className='heading'>Software-Engineering Project Group 6 Dashboard</div>

      <div className='row mt-4' style={{padding:'20px'}}>

        <div className='col-6 col-sm-3 bottom-part'>

          <div className='sub-heading' style={{color:'grey',position:'relative'}}>People inside <a></a></div>
          <div className='mt-1 input' style={{fontSize:'2.5rem',position:'relative'}}><input type='number' disabled={!settingPeopleInside} onChange={(e) => (setValueToDisplay(e.target.value))} value={valueToDisplay} className='input'></input><div className='input' onClick={() => (setSettingPeopleInside(true),setOverlappingDiv2(false))} style={{position:'absolute',backgroundColor:'transparent',zIndex:'2',left:'0px',top:'0px',width:'100%',height:'100%',display:(overlappingDiv2?'block':'none')}}></div></div>
          <button className='mt-3 button button-text' onClick={() => handleChange()} style={{border:'none',borderRadius:'4px',backgroundColor:'#555555',padding:'0px 20px',visibility:(settingPeopleInside?'visible':'hidden'),opacity:(settingPeopleInside?'1':'0'),transition:'all 0.35s'}} >Apply</button><br></br>
            
        </div>

        <div className='col-6 col-sm-3 bottom-part'>

          <div className='sub-heading' style={{color:'grey',position:'relative'}}>Threshold <WarningAmberRoundedIcon className='top' style={{visibility:(thresholdMet?'visible':'hidden'),opacity:(thresholdMet?'1':'0'),transition:'all 0.35s',color:'red',position:'absolute',top:'2px'}}/></div>
          <div className='mt-1 input' style={{fontSize:'2.5rem',position:'relative'}}><input type='number' disabled={!settingThreshold} onChange={(e) => (setThreshold(e.target.value))} value={threshold} className='input'></input><div className='input' onClick={() => (setSettingThreshold(true),setOverlappingDiv(false))} style={{position:'absolute',backgroundColor:'transparent',zIndex:'2',left:'0px',top:'0px',width:'100%',height:'100%',display:(overlappingDiv?'block':'none')}}></div></div>
          <button className='mt-3 button button-text' onClick={() => (setThreshold(threshold),setSettingThreshold(false),setOverlappingDiv(true),checkThreshold())} style={{border:'none',borderRadius:'4px',backgroundColor:'#555555',padding:'0px 20px',visibility:(settingThreshold?'visible':'hidden'),opacity:(settingThreshold?'1':'0'),transition:'all 0.35s'}}>Set</button><br></br>
            
        </div>
        
        <div className={'col-12 bottom-part' + (data[data.length-1][3] - data[0][3] > 2 ? ' col-sm-12':' col-sm-6')} style={{borderRadius:'4px',padding:'0px 12px'}}>
          <div className='sub-heading' style={{color:'grey'}}>Activity Graph</div>
          <Stack direction="row" sx={{ width: '100%' }}>
            <Box sx={{ flexGrow: 1 }}>              
              <LineChart
              colors={['#666666']}
                xAxis={[
                  {
                    data: formattedData,
                    label: 'Time', 
                    scaleType: 'time', 
                    valueFormatter: (value) => {
                      const hours = value.getHours();
                      const minutes = value.getMinutes();
                      const amOrPm = hours >= 12 ? 'PM' : 'AM';
                      const formattedHours = hours % 12 === 0 ? 12 : hours % 12; // Adjust 0 to 12 for AM/PM
                      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
                      return `Time: ${formattedHours}:${formattedMinutes} ${amOrPm}`;
                    },
                  },
                ]}
                yAxis={[
                  { id: 'linearAxis',
                  scaleType: 'linear',
                 },
                ]}
                series={[
                  { yAxisKey: 'linearAxis', data: data.map((item) => item[5]),valueFormatter: (value) => `Number of people: ${value}`,},
                ]}
                leftAxis="linearAxis"
                height={300}
              />
            </Box>
          </Stack>
        </div>

      </div>
      
    </div>
  );
}

export default App;
