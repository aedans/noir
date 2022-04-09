exports.card = {
	text: () => "Additional cost: activate two blue agents. Destroy a rank 1 or 2 guy.",
	type: () => "operation",
	colors: () => ["blue"],
	cost: () => ({ money: 20}),
	rank: () => 2
}