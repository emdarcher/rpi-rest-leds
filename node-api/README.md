# rpi-rest-leds
Controlling 3 LEDs using the Raspberry Pi's GPIO via a REST API

The default setup is for using 3 LEDs connected to GPIO #9,10,11, as used by the [Pi Traffic Light](http://lowvoltagelabs.com/products/pi-traffic/) board.

Go into the `node-api` folder to get to the code, and the `raml-doc` folder for RAML and Markdown documentation of the API.

#### requires: 
  - [WiringPi](http://wiringpi.com/)
  - [node.js](https://nodejs.org/)
  - and [npm](https://www.npmjs.com/), which is bundled with node.js


# node-api
This is the folder with all the code for the API back-end.

## Setup
To setup for running the code, run `npm install` inside this directory. That should install all needed dependencies as listed in `package.json`.

Then to start the API server, run `node server.js` in this directory.

Or you can install with [npm](www.npmjs.com) by running `npm install -g rpi-rest-leds`, then run the server with `rpi-rest-leds` in the command line.

The default port for accessing the server is `8080`, so the base url is `http://YOUR_RPI_IP:8080/node-api`, of course replacing `YOUR_RPI_IP` with the IP address of your raspberry pi!

The LED control API would be at: `http://YOUR_RPI_IP:8080/node-api/leds`

For more documentation look in `../raml-doc` folder.

