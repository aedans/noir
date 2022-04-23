exports.card = {
	text: () => "Activate this and an orange agent: the next card you play costs $10 less. Refresh this.",
	type: () => "location",
	colors: () => ["orange"],
	cost: () => ({ money: 75}),
	rank: () => 3
}