class Player {

	constructor(data) {

		// params
		data.char  = data.char  || 'X';
		data.moves = data.moves || [];
		this.data  = data;
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


		let clone = (instance) => {

			let data = Object.assign({}, instance.data);

			Object.keys(data).forEach((key) => {
				let val = data[key];

				if(typeof val === 'object'){
					if(val.constructor === Object)
						data[key] = JSON.parse(JSON.stringify(val));

					else if(val.constructor === Array)
						data[key] = JSON.parse(JSON.stringify(val));

					else
						data[key] = clone(val);
				}
			});

			data = Object.assign({}, data);
			return new instance.constructor(data);
		}


		let movesToWin = (player, move, i = 0) => {

			// clone
			player = clone(player);
			let game = player.data.game;

			// lookup past moves
			if(storage[game.data.grid.join(',')])
				return storage[game.data.grid.join(',')];

			player.play(...move);
			let avalable = player.avalableMoves();

			// prevent extra testing
			if(i > game.data.toWin)
				return Infinity;

			if([1,3].includes(move[0]) && [1,3].includes(move[1]))
				i = i - 0.1;


			if(!game.winner() && avalable.length > 0){
				let bestMove = avalable.map((move) => {
					return movesToWin(player, move, i+1);
				}).sort();

				// prefer moves that setup
				// two win posible wins

				if(bestMove[0] <= i+1 && bestMove[1] <= i+1)
					bestMove = bestMove[0]-0.2;

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


		let shuffle = (a) => {
		    for (let i = a.length - 1; i > 0; i--) {
		        const j = Math.floor(Math.random() * (i + 1));
		        [a[i], a[j]] = [a[j], a[i]];
		    }
		    return a;
		}


		let avalable = shuffle(this.avalableMoves()),
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
				return movesToWin(this, move);
			});
			winIn = Math.min(...rate);

			// FIGHT OPONENT
			if(op) op = clone(op).strategy();
			
			if(op && op.winIn < 0.9 && winIn > 0){
				winIn++;
				move = op.move;
			}

			else
				move = avalable[rate.indexOf(winIn)];
		}



		return {
			winIn: winIn,
			move: move
		};
	}
};



if(typeof module !== 'undefined') module.exports = Player;
else window.Player = Player;