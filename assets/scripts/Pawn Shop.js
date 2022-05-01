exports.card = {
	text: () => "The first black card you play each turn costs $25 less. When you play it, remove an agent in your deck, and add a Random Citizen to your deck.",
	type: () => "agent",
	colors: () => ["purple"],
	cost: () => ({ money: 30}),
	rank: () => 1
}