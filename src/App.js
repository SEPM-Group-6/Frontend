import './App.css';
import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
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
//notification when threshold is met

function App() {
  const [data, setData] = useState([[]])

  const [settingPeopleInside, setSettingPeopleInside] = useState(false)

  const [overlappingDiv2, setOverlappingDiv2] = useState(true)

  async function getNumberOfPeopleInside() {
    const response = await fetch('https://wfb24jp1fc.execute-api.eu-central-1.amazonaws.com/Test', {method: 'GET',headers: {'Content-Type': 'application/json'}});
    const datas = await response.json()

    //sort data by time
    datas.body.sort((a, b) => (a['EnterID'] > b['EnterID']) ? 1 : -1)

    //keep only one data point per minute, if there are multiple data points in one minute, take the last one
    let i = 0
    while (i < datas.body.length-1) {
      if (datas.body[i]['EnterID'].slice(0,16) === datas.body[i+1]['EnterID'].slice(0,16)) {
        datas.body.splice(i,1)
      }
      else {
        i++
      }
    }
    
        
    const new_array = []
    datas.body.map(item => {
      new_array.push(parseDateTime(item['EnterID'],item["People_Count"]))}
    )

    setData(new_array)
    
    console.log(settingPeopleInside,overlappingDiv2)
    if (settingPeopleInside === false && new_array.length !== 0){
      setValueToDisplay(new_array[new_array.length-1][6])
    }
  }

  async function changeNumberOfPeopleInside(value) {
    try{
      const response = await fetch('https://meks4q3843.execute-api.eu-central-1.amazonaws.com/Test/?People_Count='+value, {method: 'POST',headers: {'Content-Type': 'application/json'}});
    } catch (error) {
      console.log(error)
    }
  }
  

  useEffect(() => {
    let intervalId;
    if (!settingPeopleInside) {
      intervalId = setInterval(() => {
        getNumberOfPeopleInside();
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [settingPeopleInside]);

  function parseDateTime(dateTimeString,value) {
    const [datePart, timePart] = dateTimeString.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, seconds] = timePart.split(':').map(Number);
  
    return [year, month, day, hour, minute, seconds, value];
  }
  
  const [edit, setEdit] = useState(true)

  const [valueToDisplay, setValueToDisplay] = useState(0)

  const [thresholdMet, setThresholdMet] = useState(false)

  function handleChange() {
    //async function to send data to backend
    changeNumberOfPeopleInside(valueToDisplay)
    setSettingPeopleInside(false)
    setOverlappingDiv2(true)
  }

  const [settingThreshold, setSettingThreshold] = useState(false)

  const [threshold, setThreshold] = useState(30)

  const [overlappingDiv, setOverlappingDiv] = useState(true)

  function checkThreshold() {
    if (valueToDisplay >= threshold) {
      setThresholdMet(true)
    } else {
      setThresholdMet(false)
      return false
    }
  }

  useEffect(() => {
    checkThreshold()
  }, [valueToDisplay])

  const formattedData = data.map(timestamp => {
    const [year, month, day, hours, minutes, seconds] = timestamp;
    return new Date(year, month, day, hours, minutes, seconds);
  });

  return (
    <div className='main-padding' style={{boxShadow: thresholdMet?'inset 0 0 20px 2px red':''}}>
      <div className='heading'>Software-Engineering Project Dashboard - Group 6</div>

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
        {data.length !== 0
        ?
        <div className={'col-12 bottom-part' + (data.length !== 0 && data[data.length-1][3] - data[0][3] >= 2 ? ' col-sm-12':' col-sm-6')} style={{borderRadius:'4px',padding:'0px 12px'}}>
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
                      const seconds = value.getSeconds();
                      const amOrPm = hours >= 12 ? 'PM' : 'AM';
                      const formattedHours = hours % 12 === 0 ? 12 : hours % 12; // Adjust 0 to 12 for AM/PM
                      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
                      const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
                      return `Time: ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${amOrPm}`;
                    },
                  },
                ]}
                yAxis={[
                  { id: 'linearAxis',
                  scaleType: 'linear',
                 },
                ]}
                series={[
                  { yAxisKey: 'linearAxis', data: (data.length > 0?data.map((item) => item[6]):[]),valueFormatter: (value) => `Number of people: ${value}`,},
                ]}
                leftAxis="linearAxis"
                height={300}
              />
            </Box>
          </Stack>
        </div>
        :
        null}

      </div>
      
    </div>
  );
}

export default App;
