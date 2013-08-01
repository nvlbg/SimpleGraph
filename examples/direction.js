if (typeof require !== "undefined") {
	var sg = require("../src/simple-graph.js");
	var buckets = require("../lib/buckets.js");
}

var g = new sg.Graph({ direction: sg.DIRECTION.DIRECTED });
var renderer = new sg.Renderer.ConsoleRenderer(g);

g.addNode("A");
g.addNode("B");
g.addNode("C");
g.addNode("D");

g.connect("A", "B");

console.log(g.getNode("A").getEdges()[0].node === g.getNode("B"));
console.log(g.getNode("B").edges.size());

g.connect("B", "C");
g.connect("C", "D");
g.connect("D", "A");

// -->(A) -> (B) -> (C) -> (D)
// |                        | 
// --------------------------
console.log("\n-------------"); 
renderer.draw();
console.log("-------------\n");

console.log(g.direction() === sg.DIRECTION.DIRECTED);
g.direction(sg.DIRECTION.UNDIRECTED);
console.log(g.direction() === sg.DIRECTION.DIRECTED);

// (A) -- (B) -- (C) -- (D)
//  |                    |   
//  ----------------------
console.log("\n-------------"); 
renderer.draw();
console.log("-------------\n");

g.direction(sg.DIRECTION.MIXED);

// (A) -- (B) -- (C) -- (D)
//  |                    |   
//  ----------------------
console.log("\n-------------"); 
renderer.draw();
console.log("-------------\n");

g.addNode("E");
g.connect("D", "E", { directed: true });

// (A) -- (B) -- (C) -- (D) -> (E)
//  |                    |   
//  ----------------------
console.log("\n-------------"); 
renderer.draw();
console.log("-------------\n");
