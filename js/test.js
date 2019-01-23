require('colors');
global._ = require('lodash');


global.Player = require('./Player.js');
global.TicTacToe = require('./TicTacToe.js');


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

console.log(`${game.winner()||'nobody'} won after ${i} moves\n`);