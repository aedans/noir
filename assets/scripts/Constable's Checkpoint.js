exports.card = {
	text: () => "Additional cost: activate a blue agent. The first blue card you play each turn costs $10 less.",
	type: () => "location",
	colors: () => ["blue"],
	cost: () => ({ money: 35}),
	rank: () => 1
}