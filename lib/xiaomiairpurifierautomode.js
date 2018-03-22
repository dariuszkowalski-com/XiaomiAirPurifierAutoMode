const miio = require('miio');
const EventEmitter = require('events');

const PM25_WAIT_TIME = 1500;

module.exports = class XiaomiAirPurifier extends EventEmitter {

	constructor (ip, token, time, scenes) {
		super();

		this.ip = ip;
		this.token = token;
		this.checkPeriodTime = time;
		this.state = 0;
		this.mode = 'unknown';
		this.device = null;
		this.scenes = scenes; 


		// PRIVATE PARAMETES
		this._last_pm2_5 = null;
		this._last_temperature =  null;
		this._last_humidity = null;
		this._last_timestamp = null;
		

		
	}

	toString() {
		return '(' + this.ip + ', '+ this.token + ')';
	}

	get temperature () {
		return this._last_temperature;
	}

	get relativeHumidity() {
		return this._last_relativeHumidity;
	}

	get pm2_5() {
		return this._last_pm2_5;
	}



	_wait(ms){
		return new Promise((resolve) => setTimeout(resolve, ms));
	}	 

	async _getPM25() {
        	let minPM = await this.device.pm2_5();

        	if (minPM == null) {
                	await this.device.setFavoriteLevel( 0 );
			await this.device.setMode('favorite');
        	}      

        	for (let i=0; i<3 ; i++) {
                	await this._wait(PM25_WAIT_TIME);
			
			
                	let pm25 = await this.device.pm2_5();

			 console.log('PM2.5:', pm25);

                	if (minPM>pm25) minPM = pm25;

        	}

        	return minPM;

	}

	start(){
		this._checkAir();
	}


	async _checkAir(){

    		try {

			if (this.device == null ) {
				console.log('connection');
				this.device = await miio.device({ address: this.ip, token: this.token });
				console.log('connection done');
			}

			var pm25 = null;
			do {
	        	 	pm25 = await this._getPM25();
			} while (pm25 == null);


			await this.setState(pm25);



        		this._last_timestamp = new Date().getTime();
        		this._last_temperature = await this.device.temperature();
        		this._last_humidity = await this.device.relativeHumidity();
			this._last_pm2_5 = pm25; 
			
			this.emit('after', this._last_pm2_5, this._last_temperature.value, this._last_humidity, this.state,this._last_timestamp);


        	}catch (err){
                	console.error('ERR:' + err.code + ' ' + err);
			
			if (this.device != null) {
                                this.device.destroy();
                              	this._wait(1000);
				this.device = null;
                        }
        	} finally {
                	setTimeout(this._checkAir.bind(this),this.checkPeriodTime);
        	}	
	}

	async setState(newLevel) {

		if (this.state != 0){
			if (newLevel < this.scenes[this.state].hysteresis_level ) {
				this.state = 0;
			} else if (this.state != this.scenes.length - 1) {
				if (newLevel >= this.scenes[this.state + 1].level ) {
					this.state++;
				}		
			}
		}

		var scene = this.scenes[this.state];		


		for ( let i = this.state + 1 ; i <= this.scenes.length; i++  ) {
			
			var nextScene = null;

			if ( i != this.scenes.lenght ) {
				nextScene = this.scenes[i];
			}
							

			if (  nextScene ? newLevel > scene.level && newLevel <= nextScene.level: newLevel > scene.level ) {


                		if (scene.mode == 'idle') {
			  		await this.device.setPower(false);
				}else{
                                	await this.device.setMode(scene.mode);
                               		await this.device.setFavoriteLevel( scene.favoritelevel);
				}
                       		this.state = i - 1;
				break;
			}
			scene = nextScene ;
		}

	}	

}

