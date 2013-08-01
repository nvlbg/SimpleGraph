if (typeof require !== "undefined") {
	var sg = require("../src/simple-graph.js");
	var buckets = require("../lib/buckets.js");
}

var dfs = function(g, start, goal) {
	var fringe = new buckets.Stack();
	fringe.add( start );
	var closed = new buckets.Set(function(n) {
		return n.getId();
	});
	var output = [];
	var visited = 0;
	
	while(!fringe.isEmpty()) {
		var node = fringe.pop();
		visited += 1;
		if (!closed.contains(node)) {
			closed.add(node);
			output.push(node.getId());
			
			if (node === goal) {
				break;
			}

			var neighbours = node.getEdges();
			for(var i = 0; i < neighbours.length; i++) {
				fringe.push(neighbours[i].node);
			}
		}
	}
	console.log(output.join("->"), "visited:", visited);
};

var bfs = function(g, start, goal) {
	var fringe = new buckets.Queue();
	fringe.add( start );
	var closed = new buckets.Set(function(n) {
		return n.getId();
	});
	var output = [];
	var visited = 0;

	while(!fringe.isEmpty()) {
		var node = fringe.dequeue();
		visited += 1;
		
		if (!closed.contains(node)) {
			closed.add(node);
			output.push(node.getId());
			
			if (node === goal) {
				break;
			}

			var neighbours = node.getEdges();
			for(var i = 0; i < neighbours.length; i++) {
				fringe.enqueue(neighbours[i].node);
			}
		}
	}
	console.log(output.join("->"), "visited:", visited);
};

var g = new sg.Graph();

g.addNode("1");
g.addNode("2");
g.addNode("3");
g.addNode("4");
g.addNode("5");
g.addNode("6");

g.connect("1", "2");
g.connect("2", "3");
g.connect("4", "2");
g.connect("5", "6");
g.connect("3", "6");
g.connect("5", "4");

dfs(g, g.getNode("1"), g.getNode("6"));
bfs(g, g.getNode("1"), g.getNode("6"));
