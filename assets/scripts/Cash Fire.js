exports.card = {
	text: () => "Additional cost: activate five orange guys and reveal all orange guys from your deck. Set each player's money equal to 0.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 0}),
}