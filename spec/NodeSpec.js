// just for disabling some test cases
var xexpect = function() { return { toThrow: function() {} }; };

describe("sg.Node", function() {
	it("Instanciating", function() {
		var nonStringId1 = function() {
			return new sg.Node(2);
		};
		var nonStringId2 = function() {
			return new sg.Node();
		};
		var nonStringId3 = function() {
			return new sg.Node({});
		};
		var emptyStringId = function() {
			return new sg.Node("");
		};
		var nonObjectOptions1 = function() {
			return new sg.Node("Example", "string");
		};
		var nonObjectOptions2 = function() {
			return new sg.Node("Example", "object");
		};
		var nonObjectOptions3 = function() {
			return new sg.Node("Example", [1,2,3]);
		};

		var correctExample1 = function() {
			return new sg.Node("Example", {
				data: [1,2,3],
				label: "Node"
			});
		};
		var correctExample2 = function() {
			return new sg.Node("Example");
		};

		expect(nonStringId1).toThrow();
		expect(nonStringId2).toThrow();
		expect(nonStringId3).toThrow();
		expect(emptyStringId).toThrow();
		expect(nonObjectOptions1).toThrow();
		expect(nonObjectOptions2).toThrow();
		expect(nonObjectOptions3).toThrow();

		expect(correctExample1).not.toThrow();
		expect(correctExample2).not.toThrow();
	});
	
	it("options can store data", function() {
		var sofia = new sg.Node("Sofia", {
			country: "Bulgaria"
		});
		var liverpool = new sg.Node("Liverpool", {
			country: "England"
		});

		expect(typeof sofia.options).toBe("object");
		expect(typeof liverpool.options).toBe("object");
		expect(sofia.options.country).toBe("Bulgaria");
		expect(liverpool.options.country).toBe("England");

		sofia.options.capital = true;
		liverpool.options.capital = false;

		expect(sofia.options.capital).toBeTruthy();
		expect(liverpool.options.capital).toBeFalsy();
	});

	it("_addEdge", function() {
		var node = new sg.Node("Sofia");
		var nonEdge1 = function() {
			node._addEdge("Plovdiv");
		};
		var nonEdge2 = function() {
			node._addEdge(123);
		};
		var nonEdge3 = function() {
			node._addEdge();
		};
		var nonEdge4 = function() {
			node._addEdge([1,2,3]);
		};
		var nonEdge5 = function() {
			node._addEdge({});
		};

		expect(nonEdge1).toThrow();
		expect(nonEdge2).toThrow();
		expect(nonEdge3).toThrow();
		expect(nonEdge4).toThrow();
		expect(nonEdge5).toThrow();

		var node2 = new sg.Node("Plovdiv");
		var node3 = new sg.Node("Burgas");
		var edge = new sg.Edge(node, node2);
		var edge2 = new sg.Edge(node, node3);
		
		expect(node.edges.size()).toBe(0);

		node._addEdge(edge);
		
		expect(node.edges.size()).toBe(1);

		xexpect(function() { node._addEdge(edge); }).toThrow();
		xexpect(function() { node._addEdge(edge._sourceConnection); }).toThrow();
		xexpect(function() { node._addEdge(edge._targetConnection); }).toThrow();

		expect(function() { node._addEdge(edge2._sourceConnection); }).not.toThrow();
		
		expect(node.edges.size()).toBe(2);

		var arr = node.edges.toArray();
		
		expect(arr[0].edge).toBe(edge);
		expect(arr[0].node).toBe(node2);
		expect(arr[1].edge).toBe(edge2);
		expect(arr[1].node).toBe(node3);
	});

	it('_removeEdge', function() {
		var node = new sg.Node("Sofia");
		var node2 = new sg.Node("Plovdiv");
		var node3 = new sg.Node("Burgas");
		var edge = new sg.Edge(node, node2);
		var edge2 = new sg.Edge(node, node3);
		var edge3 = new sg.Edge(node2, node3);

		node._addEdge(edge);
		node._addEdge(edge2);
		node2._addEdge(edge);
		node2._addEdge(edge3);
		node3._addEdge(edge2);
		node3._addEdge(edge3);

		var nonEdge1 = function() {
			node._removeEdge("Plovdiv");
		};
		var nonEdge2 = function() {
			node._removeEdge(123);
		};
		var nonEdge3 = function() {
			node._removeEdge();
		};

		expect(nonEdge1).toThrow();
		expect(nonEdge2).toThrow();
		expect(nonEdge3).toThrow();

		node._removeEdge(edge);
		node2._removeEdge(edge);

		expect(node.edges.toArray()[0].edge).toBe(edge2);
		expect(node2.edges.toArray()[0].edge).toBe(edge3);
		expect(node3.edges.toArray().length).toBe(2);
		expect(node3.edges.toArray()[0].edge).toBe(edge2);
		expect(node3.edges.toArray()[1].edge).toBe(edge3);
	});

	it("addToGraph", function() {
		var graphCorruption = function() {
			var g = new sg.Graph();
			var g2 = new sg.Graph();
			var n = new sg.Node("Sofia");
			n.addToGraph(g);
			n.addToGraph(g2);
		};
		var incorrectGraph1 = function() {
			var n = new sg.Node("Sofia");
			n.addToGraph(123);
		};
		var incorrectGraph2 = function() {
			var n = new sg.Node("Sofia");
			n.addToGraph("graph");
		};
		var incorrectGraph3 = function() {
			var n = new sg.Node("Sofia");
			n.addToGraph([1,2,3]);
		};
		var incorrectGraph4 = function() {
			var n = new sg.Node("Sofia");
			n.addToGraph({});
		};

		expect(graphCorruption).toThrow();
		expect(incorrectGraph1).toThrow();
		expect(incorrectGraph2).toThrow();
		expect(incorrectGraph3).toThrow();
		expect(incorrectGraph4).toThrow();

		var g = new sg.Graph();
		var n = new sg.Node("Sofia");

		expect(n._graph).toBeUndefined();
		expect(g.nodes.isEmpty()).toBeTruthy();

		n.addToGraph(g);

		expect(n._graph).toBe(g);
		expect(g.nodes.isEmpty()).toBeFalsy();
		expect(g.getNode("Sofia")).toBe(n);
	});

	it("removeFromGraph", function() {
		var unexistingGraph = function() {
			var n = new sg.Node("Sofia");
			n.removeFromGraph();
		};

		expect(unexistingGraph).toThrow();

		var g = new sg.Graph();
		var n = new sg.Node("Sofia");
		n.addToGraph(g);
		expect(n._graph).toBe(g);
		n.removeFromGraph();
		expect(n._graph).toBeUndefined();
	});

	it("connect", function() {
		var noGraph = function() {
			var n = new sg.Node("Sofia");
			n.connect();
		};
		var noGraph2 = function() {
			var n = new sg.Node("Sofia");
			var n2 = new sg.Node("Plovdiv");
			n.connect(n2);
		};
		var noGraph3 = function() {
			var g = new sg.Graph();
			var n = new sg.Node("Sofia");
			n.addToGraph(g);
			n.connect("Plovdiv");
		};
		var noGraph4 = function() {
			var g = new sg.Graph();
			var n = new sg.Node("Sofia");
			var n2 = new sg.Node("Plovdiv");
			n.addToGraph(g);
			n.connect(n2);
		};

		expect(noGraph).toThrow();
		expect(noGraph2).toThrow();
		expect(noGraph3).toThrow();
		expect(noGraph4).toThrow();

		var g = new sg.Graph();
		var n = new sg.Node("Sofia");
		var n2 = new sg.Node("Plovdiv");
		var n3 = new sg.Node("Varna");

		n.addToGraph(g);
		n2.addToGraph(g);
		n3.addToGraph(g);

		expect(n.edges.size()).toBe(0);
		expect(n2.edges.size()).toBe(0);

		n.connect(n2);

		expect(n.edges.size()).toBe(1);
		expect(n2.edges.size()).toBe(1);

		expect(n.edges.toArray()[0].node).toBe(n2);
		expect(n2.edges.toArray()[0].node).toBe(n);

		g.direction(sg.DIRECTION.MIXED);

		n3.connect(n, { directed: true });

		expect(n.edges.size()).toBe(1);
		expect(n2.edges.size()).toBe(1);
		expect(n3.edges.size()).toBe(1);

		expect(n.edges.toArray()[0].node).toBe(n2);
		expect(n2.edges.toArray()[0].node).toBe(n);
		expect(n3.edges.toArray()[0].node).toBe(n);
	});

	it("detach", function() {
		var g = new sg.Graph();
		var n = new sg.Node("Sofia");
		var n2 = new sg.Node("Plovdiv");

		n.addToGraph(g);
		n2.addToGraph(g);

		n.connect(n2);

		var noGraph = function() {
			new sg.Node("Fake").detach("asd");
		};
		var unexistingNode = function() {
			n.detach(new sg.Node("Fake"));
		};
		var incorrectNode1 = function() {
			n.detach(123);
		};
		var incorrectNode2 = function() {
			n.detach("fake");
		};
		var incorrectNode3 = function() {
			n.detach({});
		};

		expect(noGraph).toThrow();
		expect(unexistingNode).toThrow();
		expect(incorrectNode1).toThrow();
		expect(incorrectNode2).toThrow();
		expect(incorrectNode3).toThrow();

		expect(n.edges.toArray()[0].node).toBe(n2);
		expect(n2.edges.toArray()[0].node).toBe(n);

		n.detach(n2);

		expect(n.edges.toArray().length).toBe(0);
		expect(n2.edges.toArray().length).toBe(0);
	});

	it("getId", function() {
		var node = new sg.Node("Sofia");
		expect(node.getId()).toBe("Sofia");
		expect(node.getId()).toBe(node._id);
	});

	it("getEdges", function() {
		var node1 = new sg.Node("Example 1");
		var node2 = new sg.Node("Example 2");
		var node3 = new sg.Node("Example 3");
		var edge1 = new sg.Edge(node1, node2);
		var edge2 = new sg.Edge(node1, node3);
		node1._addEdge(edge1);
		node1._addEdge(edge2);

		var arr = node1.getEdges();
		
		expect(arr.length).toBe(2);
		expect(arr[0]).toBe(edge1._sourceConnection);
		expect(arr[1]).toBe(edge2._sourceConnection);
	});
});
