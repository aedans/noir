exports.card = {
	text: () => "Each turn: steal an agent from your opponent, putting it onto your board revealed.",
	type: () => "agent",
	colors: () => ["green"],
	cost: () => ({ money: 180}),
	rank: () => 3
}