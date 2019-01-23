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
			return i+1 < data.size ? arr : arr;
		}).join('\n');
	}

	grid() {
		return this.data.grid;
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




if(typeof module !== 'undefined') module.exports = TicTacToe;
else window.TicTacToe = TicTacToe;