//led-ctrl.js
//led control routes and api goes in here
//

// to use for executing programs on the machine
var exec = require('child_process').exec;

var gpio_cmd = "gpio -g ";

var led-array = [
    {
        id: "0",
        BCM_gpio: "9",
        state: "0",
        color: "red"
    },
    {
        id: "1",
        BCM_gpio: "10",
        state: "0",
        color: "yellow"
    },
    {
        id: "2",
        BCM_gpio: "11",
        state: "0",
        color: "green"
    }
];



//finds an LED using it's led_id
exports.findById = function(req, res) {
    var _id = req.params.led_id;
    console.log('Looking for led with id: ' + _id);
    var found = false;
    for( var i=0;i<led-array.length;i++){
        if(led-array[i].id == _id){
            console.log('Found led with id: ' + _id);
            res.json(led-array[i]);
            found = true;
        }
    }
    if(!found){
       console.log('LED with id: ' + _id + ' not found!'); 
        res.json(404);
    }
};

//gets the info on all the LEDs
exports.findAll = function(req, res) {
    console.log('Sending data on all LEDs ');
    res.json(led-array);
};

//used to update the details of an LED
//and change it's state (ON, or OFF)
exports.updateLed = function(req, res) {
    
};

function runCmd(cmd) {
    exec(cmd, function (error, stdout, stderr) {
        console.log('executing: ' + cmd);
        console.log('stdout: ' + stdout);
        if(stderr.length > 0) console.log('stderr: ' + stderr);
        if(error !== null) console.log('exec error: ' + error);
    });
}


function setup_led_gpio() {
    for(var i=0;i<led-array.length;i++){
        var gpio_num = led-array[i].BCM_gpio;
        var cmd_str = gpio_cmd + ' mode ' + gpio_num + 'output';
        runCmd( cmd_str );
    }
}
