exports.card = {
	text: () => "Additional cost: remove one of your orange agents. Reveal five cards from your opponent's deck.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 15}),
	rank: () => 1
}