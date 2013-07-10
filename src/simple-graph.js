;(function() {
	/**
	 * Enumeration for the direction property of a graph
	 * @namespace SG
	 * @class DIRECTION
	 * @static
	 * @final
	 */
	var DIRECTION = {
		/**
		 * Indicates that the graph is not directed
		 * @property UNDIRECTED
		 * @static
		 * @final
		 */
		UNDIRECTED: 0,

		/**
		 * Indicates that the graph is directed
		 * @property DIRECTED
		 * @static
		 * @final
		 */
		DIRECTED: 1,

		/**
		 * Indicates that the graph is mixed (e.g. some edges are directed, others not)
		 * @property MIXED
		 * @static
		 * @final
		 */
		MIXED: 2
	};

	/**
	 * Represents a graph node
	 * @namespace SG
	 * @class Node
	 * @constructor
	 * @param {String} id Node's identificator.
	 * 					  Two nodes in a graph cannot have the same id.
	 * 					  ***Must not be empty string***
	 * @param {Object} [options] Optional data object the user can store in the node.
	 * @example
	 * 	var a = new Node("Example");
	 * 	var b = new Node("Data", { index: 10 });
	 */
	function Node(id, options) {
		if (typeof id !== "string" || id === "") {
			throw "Invalid value for id.";
		}

		if (options && typeof options !== "object") {
			throw "The options param should be object.";
		}

		/**
		 * The node identifier
		 * @private
		 * @property _id
		 */
		var _id       = id;
		
		/**
		 * Getter for the node's id
		 * @method getId
		 * @return {String} the node's id
		 */
		this.getId    = function() {
			return _id;
		};

		/**
		 * Custom object for storing arbitrary data
		 * @property options
		 * @type Object
		 */
		this.options  = options;
		
		/**
		 * The graph of which the node is a member or undefined
		 * @private
		 * @property _graph
		 * @type {SG.Graph|undefined}
		 * @default undefined
		 */
		this._graph   = undefined;

		/**
		 * The edges connected to this node
		 * @private
		 * @property edges
		 * @type buckets.Set
		 */
		var edges = new buckets.Set(function(edge) {
			return edge.node ? edge.node.getId() : edge.getId();
		});

		/**
		 * @method addEdge
		 * @param edge {SG.Edge}
		 */
		this.addEdge = function(edge) {
			edges.add(edge);
		};

		/**
		 * @method removeEdge
		 * @param edge {SG.Edge}
		 */
		this.removeEdge = function(edge) {
			edges.remove(edge);
		};

		/**
		 * @method removeAllEdges
		 */
		this.removeAllEdges = function() {
			edges.clear();
		};

		/**
		 * @method getEdges
		 * @return {Array}
		 */
		this.getEdges = function() {
			return edges.toArray();
		};

		/**
		 * @method addToGraph
		 * @param graph {SG.Graph}
		 */
		this.addToGraph = function(g) {
			if (this._graph !== undefined) {
				throw "This node is already in a graph.";
			}

			if (!(g instanceof SG.Graph)) {
				throw "The passed parameter is not a SG.Graph.";
			}

			g.addNode(this);
		};

		/**
		 * @method removeFromGraph
		 */
		this.removeFromGraph = function() {
			if (this._graph !== undefined) {
				throw "The node is not in a graph.";
			}

			g.removeNode(this);
		};

		/**
		 * @method connect
		 * @param node {SG.Node}
		 * @param [options] {Object}
		 */
		this.connect = function(node, options) {
			if (this._graph !== undefined) {
				throw "The node is not in a graph.";
			}

			this._graph.connect(this, node, options);
		};

		/**
		 * @method detach
		 * @param node {SG.Node}
		 */
		this.detach = function(node) {
			if (this._graph !== undefined) {
				throw "The node is not in a graph.";
			}

			this._graph.detach(this, node);
		};
	}

	/**
	 * Represents a graph edge (e.g. connection of 2 nodes in a graph)
	 * @namespace SG
	 * @class Edge
	 * @constructor
	 * @param {SG.Node} source Source node
	 * @param {SG.Node} target Target node
	 * @param {Object} [options] Optional data object the user can store in the edge
	 * 							 (can be accessed via the SG.Edge.options property).
	 * 							 The options object may have the following properties
	 * 							 (and/or any of your own):
	 * 		@param {Number} [options.weight=1.0] in case of weighted graph, this is the edge's weight.
	 * 		@param {Boolean} [options.directed=false] If true, the edge is directed source->target.
	 * 												  If false, the edge has no direction
	 */
	function Edge(a, b, options) {
		if (!(a instanceof SG.Node) || !(b instanceof SG.Node)) {
			throw "Params are not nodes.";
		}

		if (options && typeof options !== "object") {
			throw "The options param should be object.";
		}

		if (options && options.weight && typeof options.weight !== "number") {
			throw "options.weight must be a number";
		}

		if (options && options.directed && typeof options.directed !== "boolean") {
			throw "options.directed must be a boolean";
		}

		/**
		 * The graph of which the edge is a member or undefined
		 * @private
		 * @property _graph
		 * @type {SG.Graph|undefined}
		 * @default undefined
		 */
		this._graph   = undefined;

		/**
		 * The first end of the edge
		 * @private
		 * @property source
		 * @type SG.Node
		 */
		var source = a;
		
		/**
		 * The second end of the edge
		 * @private
		 * @property target
		 * @type SG.Node
		 */
		var target = b;

		/**
		 * In case of weighted graph, this property holds the weight of the edge.
		 * @private
		 * @property weigth
		 * @type Number
		 * @default 1.0
		 */
		this.weight = options && options.weight ? options.weight : 1.0;

		/**
		 * If true, the edge is directed source->target. If false, the edge has no direction
		 * @private
		 * @property directed
		 * @type Boolean
		 * @default false
		 */
		this.directed = options && options.directed ? options.directed : false;

		/**
		 * Custom object for storing arbitrary data
		 * @property options
		 * @type Object
		 */
		this.options = options;

		/**
		 * Getter for the source node
		 * @method getSource
		 * @return {SG.Node} the source node of the edge
		 */
		this.getSource = function() {
			return source;
		};

		/**
		 * Getter for the target node
		 * @method getTarget
		 * @return {SG.Node} the target node of the edge
		 */
		this.getTarget = function() {
			return target;
		};
	}

	/**
	 * Represents a graph
	 * @namespace SG
	 * @class Graph
	 * @constructor
	 * @param {Object} [options] Optional data object the user can store in the graph.
	 * 		@param {SG.DIRECTION} [options.direction] the direction of the graph
	 * 		@param {Boolean} [options.weighted] indicates if the graph is weighted or not
	 * 		@param {Boolean} [options.override]
	 */
	function Graph(options) {
		if (options && typeof options !== "object") {
			throw "The options param should be object.";
		}

		if (options && options.direction &&
			options.direction !== SG.DIRECTION.UNDIRECTED &&
			options.direction !== SG.DIRECTION.DIRECTED &&
			options.direction !== SG.DIRECTION.MIXED) {
			throw "Unknown direction.";
		}

		if (options && options.weighted && typeof options.weighted !== "boolean") {
			throw "weighted should be boolean.";
		}

		if (options && options.override && typeof options.override !== "boolean") {
			throw "override should be boolean.";
		}

		/**
		 * The direction of the graph
		 * @property direction
		 * @type SG.DIRECTION
		 * @default SG.DIRECTION.UNDIRECTED
		 */
		this.direction = options && options.direction ? options.direction : SG.DIRECTION.UNDIRECTED;

		/**
		 * Indicates if the graph is weighted or not
		 * @property weighted
		 * @type Boolean
		 * @default false
		 */
		this.weighted  = options && options.weighted  ? options.weighted  : false;

		/**
		 * @property override
		 * @type Boolean
		 * @default false
		 */
		this.override  = options && options.override  ? options.override  : false;
		
		/**
		 * A dictionary containing the graph nodes
		 * @private
		 * @property nodes
		 * @type buckets.Dictionary
		 */
		this.nodes = new buckets.Dictionary();

		/**
		 * A set containing the graph edges
		 * @private
		 * @property edges
		 * @type buckets.Set
		 */
		this.edges = new buckets.Set(function(edge) {
			return edge.getSource().getId() + "->" + edge.getTarget().getId();
		});

		/**
		 * @method addNode
		 * @param node {SG.Node}
		 */
		this.addNode = function(node) {
			if ((typeof node !== "string" || node === "") && !(node instanceof SG.Node)) {
				throw "Invalid node: " + node;
			}

			var id = node.getId ? node.getId() : node;
			if ( !this.override && this.nodes.get(id) !== undefined ) {
				throw "A node with id \"" + id + "\" already exists in this graph." +
					  "(Use the option override if needed)";
			}

			if ( node instanceof SG.Node && this._graph !== undefined ) {
				throw "The node \"" + node.getId() + "\" is in another graph.";
			}

			node = node instanceof SG.Node ? node : new SG.Node(id);

			this.nodes.set(id, node);
			node._graph = this;
		};

		/**
		 * @method removeNode
		 * @param node {SG.Node}
		 */
		this.removeNode = function(node) {
			if ((typeof node !== "string" || node === "") && !(node instanceof SG.Node)) {
				throw "Invalid node.";
			}

			var id = node.getId ? node.getId() : node;
			if (this.nodes.get(id) === undefined ||
				(node instanceof SG.Node && this.nodes.get(id) !== node)) {
				throw "The passed node is not in this graph.";
			}

			node = this.nodes.get(id);
			this.edges.forEach(function(edge) {
				var source = edge.getSource();
				var target = edge.getTarget();

				if (source === node || target === node) {
					if (source !== node) {
						source.removeEdge(node);
					}

					if (target !== node) {
						target.removeEdge(node);
					}

					this.edges.remove(edge);
				}
			}.bind(this));

			node._graph   = undefined;
			node.removeAllEdges();
			this.nodes.remove(id);
		};

		/**
		 * @method connect
		 * @param keyA {String}
		 * @param keyB {String}
		 * @param [options] {Object}
		 */
		this.connect = function(a, b, options) {
			if (this.nodes.get(a) === undefined) {
				throw "Node \"" + a + "\" isn't in the graph.";
			}

			if (this.nodes.get(b) === undefined) {
				throw "Node \"" + b + "\" isn't in the graph.";
			}

			if (options && !(typeof options === "object")) {
				throw "Options must be an object.";
			}

			var source = this.nodes.get(a);
			var target = this.nodes.get(b);

			var edge = new SG.Edge(source, target, options);
			edge._graph = this;
			source.addEdge(edge);
			target.addEdge(edge);
			this.edges.add(edge);
		};

		/**
		 * @method detach
		 * @param keyA {String}
		 * @param keyB {String}
		 */
		this.detach = function(a, b) {
			if (this.nodes.get(a) === undefined) {
				throw "Node \"" + a + "\" isn't in the graph.";
			}

			if (this.nodes.get(b) === undefined) {
				throw "Node \"" + b + "\" isn't in the graph.";
			}

			var nodeA = this.nodes.get(a);
			var nodeB = this.nodes.get(b);

			var first, second;
			this.edges.forEach(function(edge) {
				first  = edge.getSource();
				second = edge.getTarget();

				if ((first === nodeA && second === nodeB) ||
					(first === nodeB && second === nodeA)) {
					first.removeEdge (edge);
					second.removeEdge(edge);
					this.edges.remove(edge);
					edge._graph = undefined;
				}
			}.bind(this));
		};

		this.getNode = function(id) {
			return this.nodes.get(id);
		};
	}

	/**
	 * Simple Graph - a library for representing graphs
	 * @module SG
	 * @requires Buckets
	 */
	var SG = {
		DIRECTION: DIRECTION,
		Node: Node,
		Edge: Edge,
		Graph: Graph,

		Renderer: {
			ConsoleRenderer: function(graph) {
				this.graph = graph;
				this.draw = function() {
					if (!(graph instanceof SG.Graph)) {
						throw "I don't know how to render " + graph;
					}

					graph.nodes.forEach(function(key, node) {
						var line = [key, ": "];
						var edges = node.getEdges();
						edges.forEach(function(edge) {
							line.push(edge.node.getId())
							line.push(",");
						});
						line.pop();
						console.log(line.join(""));
					});
				};
			}
		}
	};
	
	window.SG = window.SG || SG;
}());
