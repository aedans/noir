exports.card = {
	text: () => "While hidden: if a card on your board would be removed or stolen, instead reveal this and prevent that effect.",
	type: () => "agent",
	colors: () => ["green"],
	cost: () => ({ money: 60}),
	rank: () => 2
}