exports.card = {
	text: () => "Activate this: the next orange card you play this turn costs $10 less.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 40}),
	rank: () => 1
}