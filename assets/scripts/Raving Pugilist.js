exports.card = {
	text: () => "Each turn, if you played an agent last turn, destroy one of your opponent's agents.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 55}),
	rank: () => 2
}