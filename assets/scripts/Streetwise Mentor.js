exports.card = {
	text: () => "The first agent you play next turn costs $20 less.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 40}),
	rank: () => 1
}