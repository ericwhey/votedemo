angular.module("main",['angular-websocket']).controller('MyCtrl', function($scope,$websocket,$http) {
    var uri = document.location.pathname;

    $scope.choices = [];

    var array = uri.split('/');

    var realm = 'cotr';
    if (array.length > 2) realm = array[2];
    var address = 'vote1';
    if (array.length > 3) address = array[3];

    var qr = qrcode(4,'L');
    qr.addData(address + ';vote');
    qr.make();
    document.getElementById('qrcode').innerHTML = qr.createImgTag(8,20);

    var color = Chart.helpers.color;

    window.chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };

    var barChartData = {
        labels: [],
        datasets: [{
            label: 'Votes',
            backgroundColor: [

            ],
            borderColor: [

            ],
            borderWidth: 1,
            data: [

            ]
        }]
    };

    var colors = [window.chartColors.blue,window.chartColors.red,window.chartColors.green];

    var dataStream = $websocket('wss://coinoftherealm.com:8585/' + realm + '/' + address);

    var array = [];

    dataStream.onMessage(function(message) {
        var json = JSON.parse(message.data);
        var index = 0;
        array.forEach(function(name) {
            if (json.properties.votes) {
                barChartData.datasets[0].data[index] = json.properties.votes[name];
            }
            index++;
        });
        window.myBar.update();
    });

    $http({
        method: 'GET',
        url: 'https://coinoftherealm.com:8484/' + realm + '/' + address,
        headers: {
            'Accept': 'application/json'
        }
    }).then(function successCallback(response) {

        var json = response.data;
        if (json.properties.choices) {
            array = json.properties.choices;
            var index = 0;
            array.forEach(function(name) {
                barChartData.labels.push(name);
                barChartData.datasets[0].data.push(0);
                barChartData.datasets[0].backgroundColor.push(color(colors[index]).alpha(0.5).rgbString())
                barChartData.datasets[0].borderColor.push(colors[index]);
                index++;
            });
            index = 0;
            array.forEach(function(name) {
                if (json.properties.votes) {
                    barChartData.datasets[0].data[index] = json.properties.votes[name];
                }
                index++;
            });
            if (response.data.properties.title) {
                $scope.title = response.data.properties.title;
            } else {
                $scope.title = 'Vote Demo';
            }
            
            setupChart(barChartData);
        }
    }, function errorCallback(response) {

    });

    $scope.addChoice = function() {
        $scope.choices.push('');
    }

    $scope.create = function() {
        var address = createVote($scope.newtitle,$scope.choices);
        $scope.address = '0x' + address.toUpperCase();
    }
});

function setupChart(barChartData) {
    var ctx = document.getElementById('canvas').getContext('2d');
    window.myBar = new Chart(ctx, {
        type: 'bar',
        data: barChartData,
        options: {
            responsive: true,
            legend: {
                display: false,
                position: 'top'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        stepSize: 1
                    }
                }]
            }
            
        }
    });
}

