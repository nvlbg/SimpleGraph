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

		if (options && typeof options !== 'object') {
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
		 * Indicates if the node is a member of a graph
		 * @private
		 * @property _inGraph
		 * @type {Boolean}
		 * @default false
		 */
		this._inGraph = false;
		
		/**
		 * The graph of which the node is a member or undefined
		 * @private
		 * @property _graph
		 * @type {Object|undefined}
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

		this.addEdge = function(node, options) {
			edges.add({
				node: node,
				options: options
			});
		};

		this.removeEdge = function(node) {
			edges.remove(node);
		};

		this.removeAllEdges = function() {
			edges.clear();
		};

		this.getEdges = function() {
			return edges.toArray();
		};

		this.addToGraph = function(g) {
			if (this._inGraph === true) {
				throw "This node is already in a graph.";
			}

			if (!(g instanceof SG.Graph)) {
				throw "The passed parameter is not a SG.Graph.";
			}

			g.addNode(this);
		};

		this.removeFromGraph = function() {
			if (this._inGraph !== true) {
				throw "The node is not in a graph.";
			}

			g.removeNode(this);
		};

		this.connect = function(node, options) {
			if (this._inGraph !== true) {
				throw "The node is not in a graph.";
			}

			this._graph.connect(this, node, options);
		};

		this.detach = function(node) {
			if (this._inGraph !== true) {
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
	 * @param {Object} [options] Optional data object the user can store in the edge.
	 * 							 If the graph is weighted you can pass a weight value in this object.
	 */
	function Edge(a, b, options) {
		if (!(a instanceof SG.Node) || !(b instanceof SG.Node)) {
			throw "Params are not nodes.";
		}

		if (options && typeof options !== 'object') {
			throw "The options param should be object.";
		}

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
	 */
	function Graph(options) {
		if (options && typeof options !== 'object') {
			throw "The options param should be object.";
		}

		if (options && options.direction &&
			options.direction !== SG.DIRECTION.UNDIRECTED &&
			options.direction !== SG.DIRECTION.DIRECTED &&
			options.direction !== SG.DIRECTION.MIXED) {
			throw "Unknown direction.";
		}

		if (options && options.weighted && typeof options.weighted !== 'boolean') {
			throw "weighted should be boolean.";
		}

		if (options && options.override && typeof options.override !== 'boolean') {
			throw "override should be boolean.";
		}

		this.direction = options && options.direction ? options.direction : SG.DIRECTION.UNDIRECTED;
		this.weighted  = options && options.weighted  ? options.weighted  : false;
		this.override  = options && options.override  ? options.override  : false;
		
		/**
		 * A dictionary containing the graph nodes
		 * @property nodes
		 * @type buckets.Dictionary
		 */
		this.nodes = new buckets.Dictionary();

		/**
		 * A set containing the graph edges
		 * @property edges
		 * @type buckets.Set
		 */
		this.edges = new buckets.Set(function(edge) {
			return edge.getSource().getId() + '->' + edge.getTarget().getId();
		});

		/**
		 * @method addNode
		 * @return {void}
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

			if ( node instanceof SG.Node && node._inGraph === true ) {
				throw "The node \"" + node.getId() + "\" is in another graph.";
			}

			node = node instanceof SG.Node ? node : new SG.Node(id);

			this.nodes.set(id, node);
			node._inGraph = true;
			node._graph = this;
		};

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

			node._inGraph = false;
			node._graph   = undefined;
			node.removeAllEdges();
			this.nodes.remove(id);
		};

		this.connect = function(a, b, options) {
			if (this.nodes.get(a) === undefined) {
				throw "Node \"" + a + "\" isn't in the graph.";
			}

			if (this.nodes.get(b) === undefined) {
				throw "Node \"" + b + "\" isn't in the graph.";
			}

			if (options && !(typeof options === 'object')) {
				throw "Options must be an object.";
			}

			var source = this.nodes.get(a);
			var target = this.nodes.get(b);

			var edge = new SG.Edge(source, target, options);
			source.addEdge(target, options);
			target.addEdge(source, options);
			this.edges.add(edge);
		};

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
					first.removeEdge(second);
					second.removeEdge(first);
					this.edges.remove(edge);
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
							line.push(',');
						});
						line.pop();
						console.log(line.join(''));
					});
				};
			}
		}
	};
	
	window.SG = window.SG || SG;
}());
