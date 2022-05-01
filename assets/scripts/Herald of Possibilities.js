exports.card = {
	text: () => "The first green card you play each turn costs $10 less.",
	type: () => "agent",
	colors: () => ["green"],
	cost: () => ({ money: 50}),
	rank: () => 1
}