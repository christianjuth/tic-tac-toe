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
			if(i >= game.data.toWin || i > shortest)
				return Infinity;

			if(!game.winner() && avalable.length > 0){
				let bestMove = avalable.map((move) => {
					return movesToWin(player, move, i+1);
				}).sort();

				// prefer moves that setup
				// two win posible wins
				if(bestMove.slice(0,2).join(',') === '1,1')
					bestMove = bestMove[0]-0.5;

				// else return as normal
				else
					bestMove = bestMove[0];

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
		let mid = [Math.round(game.data.size/2)][0],
			midFree = avalable.map(move => move.join('-')).includes(`${mid}-${mid}`);
		if(avalable.length+1 >= game.data.size**2 && midFree){
			winIn = Infinity;
			move = [mid,mid];
		}



		else{
			// WIN
			let rate = avalable.map((move) => {
				return movesToWin(this, move, 0);
			});
			winIn = Math.min(...rate);

			// FIGHT OPONENT
			if(op) op = op.strategy();
			
			if(op && op.winIn <= 1 && winIn > 0){
				winIn++;
				move = op.move;
			}

			else{
				move = avalable[rate.indexOf(winIn)];
				console.log(move);
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