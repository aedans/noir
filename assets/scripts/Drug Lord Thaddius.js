exports.card = {
	text: () => "Additional cost: activate a purple guy. Whenever a guy in your deck is destroyed on your turn, gain $20.",
	type: () => "guy",
	colors: () => ["purple"],
	cost: () => ({ money: 50 }),
}