class Player {

	constructor(data) {

		// params
		data.char = data.char || 'X';
		data.moves = [];
		this.data = data;
	}

	play(top, left) {
		let data = this.data;
		data.moves.push([top, left]);
		data.game.play(data.char, parseInt(top), parseInt(left));
		return this;
	}

	moves() {
		return this.data.moves;
	}

	avalableMoves() {
		let game = this.data.game;
		return game.avalableMoves();
	}

	strategy(op) {

		let shortest = Infinity,
			game = this.data.game,
			storage = {};

		let movesToWin = (player, move, i) => {
			player = _.cloneDeep(player);
			let game = player.data.game;

			// lookup past moves
			if(storage[game.data.grid.join(',')])
				return storage[game.data.grid.join(',')];

			player.play(...move);
			let avalable = player.avalableMoves();

			// prevent extra testing
			if(i >= game.data.toWin || i >= shortest)
				return Infinity;

			else if(!game.winner() && avalable.length > 0){
				let bestMove = avalable.map((move) => {
					return movesToWin(player, move, i+1);
				}).sort()[0];
				storage[game.data.grid.join(',')] = bestMove;
				return bestMove;
			}

			if(i<shortest) shortest = i;
			storage[game.data.grid.join(',')] = i;
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
			let start = Date.now();
			let rate = avalable.map((move) => {
				return movesToWin(this, move, 0);
			});
			let end = Date.now();
			console.log(end-start);
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