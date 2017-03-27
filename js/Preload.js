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

		this.load.atlas('objects', 'assets/txtrAtlas/objects.png', 'assets/txtrAtlas/objects.json');
		this.load.atlas('deck', 'assets/txtrAtlas/deck.png', 'assets/txtrAtlas/deck.json');
		this.load.atlas('combinations', 'assets/txtrAtlas/combinations.png', 'assets/txtrAtlas/combinations.json');
	},

	create: function() {
		this.preloadBar.cropEnabled = false;

		this.game.state.start('GameLogic');
	}

};