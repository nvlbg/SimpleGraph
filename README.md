Simple Graph
============

Simple Graph (sg) is a javascript library for representing graphs. You can use it not only in the browser, but in NodeJS as well. It depends on [Buckets](https://github.com/mauriciosantos/buckets).

Installing dependencies
-----------------------

With node.js and npm installed in your system:

`$ npm install`

Building with Grunt
-------------------

First, make sure you installed the dependencies. You'll need to have grunt-cli installed. For more information visit [gruntjs homepage](http://gruntjs.com/) or [gruntjs repository](https://github.com/gruntjs/grunt/). It's a common practice to installed it globally, so if you don't have it:

`$ npm install -g grunt-cli`

### Building the library

`$ grunt`

This will jslint the library, run unit tests, and finally, minify it. It will notify you if something wrong happens. Otherwise, you will find the minified code in the *build/* folder.

### Building the documentation

`$ grunt doc`

or:

`$ grunt docs`

You will find the generated documentation in the *docs/* folder.

### Running the tests

To run ***only*** the unit tests:

`$ grunt test`

### Running JSLint

To ***only*** lint the code:

`$ grunt lint`

or

`$ grunt hint`

TODO
----

Here are some things that you may contribute:

- [ ] Add more unit tests
- [ ] Add more documentation strings
- [ ] Add comments where code gets nasty
- [ ] Graph visualization renderer
