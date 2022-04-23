exports.card = {
	text: () => "Additional cost: activate an orange agent. Reveal a card on your opponent's board and a card from their deck.",
	type: () => "operation",
	colors: () => ["orange"],
	cost: () => ({ money: 5}),
	rank: () => 1
}