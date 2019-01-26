
let cloneInstance = (instance) => {

	let data = Object.assign({}, instance.data);

	Object.keys(data).forEach((key) => {
		let val = data[key];

		if(typeof val === 'object'){
			if(val.constructor === Object)
				data[key] = JSON.parse(JSON.stringify(val));

			else if(val.constructor === Array)
				data[key] = JSON.parse(JSON.stringify(val));

			else
				data[key] = cloneInstance(val);
		}
	});

	data = Object.assign({}, data);
	return new instance.constructor(data);
}

Array.prototype.shuffle = function() {
	let a = this.slice(0);
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}





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


		let movesToWin = (player, move, i = 0) => {

			// clone
			player = cloneInstance(player);
			let game = player.data.game;

			// lookup past moves
			if(storage[game.data.grid.join(',')])
				return storage[game.data.grid.join(',')];

			player.play(...move);
			let avalable = player.avalableMoves();

			// prevent extra testing
			if(i > game.data.toWin)
				return Infinity;

			if(i == 0 && [1,3].includes(move[0]) && [1,3].includes(move[1]))
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
				else bestMove = bestMove[0];

				storage[game.data.grid.join(',')] = bestMove;
				return bestMove;
			}

			if(i<shortest) shortest = i;
			storage[game.data.grid.join(',')] = i;
			return i;
		};


		let avalable = this.avalableMoves().shuffle(),
			winIn, move;


		// CONTROL CENTER
		let mid = [Math.round(game.data.size/2)][0],
			midFree = avalable.map(move => move.join('-')).includes(`${mid}-${mid}`);
		if(avalable.length+1 >= game.data.size**2){
			winIn = Infinity;
			if(midFree) move = [mid,mid];

			// grap corner
			else move = [[1,3].shuffle()[0],[1,3].shuffle()[0]];
		}



		else{
			// WIN
			let rate = avalable.map((move) => {
				return movesToWin(this, move);
			});
			winIn = Math.min(...rate);
			let opWinIn;

			// FIGHT OPONENT
			if(op) opWinIn = op.strategy().winIn;
			
			// if opnent is one more
			// away from winning, block!
			if(op && opWinIn < winIn && opWinIn < 0.7){
				move = op.strategy().move;
				if(move.join(',') != avalable[rate.indexOf(winIn)].join(','))
					winIn++;
			}

			// else find which move messes
			// up oponent the most
			else if(op && opWinIn < winIn){
				let disrupt = [];

				avalable.forEach((move) => {
					let opClone = cloneInstance(op);
					let game = opClone.data.game;
					let self = cloneInstance(this);
					self.data.game = game;
					self.play(...move);
					disrupt.push(opClone.strategy(self).winIn);
				});


				// check if one more distrupts
				// oponent more then rest
				let sort = disrupt.slice(0).sort();
				if(sort[0] != sort.pop())
					move = avalable[disrupt.indexOf(Math.max(...disrupt))];

				// if disrupt moves doesnt matter
				// default back to best move for player
				else move = avalable[rate.indexOf(winIn)];

				// aproximate new winIn;
				winIn++;
			}

			// return best move for player
			else move = avalable[rate.indexOf(winIn)];
		}

		return {
			winIn: winIn,
			move: move
		};
	}
};



if(typeof module !== 'undefined') module.exports = Player;
else window.Player = Player;