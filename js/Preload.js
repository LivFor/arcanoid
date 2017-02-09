BasicGame.Preload = function(game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;
}

BasicGame.Preload.prototype = {

	preload: function() {
		this.background = this.add.sprite(0, 0, 'preloaderBackground');
		this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.height - 100, 'preloadBar');
		this.preloadBar.anchor.setTo(0.5, 0.5);

		this.load.setPreloadSprite(this.preloadBar);

		this.load.atlas('textures', 'assets/txtrAtlas/texture1.png', 'assets/txtrAtlas/texture1.json');
	},

	create: function() {
		this.preloadBar.cropEnabled = false;

		this.game.state.start('GameLogic');
	}

};