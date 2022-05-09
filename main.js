// ----- Start of my code(Junil An) ----- //

class ParticleSystem extends PIXI.Container {
	constructor() {
		super();
		// Set start and duration for this effect in milliseconds
		this.start    = 0;
		this.duration = 1000;

		// Set number of coin
		this.coinNum = 36;
		for(let i=0;i<this.coinNum;i++){
			// Create a sprite
			let sp        = game.sprite("CoinsGold000");
			// Set pivot to center of said sprite
			sp.pivot.x    = sp.width/2;
			sp.pivot.y    = sp.height/2;
			// set end points to move
			sp.maxX = Math.random()*600+100;
			sp.maxY = Math.random()*400+50;
			//set each random max size 
			sp.maxSize = Math.random()*0.3+0.1;
			
			// Add the sprite particle to our particle effect
			this.addChild(sp);
		}
	}
	animTick(nt,lt,gt) {
		// Every update we get three different time variables: nt, lt and gt.
		//   nt: Normalized time in procentage (0.0 to 1.0) and is calculated by
		//       just dividing local time with duration of this effect.
		//   lt: Local time in milliseconds, from 0 to this.duration.
		//   gt: Global time in milliseconds,

		for(let i=0;i<this.children.length;i++){
			// Set a new texture on a sprite particle
			let num = ("000"+Math.floor(nt*8)).substr(-3);
			game.setTexture(this.children[i],"CoinsGold"+num);
			// Animate position
			this.children[i].x = 400 + nt*(this.children[i].maxX*Math.cos(2*(i+1)/this.children.length*Math.PI));
			this.children[i].y = 225 + nt*(this.children[i].maxY*Math.sin(2*(i+1)/this.children.length*Math.PI));
			// Animate scale
			this.children[i].scale.x = this.children[i].scale.y = nt;
			if(this.children[i].scale.x>=this.children[i].maxSize) this.children[i].scale.x = this.children[i].scale.y = this.children[i].maxSize;
			// Animate alpha
			this.children[i].alpha = nt;
			// Animate rotation
			this.children[i].rotation = ((2*(i+1)/this.children.length)+0.5)*Math.PI;
		}
	}
}
// ----- End of the my code(Junil An) ----- //

class Game {
	constructor(props) {
		this.totalDuration = 0;
		this.effects = [];
		this.renderer = new PIXI.WebGLRenderer(800,450);
		document.body.appendChild(this.renderer.view);
		this.stage = new PIXI.Container();
		this.loadAssets(props&&props.onload);
	}
	loadAssets(cb) {
		let textureNames = [];
		// Load coin assets
		for (let i=0; i<=8; i++) {
			let num  = ("000"+i).substr(-3);
			let name = "CoinsGold"+num;
			let url  = "gfx/CoinsGold/"+num+".png";
			textureNames.push(name);
			PIXI.loader.add(name,url);
		}
		PIXI.loader.load(function(loader,res){
			// Access assets by name, not url
			let keys = Object.keys(res);
			for (let i=0; i<keys.length; i++) {
				var texture = res[keys[i]].texture;
				if ( ! texture) continue;
				PIXI.utils.TextureCache[keys[i]] = texture;
			}
			// Assets are loaded and ready!
			this.start();
			cb && cb();
		}.bind(this));
	}
	start() {	
		this.isRunning = true;
		this.t0 = Date.now();
		update.bind(this)();
		function update(){
			if ( ! this.isRunning) return;
			this.tick();
			this.render();
			requestAnimationFrame(update.bind(this));
		}
	}
	addEffect(eff) {
		this.totalDuration = Math.max(this.totalDuration,(eff.duration+eff.start)||0);
		this.effects.push(eff);
		this.stage.addChild(eff);
	}
	render() {
		this.renderer.render(this.stage);
	}
	tick() {
		let gt = Date.now();
		let lt = (gt-this.t0) % this.totalDuration;
		for (let i=0; i<this.effects.length; i++) {
			let eff = this.effects[i];
			if (lt>eff.start+eff.duration || lt<eff.start) continue;
			let elt = lt - eff.start;
			let ent = elt / eff.duration;
			eff.animTick(ent,elt,gt);
		}
	}
	sprite(name) {
		return new PIXI.Sprite(PIXI.utils.TextureCache[name]);
	}
	setTexture(sp,name) {
		sp.texture = PIXI.utils.TextureCache[name];
		if ( ! sp.texture) console.warn("Texture '"+name+"' don't exist!")
	}
}

window.onload = function(){
	window.game = new Game({onload:function(){
		game.addEffect(new ParticleSystem());
	}});
}
