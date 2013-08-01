if (typeof require !== "undefined") {
	var sg = require("../src/simple-graph.js");
	var buckets = require("../lib/buckets.js");
}

var g = new sg.Graph({ selfloops: true });

g.addNode("1");

g.connect("1", "1");

// (1) -\
//  |   |
//  \---/

new sg.Renderer.ConsoleRenderer(g).draw();
