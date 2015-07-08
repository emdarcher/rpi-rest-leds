//led-ctrl.js
//led control routes and api goes in here
//

// to use for executing programs on the machine
var exec = require('child_process').exec;

var gpio_cmd = "gpio -g ";

var led_array = [
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

exports.init_led_ctrl = function() {
    init_led_gpio(led_array);
    update_all_led_gpio(led_array);
};


//finds an LED using it's led_id
exports.findById = function(req, res) {
    var _id = req.params.led_id;
    console.log('Looking for led with id: ' + _id);
    var found = false;
    for( var i=0;i<led_array.length;i++){
        if(led_array[i].id == _id){
            console.log('Found led with id: ' + _id);
            res.json(led_array[i]);
            found = true;
        }
    }
    if(!found){
       console.log('LED with id: ' + _id + ' not found!'); 
        res.json(404); //404 not found
    }
};

//gets the info on all the LEDs
exports.findAll = function(req, res) {
    console.log('Sending data on all LEDs ');
    res.json(led_array);
};

//used to update the details of an LED
//and change it's state (ON, or OFF)
exports.updateLed = function(req, res) {
    var _id = req.params.led_id;
    console.log('Updating LED with id: ' + _id);
    var found = false;
    var index = 0;
    for( var i=0;i<led_array.length;i++){
        if(led_array[i].id == _id){
            console.log('Found led with id: ' + _id);
            found = true;
            index = i;
        }
    }
    if(!found){
       console.log('LED with id: ' + _id + ' not found!'); 
        res.json(404); //404 not found
    } else {
        var state = req.body.state;
        if( (state == "0") || (state == "1") ){
            led_array[i].state = state;
            update_led_gpio( led_array[i] );
        } else {
            console.log(state + ' is not a valid state!');
            res.json(400); //400 bad request
        }
    }
    
};

function runCmd(cmd) {
    exec(cmd, function (error, stdout, stderr) {
        console.log('executing: ' + cmd);
        console.log('stdout: ' + stdout);
        if(stderr.length > 0) console.log('stderr: ' + stderr);
        if(error !== null) console.log('exec error: ' + error);
    });
}

function init_led_gpio( all_led_data ) {
    for(var i=0;i<all_led_data.length;i++){
        var gpio_num = all_led_data[i].BCM_gpio;
        var cmd_str = gpio_cmd + ' mode ' + gpio_num + 'output';
        runCmd( cmd_str );
    }
}

function update_led_gpio( led_data ){
    var new_state = led_data.state;
    var gpio_num = led_data.BCM_gpio;
    var cmd_str = gpio_cmd + ' write ' + gpio_num + ' ' + new_state;
    runCmd( cmd_str );
}

function update_all_led_gpio( all_led_data ){
    for(var i=0;i<all_led_data.length;i++){
        update_led_gpio( all_led_data[i] );
    }
}
