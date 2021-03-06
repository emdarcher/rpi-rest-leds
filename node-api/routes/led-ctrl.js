#!/usr/bin/env node
//led-ctrl.js
//led control routes and api goes in here

// to use for executing programs on the machine
var exec = require('child_process').exec;

// get the `step` module, to use for flow control
Step = require('step');
//Step = require('../lib/step');

// the shell command for altering the GPIO,
// this is the `gpio` command line utility
// from WiringPi, whith the `-g` parameter
// because we are using the BCM GPIO numbering scheme.
var gpio_cmd = "gpio -g ";


// array which stores the data and properties for the LEDs
// This is manipulated by the functions behind the API.
var led_array = [
    {
        id: "0",
        BCM_gpio: "9",
        state: "0",
        color: "red",
        blinking: false,
        blink_rate: 0
    },
    {
        id: "1",
        BCM_gpio: "10",
        state: "0",
        color: "yellow",
        blinking: false,
        blink_rate: 0
    },
    {
        id: "2",
        BCM_gpio: "11",
        state: "0",
        color: "green",
        blinking: false,
        blink_rate: 0
    }
];


var blinker_interval_array = [];

var update_led_is_verbose = true;

// flag to indicate whether the initialization is complete
var init_done = false;
// delay in milliseconds for the blinking interval function
var blink_delay = 500;

var min_blink_delay = 50;

// Interval function (repeats after a certain time interval)
// which toggles the states of any LEDs that have
// "blinking: true" in their data properties
//var led_blink_interval = setInterval( function() {
//    // checks that the initalization has finished before running
//    // because it could be troublesome otherwise.
//    if(init_done){
//        // loop through the LEDs' data
//        parallel( led_array , function( data, cb ) {
//            // if the LED has `blinking: true`
//            if(data.blinking){
//                // toggle the state between "0" and "1"
//                data.state = (data.state == "0") ? "1":"0";
//                update_led_is_verbose = false;
//                update_led_gpio( data, cb, update_led_is_verbose );
//                update_led_is_verbose = true;
//            }
//            return cb();
//        }, function (err) { if(err) throw err; } );
//    }
//}, blink_delay);

// function which performs initialization steps for the LEDs
exports.init_led_ctrl = function() {
    Step(
        function () {
            init_led_gpio(led_array, this);
        }, function (err) {
            if(err) throw err;
            update_all_led_gpio(led_array, this);
        }, function (err, callback) {
            if(err) throw err;
            init_done = true;
            console.log('done with initialization');
        }
    );
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
        //404 not found
        res.status(404).json({message: 'LED with id: ' + _id + ' not found!'});
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
        //404 not found
        res.status(404).json({message: 'LED with id: ' + _id + ' not found!'});
    } else {
        // get data from the body of the PUT request
        var state = req.body.state;
        var blinking = req.body.blinking;
        var blink_rate = req.body.blink_rate;

        if(state !== undefined){
            if( ((state == "0") || (state == "1")) ){
                // update the LED state and gpio only if it has changed
                // so we don't waste cycles writing the same value again
                if(led_array[index].state !== state){
                    //copy new state into the LED's data
                    led_array[index].state = state;
                    update_led_gpio( led_array[index], function (err) {
                        if(err){
                            res.send(500);//internal server error
                        } else { res.send(200); }
                    });
                }
                res.send(200); //200 OK, successful request
            } else {
                console.log(state + ' is not a valid state!');
                //400 bad request
                res.status(400).json(
                        {message: state + ' is an invalid value for state!'}); 
            }
        }
        if((blinking !== undefined) || (blink_rate !== undefined) ){
            var req_error = false;//flag for indicating an error in the request
            var req_error_msg = {};
            if(blinking !== undefined){
                if(typeof blinking == 'boolean'){
                    led_array[index].blinking = blinking;
                } else {
                    console.log('The ' + blinking 
                            + ' value of blinking is not a boolean!');
                    req_error_msg = {
                        message: 'The ' + blinking 
                            + ' value of blinking is not a boolean!'
                    };
                    req_error = true;//set the req_error flag
                    //res.send(400); //400 bad request
                }
            } else { blinking = led_array[index].blinking; }
            if(blink_rate !== undefined){
                led_array[index].blink_rate = blink_rate;
            } else { blink_rate = led_array[index].blink_rate; }
            
            //check if any of the above code has had an error in the request
            if(!req_error){
                if(blinking && (blink_rate > 0)){
                    var delay;
                    if(blink_rate >= min_blink_delay){
                        delay = blink_rate;
                    } else {
                        console.log( blink_rate 
                                + ' is below the minimum delay of '
                                + min_blink_delay 
                                + ', setting delay to the minimum delay.');
                        delay = min_blink_delay;
                    }
                    //clear the interval if it already exists
                    if(blinker_interval_array[index] !== null){
                        clearInterval(blinker_interval_array[index]);
                    }
                    //code to make intervalObject in the array
                    //this repeats after a certain interval, independently
                    //from other code, kind of like it's own little thread.
                    //This interval toggles an LED after a certain delay
                    //to make it blink.
                    blinker_interval_array[index] = setInterval( function() {
                        led_array[index].state =
                                (led_array[index].state == "0") ? "1":"0";
                        update_led_gpio(led_array[index] , function(err){
                            if(err){throw err;}
                        }, false); 
                    }, delay);
                    res.send(200);//OK
                } else {
                    if(!(blink_rate > 0)){
                        console.log('blink_rate is undefined or set to zero,'
                                + 'so not going to blink');
                    }
                    if(!blinking){
                        console.log('blinking is set to false or undefined, '
                                + 'so not going to blink');
                    }
                    //clear the interval if it already exists
                    if(blinker_interval_array[index] !== null){
                        clearInterval(blinker_interval_array[index]);
                    }
                    res.send(200);//OK
                }
            } else {
                res.status(400).json(req_error_msg); //400 bad request    
            }
        }
    }
};

