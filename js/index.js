let game = new TicTacToe({
	size: 3,
	toWin: 3
});
let playerOne = game.newPlayer('x');
let playerTwo = game.newPlayer('o');



$(document).ready(() => {

	let render = () => {
		$('.square')
		.removeClass('x')
		.removeClass('o')

		game.grid().forEach((row, top) => {

			row.forEach((cell, left) => {
				$(`.square[cell=${top+1}-${left+1}]`).addClass(cell);
			});
		});
	};


	$('.square').click(function() {
		let move = $(this).attr('cell').split('-');

		playerOne.play(...move);
		render();

		
		setTimeout(() => {
			let counter = playerTwo.strategy(playerOne).move;
			playerTwo.play(...counter);
			render();
		}, 500);
		
	});
});