describe("sg.Graph", function() {
	it("Instanciating", function() {
		var nonObjectOptions = function() {
			return sg.Graph(123);
		};
		var incorrectDirection1 = function() {
			return sg.Graph({
				direction: -1
			});
		};
		var incorrectDirection2 = function() {
			return sg.Graph({
				direction: "directed"
			});
		};
		var nonBooleanOverride1 = function() {
			return sg.Graph({
				override: 1
			});
		};
		var nonBooleanOverride2 = function() {
			return sg.Graph({
				override: "true"
			});
		};
		var nonBooleanOverride3 = function() {
			return sg.Graph({
				override: "override"
			});
		};
		var nonBooleanMultigraph1 = function() {
			return sg.Graph({
				multigraph: 1
			});
		};
		var nonBooleanMultigraph2 = function() {
			return sg.Graph({
				multigraph: "true"
			});
		};
		var nonBooleanMultigraph3 = function() {
			return sg.Graph({
				multigraph: "multigraph"
			});
		};
		var nonExceptionalExample = function() {
			return sg.Graph({
				direction: sg.DIRECTION.DIRECTED,
				override: false,
				multigraph: true
			});
		};

		expect(nonObjectOptions).toThrow("The options param should be object.");
		
		expect(incorrectDirection1).toThrow("Unknown direction.");
		expect(incorrectDirection2).toThrow("Unknown direction.");

		expect(nonBooleanOverride1).toThrow("override should be boolean.");
		expect(nonBooleanOverride2).toThrow("override should be boolean.");
		expect(nonBooleanOverride3).toThrow("override should be boolean.");

		expect(nonBooleanMultigraph1).toThrow("multigraph should be boolean.");
		expect(nonBooleanMultigraph2).toThrow("multigraph should be boolean.");
		expect(nonBooleanMultigraph3).toThrow("multigraph should be boolean.");

		expect(nonExceptionalExample).not.toThrow();

		var g = new sg.Graph({
			direction: sg.DIRECTION.MIXED,
			multigraph: false,
			override: true,
			custom: "prop"
		});

		expect(g.direction()).toBe(sg.DIRECTION.MIXED);
		expect(g.multigraph()).toBeFalsy();
		expect(g.override).toBeTruthy();
		expect(g.options.custom).toBe("prop");
	});

	it("addNode", function() {
		var bulgaria = new sg.Graph({
			override: false
		});

		var incorrectNode = function() {
			bulgaria.addNode(123);
		};
		var emptyStringNode = function() {
			bulgaria.addNode("");
		};
		var correctNode1 = function() {
			bulgaria.addNode("Sofia");
		};
		var correctNode2 = function() {
			var varna = new sg.Node("Varna");
			bulgaria.addNode(varna);
		};
		var firstOverride = function() {
			bulgaria.addNode("Varna");
		};
		var nodeCorruption = function() {
			var china = new sg.Graph();
			var beijing = new sg.Node("Beijing");
			china.addNode(beijing);
			bulgaria.addNode(beijing);
		};

		expect(incorrectNode).toThrow();
		expect(emptyStringNode).toThrow();
		expect(correctNode1).not.toThrow();
		expect(correctNode2).not.toThrow();
		expect(firstOverride).toThrow();

		bulgaria.override = true;

		expect(firstOverride).not.toThrow();
		expect(nodeCorruption).toThrow();
	});

	it("removeNode", function() {
		var bulgaria = new sg.Graph();
		bulgaria.addNode("Sofia");
		bulgaria.addNode("Varna");
		bulgaria.addNode("Plovdiv");
		bulgaria.addNode("Burgas");

		var nonStringNode = function() {
			bulgaria.removeNode(123);
		};
		var emptyStringNode = function() {
			bulgaria.removeNode("");
		};
		var nonExistingNode1 = function() {
			bulgaria.removeNode("Undefined");
		};
		var nonExistingNode2 = function() {
			bulgaria.removeNode(new sg.Node("Undefined"));
		};
		var nodeCorruption = function() {
			bulgaria.removeNode(new sg.Node("Sofia"));
		};
		var correctExample1 = function() {
			bulgaria.addNode("Fake");
			bulgaria.removeNode("Fake");
		};
		var correctExample2 = function() {
			var fake = new sg.Node("Fake");
			bulgaria.addNode(fake);
			bulgaria.removeNode(fake);
		};

		expect(nonStringNode).toThrow();
		expect(emptyStringNode).toThrow();
		expect(nonExistingNode1).toThrow();
		expect(nonExistingNode2).toThrow();
		expect(nodeCorruption).toThrow();
		expect(correctExample1).not.toThrow();
		expect(correctExample2).not.toThrow();

		bulgaria.addNode("Fake");
		bulgaria.removeNode("Fake");
		expect(bulgaria.getNode("Fake")).toBeUndefined();

		var fake = new sg.Node("Fake");
		bulgaria.addNode(fake);
		bulgaria.removeNode(fake);
		expect(bulgaria.getNode("Fake")).toBeUndefined();
	});
	
	it("override", function() {
		var bulgaria = new sg.Graph({
			override: true
		});

		var sofia1 = new sg.Node("Sofia", {
			population: 1000000
		});
		var sofia2 = new sg.Node("Sofia", {
			population: 1100000
		});

		bulgaria.addNode(sofia1);
		bulgaria.addNode(sofia2);

		expect(bulgaria.getNode("Sofia").options
			   .population).toBe(1100000);
	});
});
