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
     * Enumeration for the direction property of a graph.
     * 
     * @class sg.DIRECTION
     * @static
     * @final
     */
    var DIRECTION = {
        /**
         * Indicates that the graph is not directed
         * 
         * @property UNDIRECTED
         * @static
         * @final
         */
        UNDIRECTED: 0,

        /**
         * Indicates that the graph is directed
         * 
         * @property DIRECTED
         * @static
         * @final
         */
        DIRECTED: 1,

        /**
         * Indicates that the graph is mixed (e.g. some edges are directed, others not)
         * 
         * @property MIXED
         * @static
         * @final
         */
        MIXED: 2,

        /**
         * Checks if the passed parameter is a DIRECTION
         * 
         * @method isDirection
         * @static
         * @final
         * @param dir
         * @return {Boolean}
         * @example
         *     sg.DIRECTION.isDirection( sg.DIRECTION.DIRECTED ); // true
         *     sg.DIRECTION.isDirection( "mixed" ); // false
         *     sg.DIRECTION.isDirection( true ); // false
         */
        isDirection: function(dir) {
            return dir === DIRECTION.UNDIRECTED ||
                   dir === DIRECTION.DIRECTED ||
                   dir === DIRECTION.MIXED;
        }
    };

    /**
     * Represents a graph node.
     * 
     * @class sg.Node
     * @constructor
     * @param {String} id Node's identificator.
     *                    Two nodes in a graph cannot have the same id.
     *                    ***Must not be empty string***
     * @param {Object} [options] Optional data object the user can store in the node.
     * @example
     *     var a = new sg.Node("Example");
     *     var b = new sg.Node("Data", { index: 10 });
     *     var test = b.options.index < 100;
     */
    function Node(id, options) {
        if (typeof id !== "string" || id === "") {
            throw "Invalid value for id.";
        }

        if (options && !util.isObject(options)) {
            throw "The options param should be object.";
        }

        /**
         * The node's identifier
         * 
         * @private
         * @property _id
         * @type {String}
         */
        this._id       = id;
        
        /**
         * The graph of which the node is a member or undefined
         * 
         * @private
         * @property _graph
         * @type {sg.Graph|undefined}
         * @default undefined
         */
        this._graph   = undefined;
        
        /**
         * The edges connected to this node. ***Use only for reading!***
         * The purpose of this property is for fast reading. If you change
         * some elements you may brake something with the graph.
         * 
         * **See also**: {{#crossLink "sg.Node/getEdges"}}getEdges{{/crossLink}}
         * 
         * @property edges
         * @type buckets.MultiBag of EdgeConnection
         * @example
         *     var count = node.edges.size()
         *     node.edges.forEach(function(edge) {
         *         console.log( edge.options.value );
         *     });
         */
        this.edges = new buckets.MultiBag(function(e) {
            return e.node._id;
        }, function(e) {
            return e.edge._guid;
        });

        /**
         * Custom object for storing arbitrary data
         * 
         * @property options
         * @type Object
         * @defaut {}
         * @example
         *     node.options.label = "My node";
         *     console.log( node.options.label ); // "My node"
         */
        this.options  = options || {};
    }

    /**
     * Adds the appropriate EdgeConnection to Node.edges
     * 
     * @private
     * @method _addEdge
     * @param {Edge|EdgeConnection} edge
     */
    Node.prototype._addEdge = function(edge) {
        if (!(edge instanceof Edge) && !(edge instanceof EdgeConnection)) {
            throw "edge should be Edge or EdgeConnection.";
        }

        if (edge instanceof Edge) {
            if (edge._sourceNode === this) {
                this.edges.add(edge._sourceConnection);
            }

            if (edge._targetNode === this) {
                this.edges.add(edge._targetConnection);
            }
        }

        if (edge instanceof EdgeConnection) {
            this.edges.add(edge);
        }
    };

    /**
     * Removes the appropriate EdgeConnection from Node.edges
     * 
     * @private
     * @method _removeEdge
     * @param {Edge|EdgeConnection} edge
     */
    Node.prototype._removeEdge = function(edge) {
        if (!(edge instanceof Edge) && !(edge instanceof EdgeConnection)) {
            throw "edge should be Edge or EdgeConnection.";
        }

        if (edge instanceof Edge) {
            // remove both, because it can be a self-loop, and no error if not
            this.edges.remove(edge._sourceConnection);
            this.edges.remove(edge._targetConnection);
        }

        if (edge instanceof EdgeConnection) {
            this.edges.remove(edge);
        }
    };

    /**
     * Adds the node in the passed graph. Shortcut for 
     * *{{#crossLink "sg.Graph/addNode"}}sg.Graph.addNode{{/crossLink}}*
     * 
     * @method addToGraph
     * @param {sg.Graph} graph
     * @return {sg.Node} Reference to *this* node for method chaining
     * @chainable
     */
    Node.prototype.addToGraph = function(g) {
        if (this._graph !== undefined) {
            throw "This node is already in a graph.";
        }

        if (!(g instanceof Graph)) {
            throw "The passed parameter is not a sg.Graph.";
        }

        g.addNode(this);
        return this;
    };

    /**
     * Removes the node from the graph containing him. Shortcut for 
     * *{{#crossLink "sg.Graph/removeNode"}}sg.Graph.removeNode{{/crossLink}}*
     * 
     * @method removeFromGraph
     * @return {sg.Node} Reference to *this* node for method chaining
     * @chainable
     */
    Node.prototype.removeFromGraph = function() {
        if (this._graph === undefined) {
            throw "The node is not in a graph.";
        }

        this._graph.removeNode(this);
        return this;
    };

    /**
     * Connect this node with another one
     * 
     * @method connect
     * @param {sg.Node|String} node The node you want to connect to this node
     * @param {Object} [options] This object is passed to the Edge's constructor
     * @return {sg.Node} Reference to *this* node for method chaining
     * @chainable
     */
    Node.prototype.connect = function(node, options) {
        if (this._graph === undefined) {
            throw "The node is not in a graph.";
        }

        this._graph.connect(this, node, options);
        return this;
    };

    /**
     * Detach this node from another one
     * 
     * @method detach
     * @param {sg.Node|String} node The node you want to detach from this node
     * @return {sg.Node} Reference to *this* node for method chaining
     * @chainable
     */
    Node.prototype.detach = function(node) {
        if (this._graph === undefined) {
            throw "The node is not in a graph.";
        }

        this._graph.detach(this, node);
        return this;
    };

    /**
     * Getter for the node's identifier
     * 
     * @method getId
     * @return {String} The node's identifier
     */
    Node.prototype.getId = function() {
        return this._id;
    };

    /**
     * Get an array containing all edges connected with the node.
     * Adding/removing elements from the array won't affect the graph.
     * 
     * @method getEdges
     * @return {Array} Array of *EdgeConnection*s
     */
    Node.prototype.getEdges = function() {
        return this.edges.toArray();
    };

    /**
     * Private class. Represents an edge (e.g. connection between 2 nodes). 
     * 
     * ***This class shouldn't be instanciated!***
     * 
     * @class Edge
     * @constructor
     * @param {sg.Node} source Source node
     * @param {sg.Node} target Target node
     * @param {Object} [options] Optional data object the user can store in the edge.
     *                           The options object may have the following properties
     *                           (and/or any of your own):
     *     @param {Boolean} [options.directed=false] If true, the edge is directed source->target.
     *                                               If false, the edge has no direction.
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
         * 
         * @property options
         * @type Object
         * @default {}
         */
        this.options = options || {};

        /**
         * Edge's global unique identifier
         * 
         * @private
         * @property _guid
         */
        this._guid   = util.guid();

        /**
         * Key used for grouping edges between 2 nodes
         * 
         * @private
         * @property _key
         */
        this._key    = a._id + b._id;
        
        /**
         * If true, the edge is directed source->target. If false, the edge has no direction
         *
         * @private
         * @property _directed
         * @type Boolean
         * @default false
         */
        this._directed = options && options.directed ? options.directed : false;

        /**
         * The first end of the edge (e.g. the source node)
         * 
         * @private
         * @property _sourceNode
         * @type sg.Node
         */
        this._sourceNode = a;
        
        /**
         * The second end of the edge (e.g. the target node)
         * 
         * @private
         * @property _targetNode
         * @type sg.Node
         */
        this._targetNode = b;
        
        /**
         * The EdgeConnection that the source node need to have
         * 
         * @private
         * @property _sourceConnection
         * @type EdgeConnection
         */
        this._sourceConnection = new EdgeConnection(this, this._targetNode, this.options);

        /**
         * The EdgeConnection that the target node needs to have
         * 
         * @private
         * @property _targetConnection
         * @type EdgeConnection
         */
        this._targetConnection = new EdgeConnection(this, this._sourceNode, this.options);

        /**
         * The graph of which the edge is a member or undefined
         * 
         * @private
         * @property _graph
         * @type {sg.Graph|undefined}
         * @default undefined
         */
        this._graph   = undefined;
    }

    /**
     * Getter for the source node
     * 
     * @method getSource
     * @return {sg.Node} The source node of the edge
     */
    Edge.prototype.getSource = function() {
        return this._sourceNode;
    };

    /**
     * Getter for the target node
     * 
     * @method getTarget
     * @return {sg.Node} The target node of the edge
     */
    Edge.prototype.getTarget = function() {
        return this._targetNode;
    };

    /**
     * Removes the edge from the graph containing him
     * 
     * @chainable
     * @method removeFromGraph
     * @return {Edge} Reference to *this* edge for method chaining
     */
    Edge.prototype.removeFromGraph = function() {
        if (this._graph === undefined) {
            throw "The edge is not in a graph.";
        }

        this._graph._removeEdge(this);
        return this;
    };

    /**
     * Getter/setter for the edge's direction
     * 
     * @method directed
     * @param {Boolean} [direction] The new direction of the edge
     * @return {Boolean|Edge}
     *     If used as getter, returns whether or not the edge is directed.
     *     If used as setter, reference to *this* edge for method chaining.
     */
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
     * Private class. Represents a one-way edge,
     * so each node can store only what it needs.
     * Each edge has 2 EdgeConnections - one for each node.
     * 
     * ***This class shouldn't be instanciated!***
     * 
     * @class EdgeConnection
     * @constructor
     * @param {Edge} edge
     * @param {sg.Node} node
     * @param {Object} [options]
     */
    function EdgeConnection(edge, node, options) {
        /*jshint validthis:true */
        if (!(edge instanceof Edge)) {
            throw "The edge param should be Edge.";
        }

        if (!(node instanceof Node)) {
            throw "The node param should be sg.Node.";
        }

        if (options && !util.isObject(options)) {
            throw "The options param should be object.";
        }

        /**
         * Reference to the edge
         * 
         * @property edge
         * @type {Edge}
         */
        this.edge = edge;
        
        /**
         * Reference to one of the nodes in the edge
         * 
         * @property node
         * @type {sg.Node}
         */
        this.node = node;

        /**
         * Reference to the Edge's options
         * 
         * @property options
         * @type {Object}
         * @default {}
         */
        this.options = options || {};
    }

    /**
     * Represents a graph.
     * 
     * @class sg.Graph
     * @constructor
     * @param {Object} [options] Optional data object the user can store in the graph.
     *                           You can use this object for setting these properties:
     *      @param {sg.DIRECTION} [options.direction=sg.DIRECTION.UNDIRECTED]
     *                            The direction of the graph
     *      @param {Boolean} [options.override=false]
     *                       If true, adding a node with the same id as another one in the graph
     *                       will override the old one.
     *                       If false, an exception will be thrown.
     *      @param {Boolean} [options.multigraph=false] Indicates if the graph is a multigraph
     *      @param {Boolean} [options.selfloops=false] Indicates if selfloops are allowed
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
         * 
         * @private
         * @property _direction
         * @type sg.DIRECTION
         * @default sg.DIRECTION.UNDIRECTED
         */
        this._direction = options && options.direction ? options.direction : DIRECTION.UNDIRECTED;

        /**
         * Indicates if the graph is a multigraph
         * 
         * @private
         * @property _multigraph
         * @type Boolean
         * @default false
         */
        this._multigraph  = options && options.multigraph  ? options.multigraph  : false;

        /**
         * If true, adding a node with the same id as another one in the graph
         * will override the old one.
         * If false, an exception will be thrown.
         * 
         * @property override
         * @type Boolean
         * @default false
         */
        this.override  = options && options.override  ? options.override  : false;

        /**
         * Indicates if selfloops are allowed
         *             
         * @property selfloops
         * @type Boolean
         * @default false
         */
        this.selfloops = options && options.selfloops  ? options.selfloops  : false;
        
        /**
         * Custom object for storing arbitrary data
         * 
         * @property options
         * @type Object
         * @default {}
         */
        this.options = options || {};

        /**
         * A dictionary containing the graph nodes.
         * ***Use only for reading!***
         * The purpose of this property is for fast reading. If you change
         * some elements you may brake something with the graph.
         * 
         * @property nodes
         * @type buckets.Dictionary of String->sg.Node
         */
        this.nodes = new buckets.Dictionary();

        /**
         * The edges in the graph.
         * ***Use only for reading!***
         * The purpose of this property is for fast reading. If you change
         * some elements you may brake something with the graph.
         * 
         * @property edges
         * @type buckets.MultiBag of Edge
         */
        this.edges = new buckets.MultiBag(function(e) {
            return e._key;
        }, function(e) {
            return e._guid;
        });
    }

    /**
     * Removes edge from the graph
     *
     * @private
     * @method _removeEdge
     * @param  {Edge|EdgeConnection} edge
     */
    Graph.prototype._removeEdge = function(edge) {
        /*jshint expr:true */
        if (!(edge instanceof Edge) && !(edge instanceof EdgeConnection)) {
            throw "edge sgould be Edge or EdgeConnection.";
        }

        if (edge instanceof EdgeConnection) {
            edge = edge.edge;
        }

        edge._sourceNode._removeEdge(edge);
        !edge._directed && edge._targetNode._removeEdge(edge);
        this.edges.remove(edge);
    };

    /**
     * Add node to the graph
     * 
     * @method addNode
     * @param {String|sg.Node} node 
     *     If {String}, new sg.Node will be created with this string as its id, and will be added to the graph.
     *     If {sg.Node}, the node will be added to the graph.
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
     * Removes node from the graph
     * 
     * @method removeNode
     * @param {String|sg.Node} node 
     *     If {String}, the node with id the string will be removed from the graph.
     *     If {sg.Node}, the node will be removed from the graph.
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
     * Creates an edge between two nodes
     * 
     * @method connect
     * @param {sg.Node|String} source The source node (or its id)
     * @param {sg.Node|String} target The target node (or its id)
     * @param {Object} [options] Optional options object passed to the Edge's
     *                           constructor.
     *                           See *{{#crossLink "Edge"}}Edge{{/crossLink}}*
     *                           for more details.
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
     * Removes ***all*** edges between two nodes.
     * ***Be careful!*** This method does not differ directed edges, so calling this
     * method with the nodes (a, b) will remove all edges (b, a) as well.
     *
     * **See also**: *{{#crossLink "Edge/removeFromGraph"}}Edge.removeFromGraph{{/crossLink}}* 
     * 
     * @method detach
     * @param {sg.Node|String} source The source node (or its id)
     * @param {sg.Node|String} target The target node (or its id)
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

    /**
     * Get node by its id
     *
     * @method getNode
     * @param  {String} id The id of the wanted node
     * @return {sg.Node}   The node itself
     */
    Graph.prototype.getNode = function(id) {
        return this.nodes.get(id);
    };

    /**
     * Getter/setter for the graph's direction
     *
     * @method direction
     * @chainable
     * @param  {sg.DIRECTION} [direction] The new desired direction of the graph
     * @return {sg.Graph|sg.DIRECTION}
     *     If used as getter, will return the current graph's direction.
     *     If used as setter, will return reference to *this* graph for method chaining.
     */
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

    /**
     * Getter/setter for the graph's multigraph property
     *
     * @method multigraph
     * @chainable
     * @param  {Boolean} [multigraph] The new desired multigraph property
     * @return {sg.Graph|Boolean}
     *     If used as getter, will return the current multigraph property (e.g. Boolean).
     *     If used as setter, will return reference to *this* graph for method chaining.
     */
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

    /**
     * Getter/setter for the graph's override property
     *
     * @method override
     * @chainable
     * @param  {Boolean} [override] The new desired override property
     * @return {sg.Graph|Boolean}
     *     If used as getter, will return the current override property (e.g. Boolean).
     *     If used as setter, will return reference to *this* graph for method chaining.
     */
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

    /**
     * Getter/setter for the graph's selfloops property
     *
     * @method selfloops
     * @chainable
     * @param  {Boolean} [selfloops] The new desired selfloops property
     * @return {sg.Graph|Boolean}
     *     If used as getter, will return the current selfloops property (e.g. Boolean).
     *     If used as setter, will return reference to *this* graph for method chaining.
     */
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
     * Simple Graph - a library for manipulating graphs
     * 
     * @module sg
     * @requires Buckets
     */
    var sg = {
        DIRECTION: DIRECTION,
        Node: Node,
        Graph: Graph,

        Renderer: {
            AbstractRenderer: AbstractRenderer,
            ConsoleRenderer : ConsoleRenderer
        }
    };

    if (typeof JASMINE_TEST !== "undefined") {
        sg.Edge = Edge;
        sg.EdgeConnection = EdgeConnection;
    }
    
    if (typeof module !== "undefined") { module.exports = sg; }
    else if (typeof window !== "undefined") { window.sg = window.sg || sg; }
}());
