exports.card = {
	text: () => "Reveal cards from your opponent's deck equal to the number of purple guys on your board.",
	type: () => "operation",
	colors: () => ["purple"],
	cost: () => ({ money: 10}),
}