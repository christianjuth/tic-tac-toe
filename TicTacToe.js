require('colors');
let _ = require('lodash');


class Player {

	constructor(data) {

		// params
		data.char = data.char || 'X';
		this.data = data;
	}

	play(top, left) {
		let data = this.data;
		data.game.play(data.char, top, left);
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
			let rate = avalable.map((move) => {
				return movesToWin(this, move, 0);
			});
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


class TicTacToe {

	constructor(data = {}) {

		// params
		data.size  = data.size  || 3;
		data.toWin = data.toWin || 3;

		// state
		data.grid = Array(data.size).fill().map(() => {
						return Array(data.size).fill(' ').slice(0);
					});

		this.data = data;
		return this;
	}

	newPlayer(char) {
		return new Player({
			game: this,
			char: char
		});
	}

	toString() {
		let data = this.data;

		return data.grid.map((arr, i) => {
			arr = arr.join('|');
			return i+1 < data.size ? arr.underline : arr;
		}).join('\n');
	}


	play(char, top, left) {
		let grid = this.data.grid;

		if(!this.winner() && grid[top-1][left-1] === ' ')
			grid[top-1][left-1] = char;

		return this.winner();
	}


	winner() {
		let data = this.data,
			output = false,
			grid = data.grid.slice(0);

		let rotate45 = (arr) => {
			let clone = arr.slice(0),
				out = [];
			for(let i = 0; i < clone.length*2-1; i++){
				out.push(clone.map((char, y) => {
					return clone[i-y] ? clone[i-y][y] : null;
				}).filter((el) => typeof el == 'string'));
			}
			return out;
		};

		let rotate90 = (arr) => {
			let clone = arr.slice(0);
			return clone.map((row, x) => {
				return clone.map((char, y) => {
					return clone[y][x];
				});
			}).reverse();
		};

		let clone = grid.slice(0);
		clone.push(...rotate45(grid));
		clone.push(...rotate90(grid));
		clone.push(...rotate45(rotate90(grid)));

		clone.forEach((row) => {
			// test repeated character
			let regex = new RegExp(`(\\w)\\1{${data.toWin-1}}`),
				match = row.join('').match(regex);

			if(match) {
				output = match[1];
			}
		});

		return output;
	}

	avalableMoves() {
		let grid = this.data.grid,
			moves = [];

		grid.forEach((row, x) => {
			row.forEach((char, y) => {
				if(char === ' ')
					moves.push([x+1,y+1]);
			});
		});

		return moves;
	}
};










let game = new TicTacToe({
	size: 3,
	toWin: 3
});
let playerOne = game.newPlayer('X');
let playerTwo = game.newPlayer('O');


let i = 0;
while(!game.winner() && game.avalableMoves().length > 0){

	if(i % 2)
		playerTwo.play(...playerTwo.strategy(playerOne).move);

	else
		playerOne.play(...playerOne.strategy(playerTwo).move);
		
	console.log(game.toString()+'\n');
	i++;
}

console.log(`${game.winner()||'nobody'} won after ${i} moves`);