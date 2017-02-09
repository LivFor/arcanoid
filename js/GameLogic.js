BasicGame.GameLogic = function() {
	this.paddle;
	this.paddleSpeed = 200;
	this.countDown;
	this.balls;
	this.ballsCount = 0;
	this.ballSpeed = 200;
	this.ballMaxVel = 300;
	this.ballInitialX;
	this.ballInitialY;
	this.bricks;

	this.lives = 3;
	this.score = 0;

	this.scoreText;
	this.livesText;
	this.mouseControl = true;

};

BasicGame.GameLogic.prototype = {
	create: function() {
		this.game.stage.backgroundColor = '#000';

		this.game.physics.startSystem(Phaser.Physics.ARCADE);

		this.game.physics.arcade.checkCollision.down = false;

		this.bricks = this.game.add.group();
		this.bricks.enableBody = true;
		this.bricks.physicsBodyType = Phaser.Physics.ARCADE;

		this.initPaddle();
		this.initBricks();
		this.createBall();
		this.launchBall();
		initHud();

	},

	update: function() {
		this.ballUpdate();
		this.paddleUpdate();


		this.game.physics.arcade.collide(this.paddle, this.ball);
		this.game.physics.arcade.collide(this.bricks, this.ball, this.ballHitBrick, null, this);

	},

	initBricks: function() {
		var brick,
			leftPadding = 43;
			topPadding = 50;
			spacing = 5;
			b = 'b',
			p = 'p',
			y = 'y',
			g = 'g',
			r = 'r',
			x = null;

		var level = [[b, b, b, b, b, b, b, b],
					 [b, b, b, x, x, b, b, b],
					 [b, b, b, b, b, b, b, b],
					 [b, x, b, b, b, b, x, b],
					 [b, b, r, r, r, r, b, b],
					 [y, y, y, y, y, y, y, y],
					 [g, g, g, p, p, g, g, g]
					];

		for (y = 0; y < level[0].length; y++) {
			for (x = 0; x < level.length; x++) {
				var color = level[x][y];
				if (color){
					var bId = 1;
					var tempBrick;

					if (color == 'g') bId = 2;
					if (color == 'r') bId = 3;
					if (color == 'p') bId = 4;
					if (color == 'y') bId = 5;


					tempBrick = this.game.add.sprite(y * (60 + spacing) + leftPadding, x * (27+spacing) + topPadding, 'textures', 'brick_' + bId + '_0.png');
					/*tempBrick.animations.add('idle', ['brick_' + bId + '_0.png'], 10, false, false);
					//tempBrick.diedie = tempBrick.animations.add('brick_die', [
						'brick_' + bId + '_1.png',
						'brick_' + bId + '_2.png',
						'brick_' + bId + '_3.png',
						'brick_' + bId + '_4.png',
						], 10, false, false);
					tempBrick.animations.add('brick_popin', [
						'brick_' + bId + '_4.png',
						'brick_' + bId + '_3.png',
						'brick_' + bId + '_2.png',
						'brick_' + bId + '_1.png',
						], 10, false, false);*/

					var tempCount = 0;

					if (this.bricks.countLiving() > 0){
						tempCount = this.bricks.countLiving();
					}

					tempBrick.name = 'brick' + (tempCount +1);

					this.game.physics.enable(tempBrick, Phaser.Physics.ARCADE);
					tempBrick.body.bounce.setTo(1,1);
					tempBrick.body.immovable = true;

					//tempBrick.animations.play('brick_popin');

					this.bricks.add(tempBrick);
				}
			}
		}

	},

	initPaddle: function() {
		this.paddle = this.game.add.sprite(this.game.world.centerX, this.game.world.height-50, 'textures', 'bat.png');
		this.paddle.anchor.setTo(0.5, 0.5);
		this.game.physics.enable(this.paddle, Phaser.Physics.ARCADE);
		this.paddle.body.collideWorldBounds = true;
		this.paddle.body.bounce.setTo(1,1);
		this.paddle.body.immovable = true;
	},

	createBall: function() {
		this.ball = this.game.add.sprite(this.game.world.centerX, this.game.world.height-80, 'textures', 'ball.png');
		this.game.physics.arcade.enable(this.ball);
		this.ball.anchor.setTo(0.5, 0.5);
		this.ball.body.bounce.setTo(1,1);
		this.ball.body.setCircle(8);
		this.ball.body.collideWorldBounds = true;

	},

	launchBall: function() {
		if (Math.random() > 0.5) {
		this.ball.body.velocity.x = -this.ballSpeed;
		this.ball.body.velocity.y = -this.ballSpeed;
	} else {
		this.ball.body.velocity.x = this.ballSpeed;
		this.ball.body.velocity.y = -this.ballSpeed;
	};

	},

	ballUpdate: function() {
		if (this.ball.body.y > this.game.world.height) {
			this.ball.kill()
		};
	},

	paddleUpdate: function() {
		if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
			this.paddle.body.velocity.x = -this.paddleSpeed;
		} else if(this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
			this.paddle.body.velocity.x = this.paddleSpeed;
		} else {
			this.paddle.body.velocity.x = 0;
		}
	},

	ballHitBrick: function(_ball, _brick) {
		_brick.kill();
		this.score += 10;
	},

	initHud: function() {
		this.scoreText = this.game.add.text(30,30, 'lives: ' + this.lives, {font: '16px Terminal', fill: '#000000', align:'left'});
		this.livesText = this.game.add.text(this.game.world.width - 30, 30, 'score: ' + this.score, {font: '18px Terminal', fill: '#000000', align: 'left'});
		this.livesText.anchor.setTo(1,0);

	},

	render: function() {
		//this.game.debug.inputInfo(50,50);
		//this.game.debug.spriteInfo(this.paddle, 50,50);
		//this.game.debug.spriteInfo(this.ball, 50, 550);

	}

}