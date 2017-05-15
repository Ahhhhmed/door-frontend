var ctx = document.getElementById("myChart");

function asd(data) {
  var i = 0;
  return data.map((x)=>{
    i += 1;
    return {
      x: i,
      y: x
    }
  })
}

var data1 = [1,2,3,4,5,6];
data1 = asd(data1);
var data2 = [6,5,4,3,2,1];
data2 = asd(data2);

var scatterChart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [{
      fill: false,
      borderColor: "#ff2c36",
      pointBorderColor: "rgba(0,0,0,0)",
      pointBackgroundColor: "rgba(0,0,0,0)",
      pointHoverBackgroundColor: "rgba(0,0,0,0)",
      pointHoverBorderColor: "rgba(0,0,0,0)",
      borderWidth: "2",
      data: data1
    },
      {
        fill: false,
        borderColor: "#51f93d",
        pointBorderColor: "rgba(0,0,0,0)",
        pointBackgroundColor: "rgba(0,0,0,0)",
        pointHoverBackgroundColor: "rgba(0,0,0,0)",
        pointHoverBorderColor: "rgba(0,0,0,0)",
        borderWidth: "2",
        data: data1
      }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    legend:{
      display: false
    },
    tooltips:{
      enabled: false
    },
    animation: {
      duration: 100
    },
    scales: {
      yAxes:[{
        position: 'left',
        ticks: {
          min: 0,
          max: 200
        },
        gridLines: {
          display: false
        },
      },
        {
          position: 'right',
          ticks: {
            min: 0,
            max: 200
          },
          gridLines: {
            display: false
          },
        }],
      xAxes: [{
        type: 'linear',
        position: 'bottom',
        gridLines: {
          display: false
        },
        ticks:{
          min: 0,
          max: 200
        }
      }]
    }
  }
});
setInterval(()=>{
  var data = [];
  var data2 = [];
  for(var i=0; i < 200; i++){
    data = data.concat([100 + Math.random() * 10]);
    data2 = data2.concat([Math.random() * 10]);
  }
  data = asd(data);
  data2 = asd(data2);
  scatterChart.data.datasets[0].data = data;
  scatterChart.data.datasets[1].data = data2;
  scatterChart.update();

}, 100);
