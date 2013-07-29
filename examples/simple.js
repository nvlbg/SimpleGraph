if (typeof require !== "undefined") {
	var sg = require("../src/simple-graph.js");
	var buckets = require("../lib/buckets-minified.js");
}

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

var renderer = new sg.Renderer.ConsoleRenderer(g);
renderer.draw();
