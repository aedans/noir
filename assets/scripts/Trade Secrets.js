exports.card = {
	text: () => "Additional cost: reveal a random green card in your deck. Reveal three random tier 1 or 2 cards from your opponent's deck.",
	type: () => "operation",
	colors: () => ["green"],
	cost: () => ({ money: 5}),
}