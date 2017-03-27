BasicGame.Congratulations = function(){};

BasicGame.Congratulations.prototype = {
	create: function() {
		this.congratsText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'YOU WIN!!!', {font: "45px Arial", fill:"00AF64", align: "center"});
		this.congratsText.anchor.setTo(0.5, 0.5);
		console.log('Done');
	},


	update: function(){}
}