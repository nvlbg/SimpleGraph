;(function() {
	"use strict";
	var buckets;
	if (typeof require !== "undefined") {
		buckets = require("../lib/buckets.js");
	} else if (typeof window !== "undefined") {
		buckets = window.buckets;
	}

	var util = {
		isObject: function(test) {
			return Object.prototype.toString.call(test) === "[object Object]";
		},

		multiBagContains: function(bag, key) {
			return typeof bag.dictionary.table[key] !== "undefined" &&
				   !bag.dictionary.table[key].value.isEmpty();
		},

		multiBagRemove: function(bag, key) {
			var element = bag.dictionary.table[key];
			if (!buckets.isUndefined(element)) {
				bag.nElements -= element.value.size();
				delete bag.dictionary.table[key];
				bag.dictionary.nElements--;
				return true;
			}
			return false;
		},

		multiBagContainsUndirectedEdge: function(bag, key) {
			var element = bag.dictionary.table[key];
			var ret = false;
			if (!buckets.isUndefined(element)) {
				element.value.forEach(function(edge) {
					if (edge._directed === false) {
						ret = true;
						return false;
					}
				});
			}
			return ret;
		},

		s4: function() {
			return Math.floor((1 + Math.random()) * 0x10000)
					   .toString(16)
					   .substring(1);
		},

		guid: function() {
			return util.s4() + util.s4() + '-' + util.s4() + '-' + util.s4() + '-' +
				   util.s4() + '-' + util.s4() + util.s4() + util.s4();
		}
	};
	
	/**
	 * Enumeration for the direction property of a graph
	 * @class sg.DIRECTION
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
		MIXED: 2,

		/**
		 * Checks if the passed parameter is a DIRECTION
		 * @method isDirection
		 * @static
		 * @final
		 * @param dir
		 * @return {Boolean}
		 */
		isDirection: function(dir) {
			return dir === DIRECTION.UNDIRECTED ||
				   dir === DIRECTION.DIRECTED ||
				   dir === DIRECTION.MIXED;
		}
	};

	/**
	 * Represents a graph node
	 * @class sg.Node
	 * @constructor
	 * @param {String} id Node's identificator.
	 *                    Two nodes in a graph cannot have the same id.
	 *                    ***Must not be empty string***
	 * @param {Object} [options] Optional data object the user can store in the node.
	 * @example
	 *     var a = new Node("Example");
	 *     var b = new Node("Data", { index: 10 });
	 */
	function Node(id, options) {
		if (typeof id !== "string" || id === "") {
			throw "Invalid value for id.";
		}

		if (options && !util.isObject(options)) {
			throw "The options param should be object.";
		}

		/**
		 * The node identifier
		 * @private
		 * @property _id
		 */
		this._id       = id;
		
		/**
		 * The graph of which the node is a member or undefined
		 * @private
		 * @property _graph
		 * @type {sg.Graph|undefined}
		 * @default undefined
		 */
		this._graph   = undefined;
		
		/**
		 * The edges connected to this node
		 * @property edges
		 * @type buckets.Set of _EdgeConnection
		 * @readOnly
		 */
		this.edges = new buckets.MultiBag(function(e) {
			return e.node._id;
		}, function(e) {
			return e.edge._guid;
		});

		/**
		 * Custom object for storing arbitrary data
		 * @property options
		 * @type Object
		 * @defaut {}
		 */
		this.options  = options || {};
	}

	/**
	 * @private
	 * @method _addEdge
	 * @param {sg.Edge|_EdgeConnection} edge
	 */
	Node.prototype._addEdge = function(edge) {
		if (!(edge instanceof Edge) && !(edge instanceof _EdgeConnection)) {
			throw "edge should be sg.Edge or _EdgeConnection.";
		}

		if (edge instanceof Edge) {
			if (edge._sourceNode === this) {
				this.edges.add(edge._sourceConnection);
			}

			if (edge._targetNode === this) {
				this.edges.add(edge._targetConnection);
			}
		}

		if (edge instanceof _EdgeConnection) {
			this.edges.add(edge);
		}
	};

	/**
	 * @private
	 * @method _removeEdge
	 * @param {sg.Edge|_EdgeConnection} edge
	 */
	Node.prototype._removeEdge = function(edge) {
		if (!(edge instanceof Edge) && !(edge instanceof _EdgeConnection)) {
			throw "edge should be sg.Edge or _EdgeConnection.";
		}

		if (edge instanceof Edge) {
			// remove both, because it can be a self-loop, and no error if not
			this.edges.remove(edge._sourceConnection);
			this.edges.remove(edge._targetConnection);
		}

		if (edge instanceof _EdgeConnection) {
			this.edges.remove(edge);
		}
	};

	/**
	 * @method addToGraph
	 * @param {sg.Graph} graph
	 */
	Node.prototype.addToGraph = function(g) {
		if (this._graph !== undefined) {
			throw "This node is already in a graph.";
		}

		if (!(g instanceof Graph)) {
			throw "The passed parameter is not a sg.Graph.";
		}

		g.addNode(this);
	};

	/**
	 * @method removeFromGraph
	 */
	Node.prototype.removeFromGraph = function() {
		if (this._graph === undefined) {
			throw "The node is not in a graph.";
		}

		this._graph.removeNode(this);
	};

	/**
	 * @method connect
	 * @param {sg.Node|String} node
	 * @param {Object} [options]
	 */
	Node.prototype.connect = function(node, options) {
		if (this._graph === undefined) {
			throw "The node is not in a graph.";
		}

		this._graph.connect(this, node, options);
	};

	/**
	 * @method detach
	 * @param {sg.Node|String} node
	 */
	Node.prototype.detach = function(node) {
		if (this._graph === undefined) {
			throw "The node is not in a graph.";
		}

		this._graph.detach(this, node);
	};

	/**
	 * Getter for the node's id
	 * @method getId
	 * @return {String} the node's id
	 */
	Node.prototype.getId = function() {
		return this._id;
	};

	/**
	 * @method getEdges
	 * @return {Array}
	 */
	Node.prototype.getEdges = function() {
		return this.edges.toArray();
	};

	/**
	 * Represents a graph edge (e.g. connection of 2 nodes in a graph). ***Do not instanciate directly.***
	 * @class sg.Edge
	 * @constructor
	 * @param {sg.Node} source Source node
	 * @param {sg.Node} target Target node
	 * @param {Object} [options] Optional data object the user can store in the edge
	 *                           (can be accessed via the sg.Edge.options property).
	 *                           The options object may have the following properties
	 *                           (and/or any of your own):
	 *        @param {Boolean} [options.directed=false] If true, the edge is directed source->target.
	 *                                                  If false, the edge has no direction
	 */
	function Edge(a, b, options) {
		if (!(a instanceof Node) || !(b instanceof Node)) {
			throw "Params are not of type sg.Node.";
		}

		if (options && !util.isObject(options)) {
			throw "The options param should be object.";
		}

		if (options && options.directed && typeof options.directed !== "boolean") {
			throw "options.directed must be a boolean.";
		}

		/**
		 * Custom object for storing arbitrary data
		 * @property options
		 * @type Object
		 * @default {}
		 */
		this.options = options || {};

		/**
		 * Edge's global unique identifier
		 * @private
		 * @property _guid
		 */
		this._guid   = util.guid();

		/**
		 * @private
		 * @property _key
		 */
		this._key    = a._id + b._id;
		
		/**
		 * If true, the edge is directed source->target. If false, the edge has no direction
		 * @private
		 * @property _directed
		 * @type Boolean
		 * @default false
		 */
		this._directed = options && options.directed ? options.directed : false;

		/**
		 * The first end of the edge
		 * @private
		 * @property sourceNode
		 * @type sg.Node
		 */
		this._sourceNode = a;
		
		/**
		 * The second end of the edge
		 * @private
		 * @property targetNode
		 * @type sg.Node
		 */
		this._targetNode = b;
		
		/**
		 * @private
		 * @property _sourceConnection
		 * @type _EdgeConnection
		 */
		this._sourceConnection = new _EdgeConnection(this, this._targetNode, this.options);

		/**
		 * @private
		 * @property _targetConnection
		 * @type _EdgeConnection
		 */
		this._targetConnection = new _EdgeConnection(this, this._sourceNode, this.options);

		/**
		 * The graph of which the edge is a member or undefined
		 * @private
		 * @property _graph
		 * @type {sg.Graph|undefined}
		 * @default undefined
		 */
		this._graph   = undefined;
	}

	/**
	 * Getter for the source node
	 * @method getSource
	 * @return {sg.Node} the source node of the edge
	 */
	Edge.prototype.getSource = function() {
		return this._sourceNode;
	};

	/**
	 * Getter for the target node
	 * @method getTarget
	 * @return {sg.Node} the target node of the edge
	 */
	Edge.prototype.getTarget = function() {
		return this._targetNode;
	};

	Edge.prototype.removeFromGraph = function() {
		if (this._graph === undefined) {
			throw "The edge is not in a graph.";
		}

		this._graph._removeEdge(this);
	};

	Edge.prototype.directed = function(d) {
		if (d !== undefined) {
			if (typeof d !== "boolean") {
				throw "directed should be boolean.";
			}

			if (this._graph._direction !== DIRECTION.MIXED) {
				throw "the graph direction should be mixed.";
			}

			this._directed = d;
			return this;
		}

		return this._directed;
	};

	/**
	 * Represents a one-way edge. Private class. Do not instanciate directly.
	 * @class _EdgeConnection
	 * @constructor
	 * @param {sg.Edge} edge
	 * @param {sg.Node} node
	 * @param {Object} [options]
	 */
	function _EdgeConnection(edge, node, options) {
		/*jshint validthis:true */
		if (!(edge instanceof Edge)) {
			throw "The edge param should be sg.Edge.";
		}

		if (!(node instanceof Node)) {
			throw "The node param should be sg.Node.";
		}

		if (options && !util.isObject(options)) {
			throw "The options param should be object.";
		}

		/**
		 * @property edge
		 * @type {sg.Edge}
		 * @readOnly
		 */
		this.edge = edge;
		
		/**
		 * @property node
		 * @type {sg.Node}
		 * @readOnly
		 */
		this.node = node;

		/**
		 * @property options
		 * @type {Object|undefined}
		 * @default undefined
		 */
		this.options = options;
	}

	/**
	 * Represents a graph
	 * @class sg.Graph
	 * @constructor
	 * @param {Object} [options] Optional data object the user can store in the graph.
	 *      @param {sg.DIRECTION} [options.direction] the direction of the graph
	 *      @param {Boolean} [options.override=false]
	 *      @param {Boolean} [options.multigraph=false]
	 *      @param {Boolean} [options.selfloops=false]
	 */
	function Graph(options) {
		if (options && !util.isObject(options)) {
			throw "The options param should be object.";
		}

		if (options && options.direction && !DIRECTION.isDirection(options.direction)) {
			throw "Unknown direction.";
		}

		if (options && options.override && typeof options.override !== "boolean") {
			throw "override should be boolean.";
		}

		if (options && options.multigraph && typeof options.multigraph !== "boolean") {
			throw "multigraph should be boolean.";
		}

		if (options && options.selfloops && typeof options.selfloops !== "boolean") {
			throw "selfloops should be boolean";
		}

		/**
		 * The direction of the graph
		 * @private
		 * @property _direction
		 * @type sg.DIRECTION
		 * @default sg.DIRECTION.UNDIRECTED
		 */
		this._direction = options && options.direction ? options.direction : DIRECTION.UNDIRECTED;

		/**
		 * @private
		 * @property _multigraph
		 * @type Boolean
		 * @default false
		 */
		this._multigraph  = options && options.multigraph  ? options.multigraph  : false;

		/**
		 * @property override
		 * @type Boolean
		 * @default false
		 */
		this.override  = options && options.override  ? options.override  : false;

		/**
		 * @property selfloops
		 * @type Boolean
		 * @default false
		 */
		this.selfloops = options && options.selfloops  ? options.selfloops  : false;
		
		/**
		 * Custom object for storing arbitrary data
		 * @property options
		 * @type Object
		 * @default {}
		 */
		this.options = options || {};

		/**
		 * A dictionary containing the graph nodes
		 * @private
		 * @property nodes
		 * @type buckets.Dictionary
		 * @readOnly
		 */
		this.nodes = new buckets.Dictionary();

		/**
		 * A set containing the graph edges
		 * @private
		 * @property edges
		 * @type buckets.Set
		 * @readOnly
		 */
		this.edges = new buckets.MultiBag(function(e) {
			return e._key;
		}, function(e) {
			return e._guid;
		});
	}

	Graph.prototype._removeEdge = function(edge) {
		/*jshint expr:true */
		if (!(edge instanceof Edge) && !(edge instanceof _EdgeConnection)) {
			throw "edge sgould be sg.Edge or _EdgeConnection.";
		}

		edge = edge instanceof Edge ? edge : edge.edge;

		edge._sourceNode._removeEdge(edge);
		!edge._directed && edge._targetNode._removeEdge(edge);
		this.edges.remove(edge);
	};

	/**
	 * @method addNode
	 * @param {String|sg.Node} node
	 */
	Graph.prototype.addNode = function(node) {
		if ((typeof node !== "string" || node === "") && !(node instanceof Node)) {
			throw "Invalid node: " + node;
		}

		var id = node._id || node;
		if ( !this.override && this.nodes.get(id) !== undefined ) {
			throw "A node with id \"" + id + "\" already exists in this graph." +
				  "(Use the option override if needed)";
		}

		if ( node instanceof Node && node._graph !== undefined ) {
			throw "The node \"" + id + "\" is in another graph.";
		}

		node = node instanceof Node ? node : new Node(id);

		this.nodes.set(id, node);
		node._graph = this;
	};

	/**
	 * @method removeNode
	 * @param {String|sg.Node} node
	 */
	Graph.prototype.removeNode = function(node) {
		if ((typeof node !== "string" || node === "") && !(node instanceof Node)) {
			throw "Invalid node: " + node;
		}

		var id = node._id || node;
		if (this.nodes.get(id) === undefined ||
			(node instanceof Node && this.nodes.get(id) !== node)) {
			throw "The passed node is not in this graph.";
		}

		node = this.nodes.get(id);
		this.edges.forEach(function(edge) {
			var source = edge._sourceNode;
			var target = edge._targetNode;

			if (source === node || target === node) {
				if (source !== node) {
					source._removeEdge(edge);
				}

				if (target !== node) {
					target._removeEdge(edge);
				}

				this.edges.remove(edge);
			}
		}.bind(this));

		node._graph   = undefined;
		node.edges.clear();
		this.nodes.remove(id);
	};

	/**
	 * @method connect
	 * @param {sg.Node|String} a
	 * @param {sg.Node|String} b
	 * @param {Object} [options]
	 */
	Graph.prototype.connect = function(a, b, options) {
		/*jshint expr:true */
		var aId = a._id || a;
		var bId = b._id || b;
		if (this.nodes.get(aId) === undefined) {
			throw "Node \"" + aId + "\" isn't in the graph.";
		}

		if (this.nodes.get(bId) === undefined) {
			throw "Node \"" + bId + "\" isn't in the graph.";
		}

		if (!this._multigraph && 
			(util.multiBagContains(this.edges, aId + bId) ||
			 util.multiBagContainsUndirectedEdge(this.edges, bId + aId))
			) {
			throw "Edge between " + aId + " and " + bId + " already exists.";
		}

		if (!this.selfloops && aId === bId) {
			throw "Slefloops are not allowed.";
		}

		if (options && !util.isObject(options)) {
			throw "Options must be an object.";
		}

		var source = this.nodes.get(aId);
		var target = this.nodes.get(bId);

		options = options || {};
		if (this._direction === DIRECTION.UNDIRECTED) {
			options.directed = false;
		} else if (this._direction === DIRECTION.DIRECTED) {
			options.directed = true;
		}

		var edge = new Edge(source, target, options);
		edge._graph = this;
		source._addEdge(edge._sourceConnection);
		!options.directed && source !== target && target._addEdge(edge._targetConnection);
		this.edges.add(edge);
	};

	/**
	 * @method detach
	 * @param {sg.Node|String} a
	 * @param {sg.Node|String} b
	 */
	Graph.prototype.detach = function(a, b) {
		var aId = a._id || a;
		var bId = b._id || b;
		if (this.nodes.get(aId) === undefined) {
			throw "Node \"" + aId + "\" isn't in the graph.";
		}

		if (this.nodes.get(bId) === undefined) {
			throw "Node \"" + bId + "\" isn't in the graph.";
		}

		if (util.multiBagRemove(this.edges, aId + bId) ||
			util.multiBagRemove(this.edges, bId + aId)) {
			util.multiBagRemove(this.nodes.get(aId).edges, bId);
			util.multiBagRemove(this.nodes.get(bId).edges, aId);
		}
	};

	Graph.prototype.getNode = function(id) {
		return this.nodes.get(id);
	};

	Graph.prototype.direction = function(direction) {
		if (direction !== undefined) {
			if (!DIRECTION.isDirection(direction)) {
				throw "Unknown direction.";
			}

			if (direction === this._direction) {
				return this;
			}

			if (direction === DIRECTION.UNDIRECTED ||
				direction === DIRECTION.DIRECTED) {
				var directed = direction === DIRECTION.DIRECTED;
				this.edges.forEach(function(edge) {
					if (edge._directed !== directed) {
						if (edge._directed === true) {
							edge._targetNode._addEdge( edge._targetConnection );
						} else {
							edge._targetNode._removeEdge( edge._targetConnection );
						}

						edge._directed = directed;
					}
				});
			}

			this._direction = direction;
			return this;
		}
		return this._direction;
	};

	Graph.prototype.multigraph = function(multigraph) {
		if (multigraph !== undefined) {
			if (typeof multigraph !== "boolean") {
				throw "multigraph should be boolean.";
			}

			if (multigraph === this._multigraph) {
				return this;
			}

			if (this._multigraph === true) {
				this.edges.normalize();
			}
			
			this._multigraph = multigraph;
			return this;
		}
		return this._multigraph;
	};

	Graph.prototype.override = function(override) {
		if (override !== undefined) {
			if (typeof override !== "boolean") {
				throw "override should be boolean.";
			}

			this.override = override;
			return this;
		}
		return this.override;
	};

	Graph.prototype.selfloops = function(selfloops) {
		if (selfloops !== undefined) {
			if (typeof selfloops !== "boolean") {
				throw "selfloops should be boolean.";
			}

			this.selfloops = selfloops;
			return this;
		}
		return this.selfloops;
	};

	function AbstractRenderer(graph) {
		this.refresh = function() { throw "Unimplemented method."; };
		this.draw    = function() { throw "Unimplemented method."; };
	}

	function ConsoleRenderer(g) {
		if (!(g instanceof sg.Graph)) {
			throw "I don't know how to render " + g;
		}

		var graph    = g;
		this.refresh = function() { return; };
		this.draw    = function() {
			graph.nodes.forEach(function(key, node) {
				var line = [key, ": "];
				var edges = node.getEdges();
				edges.forEach(function(edge) {
					line.push(edge.node.getId());
					line.push(",");
				});
				line.pop();
				console.log(line.join(""));
			});
		};
	}

	ConsoleRenderer.prototype = new AbstractRenderer();

	/**
	 * Simple Graph - a library for representing graphs
	 * @module sg
	 * @requires Buckets
	 */
	var sg = {
		DIRECTION: DIRECTION,
		Node: Node,
		Edge: Edge,
		Graph: Graph,

		Renderer: {
			AbstractRenderer: AbstractRenderer,
			ConsoleRenderer : ConsoleRenderer
		}
	};
	
	if (typeof module !== "undefined") { module.exports = sg; }
	else if (typeof window !== "undefined") { window.sg = window.sg || sg; }
}());
