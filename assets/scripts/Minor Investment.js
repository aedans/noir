exports.card = {
	text: () => "Additional cost: activate a green guy. Next turn, gain $25.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 5}),
}