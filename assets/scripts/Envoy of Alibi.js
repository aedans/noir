exports.card = {
	text: () => "Whenever a revealed agent on your board becomes hidden, reveal two cards from your opponent's deck.",
	type: () => "agent",
	colors: () => ["blue"],
	cost: () => ({ money: 55}),
	rank: () => 2
}