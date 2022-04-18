exports.card = {
	text: () => "Additional cost: activate a green agent. Steal an agent from your opponent, putting it revealed onto your board.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 80}),
	rank: () => 2
}