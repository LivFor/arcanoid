BasicGame.GameLogic = function() {
	this.paddle;
	this.paddleSpeed = 400;
	this.countDown;
	this.balls;
	this.slots;
	this.best_cards = [];
	this.tempCards;
	this.ballsCount = 0;
	this.ballSpeed = 220;
	this.ballMaxVel = 300;
	this.ballInitialX;
	this.ballInitialY;
	this.ballvelText = null;
	this.deck = [];

	this.combinations;

	this.cards;

	this.lives = 3;
	this.score = 0;

	this.scoreText;
	this.livesText;
	this.mouseControl = true;

	this.toGetPowerUps = null;

};

BasicGame.GameLogic.prototype = {
	create: function() {
		this.game.stage.backgroundColor = '#807b7e';

		this.game.physics.startSystem(Phaser.Physics.ARCADE);

		this.game.physics.arcade.checkCollision.down = false;

		this.cards = this.game.add.group();
		this.cards.enableBody = true;
		
		this.powerups = this.game.add.group();
		this.tempCards = this.game.add.group();
		this.combinations = this.game.add.group();

		this.initPaddle();
		this.generateLevel();
		this.initDeck();
		this.createBall();
		this.initSlots();
		this.initCombinations();
		this.initHud();

		this.game.input.onDown.add(this.launchBall, this);


	},

	update: function() {
		this.ballUpdate();
		this.paddleUpdate();
		this.updateLevel();
		this.slotsUpdate();


		this.game.physics.arcade.collide(this.ball, this.paddle, this.ballHitPaddle, null, this);
		this.game.physics.arcade.collide(this.ball, this.cards, this.ballHitCard, null, this);

	},

	initDeck: function() {
		console.log('__initDeck');
		var brick,
			leftPadding = 26,
			topPadding = 50,
			spacing = 2,
			index = 0;
		for (x = 0; x < 13; x++) {
			for (y = 0; y < 4; y++) {
				newCard = this.game.add.sprite(x * (40 + spacing) + leftPadding, y * (59+spacing) + topPadding, 'deck', this.deck[index] + '.png');
				newCard.width = 40;
				newCard.height = 59;
				
				newCard.name = this.deck[index];
				

				this.game.physics.enable(newCard, Phaser.Physics.ARCADE);
				newCard.body.bounce.setTo(1,1);
					
				newCard.body.immovable = true;

				this.cards.add(newCard);

				index++;
			}
		}

	},

	generateLevel: function() {
		console.log('__generateLevel');
		var suits = ['h', 'c', 's', 'd'],
			values = [2,3,4,5,6,7,8,9,10,11,12,13,14];
		
		for (var i=values[0]; i<=14; i++){
			for (var j=0; j<suits.length; j++){
				this.deck.push(i+suits[j]);
			}
		}

		for (var k = this.deck.length-1; k > 0; k--) {
			var index = Math.floor(Math.random() * (k + 1));
			var card = this.deck[index];
			this.deck[index] = this.deck[k];
			this.deck[k] = card;
		}

	},

	initPaddle: function() {
		console.log('__initPaddle');
		this.paddle = this.game.add.sprite(this.game.world.centerX, this.game.world.height-50, 'objects', 'bat.png');
		this.paddle.width = 100;
		this.paddle.height = 15;
		this.paddle.anchor.setTo(0.5, 0.5);
		this.game.physics.enable(this.paddle, Phaser.Physics.ARCADE);
		this.paddle.body.collideWorldBounds = true;
		this.paddle.body.bounce.setTo(1,1);
		this.paddle.body.immovable = true;
	},

	createBall: function() {
		console.log('__createBall');
		this.ball = this.game.add.sprite(this.paddle.x, this.paddle.y - 17, 'objects', 'ball.png');
		this.ball.width = 17;
		this.ball.height = 17;
		this.game.physics.arcade.enable(this.ball);

		this.ball.anchor.setTo(0.5, 0.5);
		this.ball.body.bounce.setTo(1,1);
		this.ball.body.collideWorldBounds = true;
		this.ball.moving = false;
		this.ball.onPaddle = true;

	},

	initSlots: function() {
		console.log('__initSlots');
		this.slots = this.game.add.group();
		var initX = this.game.world.centerX - 137,
			initY = this.game.world.height - 150;

		for (var i = 0; i<7; i++){
			var tempSlot = this.game.add.sprite(initX +(i*45), initY, 'objects', 'slot.png');
			tempSlot.width = 42;
			tempSlot.height = 59;
			tempSlot.anchor.setTo(0.5, 0.5);
			tempSlot.empty = true;
			this.slots.add(tempSlot);
		}

	},

	initCombinations: function() {
		console.log('__initCombinations');
		var comb_names = ['high', 
					'pair', 
					'two_pairs', 
					'set', 
					'straight', 
					'flush', 
					'full_house', 
					'four', 
					'straight_flush', 
					'royal_flush'];

		comb_names.forEach(function(name){
		tempCombination = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'combinations', name + '.png');
		tempCombination.anchor.setTo(0.5,0.5);
		tempCombination.width =this.game.world.width - 50;
		tempCombination.visible = false;
		tempCombination.scale.setTo(0,0);
		tempCombination.alpha = 0.4;
		tempCombination.name = name;
		this.combinations.add(tempCombination);
		}, this);

	},

	showCombinationLabel: function(name) {
		console.log('__showCombinationLabel');
		this.combinations.forEach(function(comb) {
			if (comb.name == name) {
				comb.visible = true;
				var appearTween = this.game.add.tween(comb.scale).to({x: 1, y: 1}, 500, Phaser.Easing.Default, true);
				appearTween.onComplete.add(function() {
					comb.visible = false;
					comb.scale.setTo(0,0);
				}, this);
			}
		}, this);
	},

	launchBall: function() {
		console.log('__launchBall');
		if (!this.ball.moving){
			if (Math.random() > 0.5) {
				this.ball.body.velocity.x = -this.ballSpeed;
				this.ball.body.velocity.y = -this.ballSpeed;
			} else {
				this.ball.body.velocity.x = this.ballSpeed;
				this.ball.body.velocity.y = -this.ballSpeed;
		}
		this.ball.moving = true;
		this.ball.onPaddle = false;
		};

	},

	ballUpdate: function() {
		if (this.ball.onPaddle){
			this.ball.body.x = this.paddle.x;
			this.ball.body.bottom = this.paddle.body.top;
		} else

		if (this.ball.body.y > this.game.world.height) {
			if (this.lives > 0){
				this.lives -= 1;
				this.updateHud();
				this.createBall();
			} else {
				this.gameOver();
		}

		if (!this.ball.moving) {
			this.ball.x = this.paddle.x;
			this.ball.y = this.paddle.y - 17;
		}

		}
		if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
		this.launchBall();
		}	
	},

	paddleUpdate: function() {

		if (this.mouseControl) {

           this.paddle.body.x = this.game.input.worldX - this.paddle.body.halfWidth;

            if (this.paddle.body.x <= 0) {
                this.paddle.body.x = 0;
            }
            if (this.paddle.body.x >= this.game.world.width - this.paddle.width) {
                this.paddle.body.x = this.game.world.width - this.paddle.width;
            }
        }

		if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
			this.paddle.body.velocity.x = -this.paddleSpeed;
		} else if(this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
			this.paddle.body.velocity.x = this.paddleSpeed;
		} else {
			this.paddle.body.velocity.x = 0;
		}
	},

	ballHitCard: function(_ball, _card) {
		console.log('__ballHitCArd');
		_card.kill();

		//убить карту-блок, создать временную карту, твинуть её в свободный слот
		var tempCard = this.game.add.sprite(_card.body.x + _card.body.width/2, _card.body.y + _card.height/2, 'deck', _card.name + '.png');
		tempCard.anchor.setTo(0.5);
		tempCard.width = 42;
		tempCard.height = 59;
		tempCard.name = _card.name;
		this.tempCards.add(tempCard);

		for (var i = 0; i < this.slots.length; i++) {
			if (this.slots.getAt(i).empty) {
				var moveTween = this.game.add.tween(tempCard).to( {x: this.slots.getAt(i).x, y: this.slots.getAt(i).y}, 600, Phaser.Easing.Linear.None, true, 0);

				this.slots.getAt(i).empty = false;

				var exists = 0;
				this.slots.forEach(function(slot) {
					if (!slot.empty) {exists++};
				});

				if (exists == this.slots.length) {
					this.pause_play();		
				}
				break;
			}
		}
	},

	sortSlots: function() {
		console.log('__sortSlots');
		var cards = [],
			values = [],
			suits = [],
			hand = [];

		this.tempCards.forEachAlive(function(card){
			cards.push(card.name);
		});

		cards.forEach(function(card) {
			values.push(parseInt(card));
			suits.push(card[card.length-1]);
		});

		values = values.sort(this.inIncrease);
		suits = suits.sort(this.inIncrease);
		
		cards = cards.sort(this.inIncrease);
		this.best_cards = this.findCombination(cards, values, suits);
		this.updateHud();

		cards = [];
		suits = [];
		values = [];
		hand = [];
	},

	slotsUpdate: function() {

		if (this.ball.paused && this.tempCards.length%7==0){
			this.sortSlots();
			this.tempCards.forEachAlive(function(card){
				if (this.best_cards.includes(card.name)) {
				var scaleTween = this.game.add.tween(card.scale).to({x: 1.1, y: 1.1}, 1000, Phaser.Easing.Default, true);
				var alphaTween = this.game.add.tween(card).to({alpha: 0.15}, 1000, Phaser.Easing.Default, true);
				scaleTween.onComplete.add(function() {
					var moveTween = this.game.add.tween(card).to({x:1 , y: 1}, 300, Phaser.Easing.Default, true);
					moveTween.onComplete.add(function() {
						var minifyTween = this.game.add.tween(card.scale).to({x: 0.1, y: 0.1}, 200, Phaser.Easing.Default, true);
						minifyTween.onComplete.add(function() {
						card.kill();
						}, this);
					}, this);
				}, this);

			} else {
				var slideTween = this.game.add.tween(card).to({x: 800}, 600, Phaser.Easing.Default, true);
				slideTween.delay(3000);
				slideTween.onComplete.add(function() {
					card.kill();
				})
			}
			}, this)
			
			this.slots.forEach(function(slot){
				slot.empty = true;
			});
			
			this.pause_play();
		}
	},

	pause_play: function() {
		console.log('__pause_play');

		if (this.ball.body.velocity.x != 0 || this.ball.body.velocity.y != 0){
		this.ball.beforePauseX = this.ball.body.velocity.x;
		this.ball.beforePauseY = this.ball.body.velocity.y;


		this.ball.body.velocity.x = 0;
		this.ball.body.velocity.y = 0;

		this.ball.paused = true;

		} else if (this.ball.body.velocity.x == 0 && this.ball.body.velocity.y == 0) {
			this.ball.body.velocity.x = this.ball.beforePauseX;
			this.ball.body.velocity.y = this.ball.beforePauseY;

			this.ball.paused = false;
		}
	},

	ballHitPaddle: function() {	
		/* if (this.ball.body.center.x < this.paddle.body.left || this.ball.body.center.x > this.paddle.body.right) {
			var newVelocity = 
			console.log(newVelocity);
			this.ball.body.velocity.x = newVelocity.x;
			this.ball.body.velocity.y = newVelocity.y;
			}
		else {
			if ((this.ball.body.center.y < this.paddle.body.top) || (this.ball.body.center.y > this.paddle.body.bottom)) {
				this.ball.body.velocity.y *= -1;		
			}
		}
		*/
	this.findDestination();
	},

	powerUpOverlapsPaddle: function(_paddle, _powerup) {
		console.log('__powerUpOverlapsPaddle');
		this.score += 200;
		this.powerUpText = this.game.add.text(_powerup.body.x, _powerup.body.y, 'Yuppy!', {font: '10px Comic', fill: '#FFFFFF', align: 'center'});
		this.powerUpText.anchor.setTo(0.5);
		this.powerUpText.lifespan = 100;
		_powerup.kill()
	},

	initPowerup: function(x, y) {
		console.log('__initPowerUp');
		if (Math.floor(Math.random() * (this.cards.countLiving() + 1)) < this.toGetPowerUps){
			var pUp = this.game.add.sprite(x, y, 'objects', 'star.png');
			pUp.anchor.setTo(0.5, 0.5);
			this.game.physics.enable(pUp, Phaser.ARCADE);
			pUp.body.velocity.y = 50;
			this.powerups.add(pUp);
			this.toGetPowerUps -= 1;
		}
	},

	initHud: function() {
		console.log('__initHud');
		this.scoreText = this.game.add.text(20,20, 'SCORE: ' + this.score, {font: '20px Arial', fill: '#FBFE00', align:'left'});
		this.livesText = this.game.add.text(this.game.world.width - 20, 20, 'LIVES: ' + this.lives, {font: '20px Arial', fill: '#FBFE00', align: 'left'});
		this.livesText.anchor.setTo(1,0);
	},

	updateHud: function() {
		console.log('__updateHud');
		this.scoreText.text = 'SCORE: ' + this.score;
		this.livesText.text = 'LIVES: ' + this.lives;
	},

	gameOver() {
		console.log('__gameOver');
		this.ball.kill();
		this.gameOverText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'GAME OVER', {font: '40px Arial', fill: 'red', align:'center'});
		this.gameOverText.anchor.setTo(0.5,0.5);
	},

	updateLevel() {
		if (this.cards.countLiving() == 0) {
			this.score += 100;
			this.paddle.body.x = this.game.world.centerX;
			this.ball.kill();
			this.createBall();
			this.cards.removeAll();
			this.tempCards.removeAll();
			this.slots.forEach(function(slot) {
				slot.empty = true;
			})

			this.generateLevel();
			this.initDeck();
			this.updateHud();
		}
	},

	render: function() {},

	findCombination: function(cards, values, suits) {
		console.log('__findCombination');
		console.log(cards);
		console.log(values);
		console.log(suits);

		var hand = this.isRoyalFlush(cards, suits);
		if (hand) {
			this.showCombinationLabel('royal_flush');
			this.score += parseInt(hand[0]) * 1000;
			return hand;
		}

		hand = this.isStraightFlush(cards, suits);
		if (hand) {
			this.showCombinationLabel('straight_flush');
			this.score += parseInt(hand[0]) * 500;
			return hand;
		}
		hand = this.isFourOfAKind(cards, values);
		if (hand) {
			this.showCombinationLabel('four');
			this.score += parseInt(hand[0]) * 250;
			return hand;
		}

		hand = this.isFullHouse(cards, values);
		if (hand) {
			this.showCombinationLabel('full_house');
			this.score += parseInt(hand[0]) * 100;
			return hand;
		}

		hand = this.isFlush(cards, suits);
		if (hand) {
			this.showCombinationLabel('flush');
			this.score += parseInt(hand[0]) * 50;
			return hand;
		}

		hand = this.isStraight(cards, values);
		if (hand) {
			this.showCombinationLabel('straight');
			this.score += parseInt(hand[0]) * 25;
			return hand;
		}

		hand = this.isThreeOfAKind(cards, values);
		if (hand) {
			this.showCombinationLabel('set');
			this.score += parseInt(hand[0]) * 10;
			return hand;
		}

		hand = this.isTwoPairs(cards, values);
		if (hand) {
			console.log('2pair' + hand);
			this.showCombinationLabel('two_pairs');
			this.score += parseInt(hand[0]) * 5;
			return hand;
		}

		hand = this.isPair(cards, values);
		if (hand) {
			console.log('pair');
			this.showCombinationLabel('pair');
			this.score += parseInt(hand[0]) * 2;
			return hand;
		}

		this.showCombinationLabel('high');
		hand = [cards[0]];
		this.score += parseInt(hand[0]);
		return [hand, 1];
	},

	isRoyalFlush: function(cards, suits) {
		console.log();
		var suit = false;
		suits.forEach(function(_suit){
			if (this.countBySuit(suits, _suit) >=5) {
				suit = _suit;
			}
		}, this);

		if (suit) {
			hand = cards.filter(function(card) {
				return card[card.length-1] == suit;
			});

			if ((parseInt(hand[0]) == 14) && (parseInt(hand[4]) == 10)) {
				return hand.slice(0,5);
			}
		}


		if (this.hasCard(cards, 14, suit) && this.hasCard(cards,13,suit) && this.hasCard(cards,12,suit) 
			&& this.hasCard(cards,11,suit) && this.hasCard(cards,10,suit)) {
			return [14+suit, 13+suit, 12+suit, 11+suit, 10+suit];
		}

		return false;
	},

	isStraightFlush: function(cards, suits) {
		var suit = false,
			hand = [];
		suits.forEach(function(_suit){
			if (this.countBySuit(suits, _suit) >=5) {
				suit = _suit;
			}
		}, this);

		if (suit) {
			hand = cards.filter(function(card) {
				return card[card.length-1] == suit;
			});

			for (var i = 0; i < hand.length - 4; i++) {

			new_hand = hand.slice(i,i+5).sort(this.inIncrease);

			if (parseInt(new_hand[0])-parseInt(new_hand[4]) == 4) return new_hand;
		}	
		}

		return false;
	},

	isFourOfAKind: function(cards, values) {
		var value = this.getFourOfAKind(values),
			hand = false;
		if (value) {
			hand = [];
			cards.forEach(function(card) {
				if (parseInt(card) == value) {
					hand.push(card);
				}
			}, this);

		}
		return hand;
	},

	isFullHouse: function(cards, values) {
		var three = this.getThreeOfAKind(values),
			pair = this.getPair(values, three),
			hand = false;

		if (three && pair) {
			hand = [];
			cards.forEach(function(card){
				if ((parseInt(card) == three) || (parseInt(card) == pair)) {
					hand.push(card);
				}	
			});
			hand = hand.slice(0,5); //на случай комбинаций вроде 5556667, когда в руке возвращает больше 5 карт
		}
		return hand;
	},

	isFlush: function(cards, suits) {
		var suit = false;
		suits.forEach(function(_suit){
			if (this.countBySuit(suits,_suit) >=5) {
				suit = _suit;
			}
		}, this);

		if (suit) {
			var hand = cards.filter(function(card) {
				return card[card.length-1] == suit;
			});
	
			hand = hand.sort(this.inIncrease);
			if (hand.length > 5) hand = hand.slice(0,5);
			return hand;
		}
		return false;
	},

	isStraight: function(cards, values) {
		var hand = false;

		values.forEach(function(value) {
			if (values.includes(14) && values.includes(2) && values.includes(3) &&
				values.includes(4) && values. includes(5)) {
				hand = [];
				var hand_values = [];
				var need_values = [2,3,4,5,14];
				cards.forEach(function(card){
					if (!hand_values.includes(parseInt(card)) && need_values.includes(parseInt(card))) {
						hand.push(card);
						hand_values.push(parseInt(card));
					}
				},this);
			}

			if (values.includes(value-1) && values.includes(value-2) && values.includes(value-3) && values.includes(value-4)) {
				hand = []; 
				var hand_values = []; //номиналы руки - сюда сложить величины карт, чтобы проверять на уникальные
				//пройтись по картам
				cards.forEach(function(card) {
					if (!hand_values.includes(parseInt(card)) && 
						((parseInt(card) == value) ||(parseInt(card) == value-1) || (parseInt(card) == value-2) || 
						(parseInt(card) == value-3) || (parseInt(card) == value-4))) 
					{
						hand.push(card);
						hand_values.push(parseInt(card));
					}

				}, this);

			}
		}, this);

		return hand;
	},

	isThreeOfAKind: function(cards, values) {

		var value = this.getThreeOfAKind(values),
		hand = false;

		if (value) {
			hand = [];
			cards.forEach(function(card) {
				if (parseInt(card) == value){
					hand.push(card);
				}
			});
		}

		return hand;
	},

	isTwoPairs: function(cards, values) {
		var pairs = this.getTwoPairs(values),
			hand = [];
		var firstPairValue = pairs[0],
			secondPairValue = pairs[1];

		cards.forEach(function(card) {
			if ((firstPairValue && secondPairValue) &&
				((parseInt(card) == firstPairValue) || (parseInt(card) == secondPairValue))) {
				hand.push(card);
			}
		});

		if (hand.length == 0) {
			return false;
		} else {
			return hand;
		}
	},

	isPair: function(cards, values) {

		var hand = false,
			value = this.getPair(values);

		if (value) {
			hand = [];
			cards.forEach(function(card){
				if (parseInt(card) == value) {
					hand.push(card);
				}
			});
		}
		return hand;
	},

	inIncrease: function(i1,i2){
		i1 = parseInt(i1);
		i2 = parseInt(i2);
		if (i1>i2) return -1;
		if (i1<i2) return 1;
		return 0;
	},


	hasCard: function(cards, v, s) {
		var needCard = v+s;
		cards.forEach(function(card) {
			if (card == needCard) {
				return true;
			}
		});
	},

	countBySuit: function(suits, s){
		counter = 0;
		suits.forEach(function(suit) {
			if (suit == s) {
				counter++;
			}
		});
		return counter;
	},

	getThreeOfAKind: function(values) {
		for(var i=0; i<values.length-2; i++){
			if ((values[i] == values[i+1]) && (values[i] == values[i+2])) {
				return values[i];
			}
		}
		return false;
	},

	getFourOfAKind: function(values) {
		for(var i=0; i<values.length-3; i++){
			if ((values[i] == values[i+1]) && (values[i] == values[i+2]) && (values[i]) == values[i+3]) {
				return values[i];
			}
		}
		return false;
	},

	getPair: function(values, valueOfThree=false) {
		if (valueOfThree) {
			for(var i=0; i<values.length-1;i++) {
				if (values[i] == valueOfThree) continue;
				if (values[i] == values[i+1]) return values[i];

			}
		} else for(var i=0; i<values.length-1;i++) {
			if (values[i] == values[i+1]) return values[i];
		}
		return false;
	},

	getTwoPairs: function(values) {

		var pairs = [];
		for(var i=0; i<values.length-1; i++){
			if (pairs.includes(values[i])) continue;

			if (values[i] == values[i+1]) {
				pairs.push(values[i]);
			}
		}
		 return pairs;
	},

	findDestination: function() {
		var corner = this.nearestCorner(),
			ballCenter = new Phaser.Point(this.ball.body.x, this.ball.body.y),
			nextBallPos = new Phaser.Point(this.ball.body.x + this.ball.body.velocity.x, this.ball.body.y + this.ball.body.velocity.y),

			nV = new Phaser.Point(corner.x - this.ball.body.x, corner.y - this.ball.body.y), //вектор нормали
		 	collisionPoint1 = new Phaser.Point(-nV.y, nV.x),									//вектор перпендикуляр
		 	collisionPoint2 = new Phaser.Point(corner.x + collisionPoint1.x, corner.y + collisionPoint1.y),
		 	dV = new Phaser.Point(this.ball.body.velocity.x, this.ball.body.velocity.y),						//вектор движения

		 	movingAngleToX = Phaser.Math.angleBetweenPoints(nextBallPos, ballCenter),
		 	collisionAngleToX = Phaser.Math.angleBetweenPoints(collisionPoint2, corner);

		 console.log(movingAngleToX);
		 console.log(collisionAngleToX);


		/* angleBetween = Math.acos((dV.x*pV.x + dV.y*pV.y)/
						(Math.sqrt(dV.x*dV.x + dV.y*dV.y) * Math.sqrt(pV.x*pV.x + pV.y*pV.y)));

		var rotatedV = {x: 0, y: 0};
		rotatedV.x = ((dV.x * Math.cos(angleBetween)) - (dV.y*Math.sin(angleBetween)));
		rotatedV.y = ((dV.x * Math.sin(angleBetween)) + (dV.y*Math.cos(angleBetween)));
		*/
	},

	nearestCorner: function() {
		var tl = new Phaser.Point(this.paddle.body.left, this.paddle.body.top),
			tr = new Phaser.Point(this.paddle.body.right, this.paddle.body.top),
			bl = new Phaser.Point(this.paddle.body.left, this.paddle.body.bottom),
			br = new Phaser.Point(this.paddle.body.right, this.paddle.body.bottom),
			ballCenter = new Phaser.Point(this.ball.body.x, this.ball.body.y),
			fromCornerToBallCenter = 1000,
			corner;
		
		console.log('center: ', ballCenter);
		[tl, tr, bl, br].forEach(function(c) {
			if (ballCenter.distance(c, true) < fromCornerToBallCenter) {
				corner = c;
			}
		}, this);

		return corner;
	},

}

	

