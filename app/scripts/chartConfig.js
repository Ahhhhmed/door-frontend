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

var dysplayYAxis = true;

var scatterChart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [{
      fill: false,
      borderColor: "#f16e2d",
      pointBorderColor: "rgba(0,0,0,0)",
      pointBackgroundColor: "rgba(0,0,0,0)",
      pointHoverBackgroundColor: "rgba(0,0,0,0)",
      pointHoverBorderColor: "rgba(0,0,0,0)",
      borderWidth: "2",
      data: data1
    },
      // {
      //   fill: false,
      //   borderColor: "#0956a2",
      //   pointBorderColor: "rgba(0,0,0,0)",
      //   pointBackgroundColor: "rgba(0,0,0,0)",
      //   pointHoverBackgroundColor: "rgba(0,0,0,0)",
      //   pointHoverBorderColor: "rgba(0,0,0,0)",
      //   borderWidth: "2",
      //   data: data1
      // }
      ]
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
      yAxes:[
        {
          display: dysplayYAxis,
        position: 'left',
        scaleShowLabels: false,
        ticks: {
          min: 0,
          max: 200
        },
        gridLines: {
          display: false,
          drawBorder: false
        },
      },
        {
          display: dysplayYAxis,
          position: 'right',
          ticks: {
            min: 0,
            max: 200
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
        }
        ],
      xAxes: [{
        type: 'logarithmic',
        position: 'bottom',
        gridLines: {
          display: false,
          drawBorder: false
        },
        ticks:{
          min: 10,
          max: 20000,
          callback: function(tick, index, ticks) {
            if(tick > 20000){
              return "";
            }
            var str = "" + tick;
            var ind = {
              '1':true,
              '2':true,
              '4':true,
              '5':true
            };
            if(str[0] == '4' && ("" + ticks[index+1])[0] == '5'){
              return "";
            }
            return str[0] in ind?str : "";// new default function here
          }
        }
      }]
    }
  }
});
