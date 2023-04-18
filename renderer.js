// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { SerialPort } = require('serialport')
const tableify = require('tableify')
const Chart = require('chart.js');

// get the objects for chart.js real time data
const canvas = document.getElementById('myChart');
const ctx = canvas.getContext('2d');
// Initialisation of the chart
var vector = [];
var t = [];
var config = {
  type: 'line',
  data: {
    labels: t,
    datasets: [{
      label: 'My First dataset',
      data: vector,
      fill: false,
    }]
  },
  options: {
    responsive: true,
    animation : false,
    scales: {
      y:{
          max: 512,
          min: 0,
      }
    }
  },
};
var c = new Chart(ctx, config);

// list all serial port
async function listSerialPorts() {
  await SerialPort.list().then((ports, err) => {
    if (err) {
      document.getElementById('error').textContent = err.message
      return
    } else {
      document.getElementById('error').textContent = ''
    }
    console.log('ports', ports);

    if (ports.length === 0) {
      document.getElementById('error').textContent = 'No ports discovered'
    }

    tableHTML = tableify(ports)
    document.getElementById('ports').innerHTML = tableHTML
  })
}

// Set a timeout that will check for new serialPorts after 2 seconds.
setTimeout(listSerialPorts, 2000);

// Create a serial port (replace the serial port you want to use)
const port = new SerialPort({
  path: 'COM5',
  baudRate: 115200,
}, (err) => {
  if (err) {
    return console.log('Error: ', err.message)
  }
});

// this event listener is called when the button sendData is clicked
document.getElementById('sendData').addEventListener('click', () => {
  port.write('H', (err) => {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    console.log('message written')
  })
});

// this loop asks periodically for data
window.setInterval(() => {
  port.write('H', (err) => {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    console.log('message written')
  })
}, 10);

// this event listener is called when the serial port receives data
port.on('readable', function () {
  let a = port.read().toString().split(',');
  port.flush();
  let b = parseInt(a[0]);
  console.log(b);
  vector.push(b);
  if(t.length==0){
    t.push(0);
  }else{
    t.push(t[t.length-1]+1);
  }
  document.getElementById('receivedData').textContent = b;
  if (vector.length > 100) {
    vector.shift();
    t.shift();
  }
  config.data.datasets[0].data = vector;
  config.data.labels = t;
  c.update();
})