describe("sg.Direction", function() {
	it("Is Enumeration", function() {
		expect(sg.DIRECTION.UNDIRECTED).toBeDefined();
		expect(sg.DIRECTION.DIRECTED).toBeDefined();
		expect(sg.DIRECTION.MIXED).toBeDefined();

		expect(sg.DIRECTION.UNDIRECTED).not.toBe(sg.DIRECTION.DIRECTED);
		expect(sg.DIRECTION.UNDIRECTED).not.toBe(sg.DIRECTION.MIXED);
		expect(sg.DIRECTION.DIRECTED).not.toBe(sg.DIRECTION.MIXED);
	});

	it("isDirection acts right", function() {
		expect(sg.DIRECTION.isDirection("directed")).toBeFalsy();
		expect(sg.DIRECTION.isDirection("undirected")).toBeFalsy();
		expect(sg.DIRECTION.isDirection("mixed")).toBeFalsy();
		expect(sg.DIRECTION.isDirection(true)).toBeFalsy();
		expect(sg.DIRECTION.isDirection([1,2,3])).toBeFalsy();
		expect(sg.DIRECTION.isDirection({dir:sg.DIRECTION.DIRECTED})).toBeFalsy();

		expect(sg.DIRECTION.isDirection(sg.DIRECTION.UNDIRECTED)).toBeTruthy();
		expect(sg.DIRECTION.isDirection(sg.DIRECTION.DIRECTED)).toBeTruthy();
		expect(sg.DIRECTION.isDirection(sg.DIRECTION.MIXED)).toBeTruthy();
	});
});
