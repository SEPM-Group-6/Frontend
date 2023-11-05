import './App.css';
import { useState, useRef, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

//graph function only works for 1 day, after that it needs to be reset (in backend supply only data from current day)
//when receiving data from either microcontroller or frontend assign date in backend
//could add correctness display (when change button is pressed, correctness goes down) - 1-total number of data points/number of times change button is pressed
//when changing the number of people inside, send separate request to backend to add new point to database for this data - to be displayed in the graph
//sanitize input for number of people in the backend

//assumption that use can only change the number of people inside when there are no people entering or exiting

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

  /* useffect for intial render */
  useEffect(() => {
    getNumberOfPeopleInside()
  }, [])
  
  const [edit, setEdit] = useState(true)

  const [valueToDisplay, setValueToDisplay] = useState(0)

  function handleChange() {
    setEdit(!edit)
    if (valueToDisplay === '' || parseInt(valueToDisplay) <= 0 || valueToDisplay == -0) {
      setValueToDisplay(0)
    } else {
      setValueToDisplay(parseInt(valueToDisplay))
    }
  }

  return (
    <div className='main-padding'>
      <div className='heading'>Software-Engineering Project Group 6 Dashboard</div>

      <div className='row mt-4' style={{padding:'20px'}}>
        <div className='col-12 col-sm-6 bottom-part'>

          <div className='sub-heading' style={{color:'grey'}}>People inside</div>
          <div className='mt-1' style={{fontSize:'2.5rem'}}><input type='number' disabled={edit} onChange={(e) => (setValueToDisplay(e.target.value))} value={valueToDisplay} className='input'></input></div>
          <button className='mt-3 button button-text' onClick={() => handleChange()} style={{border:'none',borderRadius:'4px',backgroundColor:'#555555',padding:'0px 20px',transition:'all 0.35s'}}>{(edit?'Change':'Apply')}</button><br></br>
            
        </div>
        
        <div className={'col-12 bottom-part' + (data[data.length-1][3] - data[0][3] > 2 ? ' col-sm-12':' col-sm-6')} style={{borderRadius:'4px',padding:'0px 12px'}}>
          <div className='sub-heading' style={{color:'grey'}}>Activity Graph</div>
          <Stack direction="row" sx={{ width: '100%' }}>
            <Box sx={{ flexGrow: 1 }}>
              <SparkLineChart 
              data={data.map((item) => (item[5]))}

              xAxis={{
                scaleType: 'time',
                data:data.map((item) => (new Date(item[0], item[1], item[2], item[3], item[4]))),
                valueFormatter: (value) => {
                  const month = value.toLocaleString('en-US', { month: 'short' });
                  const day = value.getDate();
                  var minutes = value.getMinutes();
                  if (minutes < 10) {
                    var minutes = `0${minutes}`;
                  }
                  const customText = "Date: "; // Add your custom text here
                  return `${customText}${month} ${day}, ${value.getHours()}:${minutes}`;
                }, }} 
                height={100} 
                showTooltip 
                showHighlight
                valueFormatter={(value) => `People inside: ${value}`}
                />                
            </Box>
          </Stack>
        </div>
      </div>
      
    </div>
  );
}

export default App;
