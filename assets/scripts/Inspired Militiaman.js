exports.card = {
	text: () => "This costs $5 less for each revealed orange agent on your board.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 40}),
	rank: () => 1
}