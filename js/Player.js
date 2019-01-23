class Player {

	constructor(data) {

		// params
		data.char = data.char || 'X';
		this.data = data;
	}

	play(top, left) {
		let data = this.data;
		data.game.play(data.char, parseInt(top), parseInt(left));
		return this;
	}

	avalableMoves() {
		let game = this.data.game;
		return game.avalableMoves();
	}

	strategy(op) {

		let shortest = Infinity,
			game = this.data.game;

		let movesToWin = (player, move, i) => {
			player = _.cloneDeep(player);
			let game = player.data.game;

			player.play(...move);
			let avalable = player.avalableMoves();

			// prevent extra testing
			if(i >= game.data.toWin || i >= shortest)
				return Infinity;

			else if(!game.winner() && avalable.length > 0){
				return avalable.map((move) => {
					return movesToWin(player, move, i+1);
				}).sort()[0];
			}

			if(i<shortest) shortest = i;
			return i;
		};

		let avalable = _.shuffle(this.avalableMoves()),
			winIn, move;


		// CONTROL CENTER
		if(avalable.length >= game.data.size**2){
			winIn = Infinity;
			let mid = [Math.round(game.data.size/2)];
			move = [mid,mid];
		}


		else{
			// WIN
			var t0 = Date.now();
			let rate = avalable.map((move) => {
				return movesToWin(this, move, 0);
			});
			var t1 = Date.now();
			console.log((t1-t0)/1000+'s');
			winIn = Math.min(...rate),
			move = avalable[rate.indexOf(winIn)];



			// FIGHT OPONENT
			if(op !== undefined){
				op = op.strategy();
				if(op.winIn == 0 && winIn > 0){
					winIn++;
					move = op.move;
				}
			}
		}



		return {
			winIn: winIn,
			move: move
		};
	}
};



if(typeof module !== 'undefined') module.exports = Player;
else window.Player = Player;