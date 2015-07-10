//led-ctrl.js
//led control routes and api goes in here
//

// to use for executing programs on the machine
var exec = require('child_process').exec;

Step = require('step');
//global.Step = require('../lib/step');

var gpio_cmd = "gpio -g ";

var led_array = [
    {
        id: "0",
        BCM_gpio: "9",
        state: "0",
        color: "red",
        blinking: false
    },
    {
        id: "1",
        BCM_gpio: "10",
        state: "0",
        color: "yellow",
        blinking: false
    },
    {
        id: "2",
        BCM_gpio: "11",
        state: "0",
        color: "green",
        blinking: false
    }
];

var update_led_is_verbose = true;
var init_done = false;
var blink_delay = 500;

var led_blink_interval = setInterval( function() {
    if(init_done){
    Step(
        function () {
            parallel( led_array , function( data, cb ) {
                if(data.blinking){
                    data.state = (data.state == "0") ? "1":"0";
                    //update_led_is_verbose = false;
                    //update_led_gpio( data, cb, update_led_is_verbose );
                    update_led_gpio( data, cb, true );
                    //update_led_is_verbose = true;
                }
                return cb();
            }, this);
        }, function (err) {
            if(err) throw err;
            console.log('Toggled leds for blink');
            //update_all_led_gpio(led_array, this);
        }    
    );
    }
}, blink_delay);

exports.init_led_ctrl = function() {
    Step(
        function () {
            init_led_gpio(led_array, this);
            //return this;
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
        var blinking = req.body.blinking;
        var state = req.body.state;
        
        if(state !== null){
            if( ((state == "0") || (state == "1")) ){
                led_array[index].state = state;
                update_led_gpio( led_array[index], function (err) {
                    if(err){
                        res.send(500);
                    } else { res.send(200); }
                });
                res.send(200); //200 OK, successful request
            } else {
                console.log(state + ' is not a valid state!');
                res.json(400); //400 bad request
            }
        }
        if(blinking !== null){
            led_array[index].blinking = blinking;
        }
    }
    
};

function runCmd(cmd, cb) {
    exec(cmd, function (error, stdout, stderr) {
        if(error !== null){ 
            console.log('exec error: ' + error);
            return cb(error);
        }
        var verbose = (arguments.length > 2) ? arguments[2] : true;
        //verbose = true;
        if(verbose){
            console.log('executing: ' + cmd);
            if(stdout.length > 0) console.log('stdout: ' + stdout);
            if(stderr.length > 0) console.log('stderr: ' + stderr);
        }
        return cb();
    });
}

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


