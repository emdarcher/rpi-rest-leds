# rpi-rest-leds API documentation version v01
http://localhost:8080/node-api
---

## /leds

#### get: Get the data for all LEDs


###### Response(s)

200

type:application/json
``` 

``` 




###/{led_id}

#### get: Get data for LED with `id = {led_id}`
###### Response(s)

200

type: application/json

``` 
{
"type": "object",
"$schema": "http://json-schema.org/draft-04/schema#",
"title":"led_data",
"description": "An LEDs data",
"properties": {
    "id": {
        "description": "id number for the led, same as led_id",
        "type":"string"
    },
    "BCM_gpio": {
        "description": "the Broadcom GPIO pin nunber for the LED",
        "type":"string"
    },
    "state": {
        "description": " '0' for OFF, '1' for ON",
        "type":"string"
    },
    "color": {
        "description": "The LED's color",
        "type":"string"
    },
    "blinking": {
        "description": "If the LED is set to blink",
        "type":"boolean"
    },
    "blink_rate": {
        "description": "The delay in milleseconds between toggling the LED",
        "type":"integer"
    },
    "required": [
        "id","BCM_gpio","state","blinking","blink_rate"
    ]
}
}

```


404

type: application/json

``` 

```



#### put: Change parameters of an LED with `id = {led_id}`
###### Response(s)

200

type: application/json

``` 

```


400

type: application/json

``` 

```





