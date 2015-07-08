//server.js all the server stuff here
//
//

var express = require('express');
var app     = express();
var bodyParser  = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var led = require('./routes/led-ctrl');

var router = express.Router(); // get instance of express router

// base middleware
router.use(function(req, res, next) {
    //log something to show that something is happening
    console.log('Something is happening');
    next(); //make sure we go to next routes & don't stop here
});

// test route
router.get('/', function(req, res) {
    res.json({ message: 'welcome to the node-api for led control!'});
});

// routes that are directed to functions in /routes/led-ctrl.js
//
router.route('/leds').get( led.findAll );
router.route('/leds/:led_id')
    .get( led.findById )
    .put( led.updateLed );




app.use('/node-api', router);

// start the server
//
app.listen(port);
console.log('Listening on port: ' + port);



