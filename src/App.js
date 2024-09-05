import { Button, Container, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, TextField } from '@mui/material';
import { getMyBagData } from './api';
import './App.css';
import { LineChart } from './components/LineChart.js'
import { useState } from 'react';

import { getMyBagDataUsers } from './services/MyBagDataRequest.js';

function getMyBagLineChartData(myBagData, plus13Only, elevation) {
  myBagData.Clubs.sort((a, b) => {
    return a.AvgDistance - b.AvgDistance;
  });

  const datasets = myBagData.Clubs.map((club) => {
    let clubData = getDataForElevation(club, elevation, plus13Only);
    return {
      label: club.Name,
      data: clubData,
      borderColor: club.Color
    };
  });

  let labels = [];
  // labels = ['+12','+11', '+10','+9', '+8','+7'];
  if (plus13Only) {
    labels = ['+13', '+12','+11', '+10','+9', '+8','+7', '+6','+5', '+4','+3', '+2','+1', '0'];
  } else {
    labels = ['+13', '+12','+11', '+10','+9', '+8','+7', '+6','+5', '+4','+3', '+2','+1', '0', '-1', '-2','-3', '-4','-5', '-6','-7', '-8','-9', '-10','-11', '-12','-13'];
  }
  const data = {
    labels: labels,
    datasets: datasets
  }

  return data;
}

function getDataForElevation(club, elevation, plus13Only) {
  let elevationMap = getElevationMap(club);
  let elevationIndex = 2500 * Math.trunc(elevation / 2500);
  let remainder = elevation % 2500;
  if (remainder === 0) {
    console.log([elevationMap[elevationIndex].AvgPositive13DegreeDistance, elevationMap[elevationIndex].AvgDistance, elevationMap[elevationIndex].AvgNegative13DegreeDistance]);
    if(plus13Only){
      return getDegreedData([elevationMap[elevationIndex].AvgPositive13DegreeDistance, elevationMap[elevationIndex].AvgDistance]);
    }
    return getDegreedData([elevationMap[elevationIndex].AvgPositive13DegreeDistance, elevationMap[elevationIndex].AvgDistance, elevationMap[elevationIndex].AvgNegative13DegreeDistance]);
  }
  let percentage = remainder / 2500;

  let lowElevation = elevationIndex;
  let highElevation = lowElevation + 2500;

  console.log("High Elevation: ", highElevation);

  let highValPlus13 = elevationMap[highElevation].AvgPositive13DegreeDistance;
  let highValAvg = elevationMap[highElevation].AvgDistance;
  let highValNeg13 = elevationMap[highElevation].AvgNegative13DegreeDistance;

  let lowValPlus13 = elevationMap[lowElevation].AvgPositive13DegreeDistance;
  let lowValAvg = elevationMap[lowElevation].AvgDistance;
  let lowValNeg13 = elevationMap[lowElevation].AvgNegative13DegreeDistance;

  let difPlus13 = highValPlus13 - lowValPlus13;
  let difAvg = highValAvg - lowValAvg;
  let difNeg13 = highValNeg13 - lowValNeg13;

  let newValPlus13 = lowValPlus13 + (difPlus13 * percentage)
  let newValAvg = lowValAvg + (difAvg);
  let newValNeg13 = lowValNeg13 + (difNeg13);


  getDegreedData([newValPlus13, newValAvg, newValNeg13]);
  
  if(plus13Only){
    return getDegreedData([newValPlus13, newValAvg]);
  }
  return getDegreedData([newValPlus13, newValAvg, newValNeg13]);
}

function getDegreedData(data){
  let allData= [];
  //Only 12 to 7
  for(let i = 0; i < data.length; i++){
    if(i === data.length - 1){
      allData.push(data[i]);
      continue;
    }

    let dif = (data[i+1] - data[i]) / 13;
    allData.push(data[i]);
    let currVal = data[i];
    for(let k = 0; k < 12; k++){
      currVal += dif;
      allData.push(currVal);
    }
  }

  // allData = [allData[1], allData[2], allData[3], allData[4], allData[5],allData[6]]
  console.log(allData);

  return allData;
}

function getElevationMap(club) {
  let items = new Map();
  club.Elevations.forEach((elev) => {
    items[elev.Elevation] = elev;
  })
  return items;
}

function App() {
  const [username, setUsername] = useState('');
  const [plus13Only, setPlus13Only] = useState(false);
  const [elevation, setElevation] = useState(0);
  const [tempElev, setTempElev] = useState(0);

  getMyBagDataUsers();
  let myBagUserData = require('./data/MyBagData.json');
  const myBagData = getMyBagData(username);


  let lineChartData;
  if (myBagData !== '') {
    lineChartData = getMyBagLineChartData(myBagData, plus13Only, elevation);
  }
  return (
    <Container>
      <div style={{ padding: "20px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-evenly'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <FormControl sx={{ m: 1, minWidth: 300 }}>
              <InputLabel id='user-select'>User</InputLabel>
              <Select
                labelId='user-select-label'
                id='user-select'
                value={username}
                label="User"
                onChange={changeUser}
              >
                {Object.keys(myBagUserData).map((username) => {
                  let name = username;
                  if(username.match(/[A-Z][a-z]+|[0-9]+/g) !== null){
                    name = username.match(/[A-Z][a-z]+|[0-9]+/g).join(" ")
                  }
                  return <MenuItem value={username}>{name}</MenuItem>
                })}
              </Select>
            </FormControl>
          </div>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <FormControl style={{}}>
              <FormControlLabel control={<Switch value={plus13Only} onChange={handlePlus13OnlyChange} />} label="+13 Only" />
            </FormControl>
          </div>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <TextField id="elevation" label="Elevation" value={tempElev} variant='outlined' onChange={handleElevationChange} />
          </div>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Button variant="contained" onClick={calculateElevation}>Update</Button>
          </div>
        </div>

        {username !== '' &&
          <LineChart data={lineChartData} />
        }

      </div>

    </Container>
  )


  function changeUser(event) {
    setUsername(event.target.value)
  }

  function handlePlus13OnlyChange() {
    setPlus13Only(!plus13Only)
  }

  function handleElevationChange(e) {
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    let number;
    if (onlyNums.length < 10) {
      number = onlyNums;
    } else if (onlyNums.length === 10) {
      number = onlyNums.replace(
        /(\d{3})(\d{3})(\d{4})/,
        '($1) $2-$3'
      );
    }
    if (number > 12500) {
      number = 12500;
    }
    setTempElev(number);
  }

  function calculateElevation() {
    console.log('clicked');
    if (myBagData !== '') {
      setElevation(tempElev);
    }
  }


}

export default App;
