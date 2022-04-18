exports.card = {
	text: () => "Additional cost: activate a purple agent. Destroy an agent and all agents on your opponent's board with the same name.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 60}),
	rank: () => 2
}