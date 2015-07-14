#node-api
This is the folder with all the code for the API back-end.

##Setup
To setup for running the code, run `npm install` inside this directory. That should install all needed dependencies as listed in `package.json`.

Then to start the API server, run `node server.js` in this directory.

The default port for accessing the server is `8080`, so the base url is `http://YOUR_RPI_IP:8080/node-api`, of course replacing `YOUR_RPI_IP` with the IP address of your raspberry pi!

The LED control API would be at: `http://YOUR_RPI_IP:8080/node-api/leds`

For more documentation look in `../raml-doc` folder.

