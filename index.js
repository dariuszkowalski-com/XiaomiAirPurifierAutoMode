const XiaomiAirPurifier = require('./lib/xiaomiairpurifierautomode.js');
const CHECKING_PERIOD_TIME = 60000 // 1 minute


const XIAOMI_AIR_PURIFIER_IP = ''; // PUT HERE AN IP OF YOUR AIR PURIFIER
const XIAOMI_AIR_PURIFIER_TOKEN = ''; // PUT HERE A TOKEN FROM YPUR AIRPURIFIER

var Scenes = require('./scenes/default.js');
var scene = Scenes.Default_Scene;

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log('uncaughtException',err.code);
    console.log('TRACE:',err);
   
})


let purifier = new XiaomiAirPurifier( XIAOMI_AIR_PURIFIER_IP , XIAOMI_AIR_PURIFIER_TOKEN ,CHECKING_PERIOD_TIME, scene);


purifier.on('after', (pm25,temp,humidity,state,timestamp ) => {
  console.log(pm25+ ';'+temp+';'+humidity+';'+state+';'+timestamp);
});

purifier.on('error',(err) => {
        console.error(err.code,err.message);
});


purifier.start();
 
