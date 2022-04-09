exports.card = {
	text: () => "Additonal cost: activate an orange agent. Whenever an agent on your board is revealed, reveal a hidden card on your opponent's board.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 70}),
	rank: () => 3
}