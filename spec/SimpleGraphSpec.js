(function() {
	describe('sg.DIRECTION', function() {
		it('is enum', function() {
			expect(sg.DIRECTION.UNDIRECTED).toBeDefined();
			expect(sg.DIRECTION.DIRECTED).toBeDefined();
			expect(sg.DIRECTION.MIXED).toBeDefined();

			expect(sg.DIRECTION.UNDIRECTED).not.toBe(sg.DIRECTION.DIRECTED);
			expect(sg.DIRECTION.UNDIRECTED).not.toBe(sg.DIRECTION.MIXED);
			expect(sg.DIRECTION.DIRECTED).not.toBe(sg.DIRECTION.MIXED);
		});
	});

	describe('sg.Node', function() {
		it('instanciating', function() {
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
			var nonObjectOptions = function() {
				return new sg.Node("Example", "string");
			};
			var correctExample = function() {
				return new sg.Node("Example", {
					data: [1,2,3],
					label: "Node"
				});
			};

			expect(nonStringId1).toThrow("Invalid value for id.");
			expect(nonStringId2).toThrow("Invalid value for id.");
			expect(nonStringId3).toThrow("Invalid value for id.");
			expect(emptyStringId).toThrow("Invalid value for id.");
			expect(nonObjectOptions).toThrow("The options param should be object.");
			expect(correctExample).not.toThrow();
		});

		it('options', function() {
			var sofia = new sg.Node("Sofia", {
				country: "Bulgaria",
				capital: true
			});
			var liverpool = new sg.Node("Liverpool", {
				country: "England",
				capital: false
			});

			expect(typeof sofia.options).toBe("object");
			expect(typeof liverpool.options).toBe("object");
			expect(sofia.options.country).toBe("Bulgaria");
			expect(sofia.options.capital).toBeTruthy();
			expect(liverpool.options.country).toBe("England");
			expect(liverpool.options.capital).toBeFalsy();
		});

		it('getId', function() {
			var node = new sg.Node("Sofia");
			expect(node.getId()).toBe("Sofia");
		});

		it('addEdge', function() {
			var node = new sg.Node("Sofia");
			var nonEdge1 = function() {
				node.addEdge("Plovdiv");
			};
			var nonEdge2 = function() {
				node.addEdge(123);
			};
			var nonEdge3 = function() {
				node.addEdge();
			};

			expect(nonEdge1).toThrow();
			expect(nonEdge2).toThrow();
			expect(nonEdge3).toThrow();

			var node2 = new sg.Node("Plovdiv");
			var edge = new sg.Edge(node, node2);
			
			node._addEdge(edge);
			
			expect(node.edges.toArray()[0].edge).toBe(edge);
		});

		it('removeEdge', function() {
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

		it('removeAllEdges', function() {
			var node = new sg.Node("Sofia");
			var node2 = new sg.Node("Plovdiv");
			var node3 = new sg.Node("Burgas");
			var edge = new sg.Edge(node, node2);
			var edge2 = new sg.Edge(node, node3);

			node._addEdge(edge);
			node._addEdge(edge2);

			expect(node.edges.size()).toBe(2);

			node._removeAllEdges();

			expect(node.edges.size()).toBe(0);
		});

		it('addToGraph', function() {
			var graphCorruption = function() {
				var g = new sg.Graph();
				var g2 = new sg.Graph();
				var n = new sg.Node("Sofia");
				n.addToGraph(g);
				n.addToGraph(g2);
			};
			var incorrectGraph = function() {
				var n = new sg.Node("Sofia");
				n.addToGraph(123);
			};

			expect(graphCorruption).toThrow();
			expect(incorrectGraph).toThrow();

			var g = new sg.Graph();
			var n = new sg.Node("Sofia");

			n.addToGraph(g);

			expect(g.getNode("Sofia")).toBe(n);
		});

		it('removeFromGraph', function() {
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

		it('connect', function() {
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
				g.addToGraph(g);
				n.connect("Plovdiv");
			};
			var noGraph4 = function() {
				var g = new sg.Graph();
				var n = new sg.Node("Sofia");
				var n2 = new sg.Node("Plovdiv");
				g.addToGraph(g);
				n.connect(n2);
			};

			expect(noGraph).toThrow();
			expect(noGraph2).toThrow();
			expect(noGraph3).toThrow();
			expect(noGraph4).toThrow();

			var g = new sg.Graph();
			var n = new sg.Node("Sofia");
			var n2 = new sg.Node("Plovdiv");

			n.addToGraph(g);
			n2.addToGraph(g);

			n.connect(n2);

			expect(n.edges.toArray()[0].node).toBe(n2);
			expect(n2.edges.toArray()[0].node).toBe(n);
		});

		it('detach', function() {
			var g = new sg.Graph();
			var n = new sg.Node("Sofia");
			var n2 = new sg.Node("Plovdiv");

			n.addToGraph(g);
			n2.addToGraph(g);

			n.connect(n2);

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
	});
	
	describe('sg.Edge', function() {

	});
	
	describe('sg.Graph', function() {
		it('instanciating', function() {
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

		it('addNode', function() {
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

		it('removeNode', function() {
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
		
		it('override', function() {
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
}());
