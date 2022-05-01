exports.card = {
	text: () => "Additional cost: activate three agents. Remove an agent and each other revealed agent of the same rank.",
	type: () => "operation",
	colors: () => [],
	cost: () => ({ money: 50}),
	rank: () => 3
}