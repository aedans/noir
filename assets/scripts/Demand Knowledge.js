exports.card = {
	text: () => "Additional cost: activate a purple agent. Reveal one of your opponent's cards, and an additional one for each Random Citizen on your board.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 10}),
	rank: () => 1
}