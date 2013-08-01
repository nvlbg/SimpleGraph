describe("sg.Edge", function() {
	it("getSource", function() {
		var node1 = new sg.Node("1");
		var node2 = new sg.Node("2");
		var edge = new sg.Edge(node1, node2);

		expect(edge.getSource()).toBe(node1);
		expect(edge.getTarget()).toBe(node2);
	});
});
