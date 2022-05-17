exports.card = {
	text: () => "Additional cost: activate six blue agents. Remove each non-blue agent.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 120}),
	rank: () => 3
}