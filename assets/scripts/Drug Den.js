exports.card = {
	text: () => "Each turn: destroy a hidden guy in your deck and gain $30. If it's purple, gain $40 instead.",
	type: () => "location",
	colors: () => ["purple"],
	cost: () => ({ money: 75}),
}