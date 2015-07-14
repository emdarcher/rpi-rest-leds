# rpi-rest-leds API documentation version v01
http://localhost:8080/node-api
---

## /leds

#### get: Get the data for all LEDs


###### Response(s)

200

type:application/json
__example:__
``` 
[
    {
      "id": "0",
      "BCM_gpio":"9",
      "state": "0",
      "color": "red",
      "blinking": false,
      "blink_rate": 0
    },
    {
      "id": "1",
      "BCM_gpio":"10",
      "state":"1",
      "color":"yellow",
      "blinking":true,
      "blink_rate": 500
    },
    {
      "id": "2",
      "BCM_gpio":"11",
      "state":"1",
      "color":"green",
      "blinking":false,
      "blink_rate": 200
    }
]
``` 




###/{led_id}

#### get: Get data for LED with `id = {led_id}`
###### Response(s)

200

type: application/json
__schema:__
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
__example:__
```
{
    "id": "1",
    "BCM_gpio":"10",
    "state":"1",
    "color":"yellow",
    "blinking":true,
    "blink_rate": 500
}
```

404

type: application/json
__example:__
``` 
{
  "message":"LED with id: {led_id} not found!"
} 
```



#### put: Change parameters of an LED with `id = {led_id}`
###### Body of data sent
__schema:__
```
    {
    "type": "object",
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title":"led_data_put",
    "description": "An LEDs data, schema for PUT",
    "properties": {
        "state": {
            "description": " '0' for OFF, '1' for ON",
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
        "required": []
    }

    }

```
__example:__
```
{
    "state":"1",
    "blinking":true,
    "blink_rate":600
}
```

###### Response(s)

200

type: application/json

``` 

```


400

type: application/json
__example:__
``` 
{
    "message": "invalid value for <item>"
}
```