// a little wrapper for exec which handles errors and printing output
function runCmd(cmd, cb) {
    //if there is 3rd argument, then it is the verbosity state
    var verbose = (arguments.length > 2) ? arguments[2] : true;
    exec(cmd, function (error, stdout, stderr) {
        if(error !== null){ 
            console.log('exec error: ' + error);
            return cb(error);
        }
        // if verbose==true, then we log the command and it's output
        if(verbose){
            console.log('executing: ' + cmd);
            if(stdout.length > 0) console.log('stdout: ' + stdout);
            if(stderr.length > 0) console.log('stderr: ' + stderr);
        }
        return cb();
    });
}


// a useful function for safely looping through data and 
// operating on it in "parallel" while catching errors
// and staying asynchronous.
function parallel (items, fn, done) {
    var count = 0;
    var errored;

    //one callback for each function result
    //make sure we don't create function in a loop
    function cb (err) {
        // keep track of how many functions have called back.
        count++;

        // If an error has already occured, ignore additional results. Calling
        // a callback multiple multiple times breaks the implied contract of
        // callbacks in node.
        if (errored) { return; }

        //if error occurs, callback and stop any future callbacks
        if (err) {
            errored = err;
            return;
        }
        
        // when count is equal to # of items passed in , call
        // the primary user callback with the possible error.
        if (count === items.length) {
            return done(errored);
        }
    }
    for ( var i = 0; i < items.length; i++) {
        fn(items[i], cb);
    }
}


function init_led_gpio( all_led_data , done ) {
    parallel(all_led_data, function ( data, cb ) {
        var gpio_num = data.BCM_gpio;
        var cmd_str = gpio_cmd + ' mode ' + gpio_num + ' output';
        runCmd( cmd_str , cb);
    }, done);
}

function update_led_gpio( led_data , cb ){
    var new_state = led_data.state;
    var gpio_num = led_data.BCM_gpio;
    var cmd_str = gpio_cmd + ' write ' + gpio_num + ' ' + new_state;
    runCmd( cmd_str , cb, ((arguments.length > 2) ? arguments[2] : true) );
}

function update_all_led_gpio( all_led_data, done ){
    parallel(all_led_data, update_led_gpio, done);
}


