describe("Conversion", function() {
	beforeEach(function() {
		this.addMatchers({
			toContainNode: function(element, times) {
				times = times || 1;
				var found = 0;
				for (var i = 0, len = this.actual.length; i < len; i++) {
					if (this.actual[i].node === element) {
						found ++;
					}
				}
				return found === times;
			}
		});
	});

	var getSimpleGraph = function (direction) {
		var g = new sg.Graph({
			direction: direction,
			multigraph: false
		});

		g.addNode("1");
		g.addNode("2");
		g.addNode("3");

		g.connect("1", "2", { directed: true });
		g.connect("2", "3", { directed: false });
		g.connect("3", "1", { directed: true });

		return g;
	};

	var setDirection = function(g, from, to) {
		expect(g.direction()).toBe(from);
		g.direction(to);
		expect(g.direction()).toBe(to);
	};

	var assureIsUndirectedSimple = function(g) {
		expect(g.getNode("1").edges.size()).toBe(2);
		expect(g.getNode("2").edges.size()).toBe(2);
		expect(g.getNode("3").edges.size()).toBe(2);

		expect(g.getNode("1").getEdges()).toContainNode(g.getNode("2"));
		expect(g.getNode("1").getEdges()).toContainNode(g.getNode("3"));
		expect(g.getNode("2").getEdges()).toContainNode(g.getNode("1"));
		expect(g.getNode("2").getEdges()).toContainNode(g.getNode("3"));
		expect(g.getNode("3").getEdges()).toContainNode(g.getNode("2"));
		expect(g.getNode("3").getEdges()).toContainNode(g.getNode("1"));
	};

	var assureIsDirectedSimple = function(g) {
		expect(g.getNode("1").edges.size()).toBe(1);
		expect(g.getNode("2").edges.size()).toBe(1);
		expect(g.getNode("3").edges.size()).toBe(1);

		expect(g.getNode("1").getEdges()).toContainNode(g.getNode("2"));
		expect(g.getNode("2").getEdges()).toContainNode(g.getNode("3"));
		expect(g.getNode("3").getEdges()).toContainNode(g.getNode("1"));
	};

	var assureIsMixedSimple = function(g) {
		expect(g.getNode("1").edges.size()).toBe(1);
		expect(g.getNode("2").edges.size()).toBe(1);
		expect(g.getNode("3").edges.size()).toBe(2);

		expect(g.getNode("1").getEdges()).toContainNode(g.getNode("2"));
		expect(g.getNode("2").getEdges()).toContainNode(g.getNode("3"));
		expect(g.getNode("3").getEdges()).toContainNode(g.getNode("2"));
		expect(g.getNode("3").getEdges()).toContainNode(g.getNode("1"));
	};

	var getMultiGraph = function(direction) {
		var g = new sg.Graph({
			direction: direction,
			multigraph: true
		});

		g.addNode("1");
		g.addNode("2");
		g.addNode("3");

		g.connect("1", "2", { directed: true });
		g.connect("1", "2", { directed: false });
		g.connect("2", "3", { directed: true });
		g.connect("2", "3", { directed: false });
		g.connect("3", "1", { directed: true });
		g.connect("3", "1", { directed: false });

		return g;
	};

	var assureIsUndirectedMulti = function(g) {
		expect(g.getNode("1").edges.size()).toBe(4);
		expect(g.getNode("2").edges.size()).toBe(4);
		expect(g.getNode("3").edges.size()).toBe(4);

		expect(g.getNode("1").getEdges()).toContainNode(g.getNode("2"), 2);
		expect(g.getNode("1").getEdges()).toContainNode(g.getNode("3"), 2);
		expect(g.getNode("2").getEdges()).toContainNode(g.getNode("1"), 2);
		expect(g.getNode("2").getEdges()).toContainNode(g.getNode("3"), 2);
		expect(g.getNode("3").getEdges()).toContainNode(g.getNode("1"), 2);
		expect(g.getNode("3").getEdges()).toContainNode(g.getNode("2"), 2);
	};

	var assureIsDirectedMulti = function(g) {
		expect(g.getNode("1").edges.size()).toBe(2);
		expect(g.getNode("2").edges.size()).toBe(2);
		expect(g.getNode("3").edges.size()).toBe(2);

		expect(g.getNode("1").getEdges()).toContainNode(g.getNode("2"), 2);
		expect(g.getNode("2").getEdges()).toContainNode(g.getNode("3"), 2);
		expect(g.getNode("3").getEdges()).toContainNode(g.getNode("1"), 2);
	};

	var assureIsMixedMulti = function(g) {
		expect(g.getNode("1").edges.size()).toBe(3);
		expect(g.getNode("2").edges.size()).toBe(3);
		expect(g.getNode("3").edges.size()).toBe(3);

		expect(g.getNode("1").getEdges()).toContainNode(g.getNode("2"), 2);
		expect(g.getNode("1").getEdges()).toContainNode(g.getNode("3"), 1);
		expect(g.getNode("2").getEdges()).toContainNode(g.getNode("1"), 1);
		expect(g.getNode("2").getEdges()).toContainNode(g.getNode("3"), 2);
		expect(g.getNode("3").getEdges()).toContainNode(g.getNode("1"), 2);
		expect(g.getNode("3").getEdges()).toContainNode(g.getNode("2"), 1);
	};

	var assureIsMixed = function(g) {
		expect(g.direction()).toBe(sg.DIRECTION.MIXED);

		g.addNode("4");
		g.addNode("5");
		g.addNode("6");

		g.connect("4", "5", { directed: false });
		g.connect("5", "6", { directed: true });

		expect(g.getNode("4").edges.size()).toBe(1);
		expect(g.getNode("5").edges.size()).toBe(2);
		expect(g.getNode("6").edges.size()).toBe(0);

		expect(g.getNode("4").getEdges()).toContainNode(g.getNode("5"));
		expect(g.getNode("5").getEdges()).toContainNode(g.getNode("4"));
		expect(g.getNode("5").getEdges()).toContainNode(g.getNode("6"));
	};

	var assureIsSimple = function(g) {
		expect(function() {
			g.addNode("4");
			g.addNode("5");

			g.connect("4", "5");
			g.connect("4", "5");
		}).toThrow();
	};

	var assureIsMulti = function(g) {
		expect(function() {
			g.addNode("6");
			g.addNode("7");

			g.connect("6", "7");
			g.connect("6", "7");
		}).not.toThrow();
	};

	var setMultigraph = function(g, multi) {
		expect(g.multigraph()).not.toBe(multi);
		g.multigraph(multi);
		expect(g.multigraph()).toBe(multi);
	};

	it("Undirected Simple -> Directed Simple", function() {
		var g = getSimpleGraph(sg.DIRECTION.UNDIRECTED);

		assureIsUndirectedSimple(g);
		setDirection(g, sg.DIRECTION.UNDIRECTED, sg.DIRECTION.DIRECTED);
		assureIsDirectedSimple(g);
	});
	
	it("Directed Simple -> Undirected Simple", function() {
		var g = getSimpleGraph(sg.DIRECTION.DIRECTED);

		assureIsDirectedSimple(g);
		setDirection(g, sg.DIRECTION.DIRECTED, sg.DIRECTION.UNDIRECTED);
		assureIsUndirectedSimple(g);
	});

	it("Undirected Simple -> Mixed Simple", function() {
		var g = getSimpleGraph(sg.DIRECTION.UNDIRECTED);

		assureIsUndirectedSimple(g);
		setDirection(g, sg.DIRECTION.UNDIRECTED, sg.DIRECTION.MIXED);
		assureIsUndirectedSimple(g);
		assureIsMixed(g);
	});

	it("Directed Simple -> Mixed Simple", function() {
		var g = getSimpleGraph(sg.DIRECTION.DIRECTED);

		assureIsDirectedSimple(g);
		setDirection(g, sg.DIRECTION.DIRECTED, sg.DIRECTION.MIXED);
		assureIsDirectedSimple(g);
		assureIsMixed(g);
	});

	it("Mixed Simple -> Undirected Simple", function() {
		var g = getSimpleGraph(sg.DIRECTION.MIXED);

		assureIsMixedSimple(g);
		setDirection(g, sg.DIRECTION.MIXED, sg.DIRECTION.UNDIRECTED);
		assureIsUndirectedSimple(g);
	});
	
	it("Mixed Simple -> Directed Simple", function() {
		var g = getSimpleGraph(sg.DIRECTION.MIXED);

		assureIsMixedSimple(g);
		setDirection(g, sg.DIRECTION.MIXED, sg.DIRECTION.DIRECTED);
		assureIsDirectedSimple(g);
	});

	it("Undirected Multi -> Directed Multi", function() {
		var g = getMultiGraph(sg.DIRECTION.UNDIRECTED);

		assureIsUndirectedMulti(g);
		setDirection(g, sg.DIRECTION.UNDIRECTED, sg.DIRECTION.DIRECTED);
		assureIsDirectedMulti(g);
	});

	it("Directed Multi -> Undirected Multi", function() {
		var g = getMultiGraph(sg.DIRECTION.DIRECTED);

		assureIsDirectedMulti(g);
		setDirection(g, sg.DIRECTION.DIRECTED, sg.DIRECTION.UNDIRECTED);
		assureIsUndirectedMulti(g);
	});

	it("Undirected Multi -> Mixed Multi", function() {
		var g = getMultiGraph(sg.DIRECTION.UNDIRECTED);

		assureIsUndirectedMulti(g);
		setDirection(g, sg.DIRECTION.UNDIRECTED, sg.DIRECTION.MIXED);
		assureIsUndirectedMulti(g);
		assureIsMixed(g);
	});

	it("Directed Multi -> Mixed Multi", function() {
		var g = getMultiGraph(sg.DIRECTION.DIRECTED);

		assureIsDirectedMulti(g);
		setDirection(g, sg.DIRECTION.DIRECTED, sg.DIRECTION.MIXED);
		assureIsDirectedMulti(g);
		assureIsMixed(g);
	});

	it("Mixed Multi -> Undirected Multi", function() {
		var g = getMultiGraph(sg.DIRECTION.MIXED);

		assureIsMixedMulti(g);
		setDirection(g, sg.DIRECTION.MIXED, sg.DIRECTION.UNDIRECTED);
		assureIsUndirectedMulti(g);
	});

	it("Mixed Multi -> Directed Multi", function() {
		var g = getMultiGraph(sg.DIRECTION.MIXED);

		assureIsMixedMulti(g);
		setDirection(g, sg.DIRECTION.MIXED, sg.DIRECTION.DIRECTED);
		assureIsDirectedMulti(g);
	});

	it("Undirected Simple -> Undirected Multi", function() {
		var g = getSimpleGraph(sg.DIRECTION.UNDIRECTED);

		assureIsUndirectedSimple(g);
		assureIsSimple(g);

		setMultigraph(g, true);

		assureIsMulti(g);
	});

	it("Directed Simple -> Directed Multi", function() {
		var g = getSimpleGraph(sg.DIRECTION.DIRECTED);

		assureIsDirectedSimple(g);
		assureIsSimple(g);

		setMultigraph(g, true);

		assureIsMulti(g);
	});

	it("Mixed Simple -> Mixed Multi", function() {
		var g = getSimpleGraph(sg.DIRECTION.MIXED);

		assureIsMixedSimple(g);
		assureIsSimple(g);

		setMultigraph(g, true);

		assureIsMulti(g);
	});

	it("Undirected Multi -> Undirected Simple", function() {
		var g = getMultiGraph(sg.DIRECTION.UNDIRECTED);

		assureIsUndirectedMulti(g);
		assureIsMulti(g);

		setMultigraph(g, false);

		assureIsSimple(g);
	});

	it("Directed Multi -> Directed Simple", function() {
		var g = getMultiGraph(sg.DIRECTION.DIRECTED);

		assureIsDirectedMulti(g);
		assureIsMulti(g);

		setMultigraph(g, false);

		assureIsSimple(g);
	});

	it("Mixed Multi -> Mixed Simple", function() {
		var g = getMultiGraph(sg.DIRECTION.MIXED);

		assureIsMixedMulti(g);
		assureIsMulti(g);

		setMultigraph(g, false);

		assureIsSimple(g);
	});
});
