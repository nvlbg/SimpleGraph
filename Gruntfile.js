module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		meta: {
			banner: "/*!\n" +
					" * <%= pkg.name %>\n" +
					" *\n" +
					" * Description: <%= pkg.description %>\n" +
					" * Version    : <%= pkg.version %>\n" +
					" * Created    : <%= grunt.template.today(\"yyyy-mm-dd\") %>\n" +
					" * Source     : <%= pkg.homepage %>\n" +
					" * Author     : <%= pkg.author.name %> (<%= pkg.author.email %>)\n" + 
					" * Licensed   : <%= pkg.license %>\n" +
					" */\n",
		},

		clean: {
			build: ["build/**/*"],
			docs: ["docs/**/*"]
		},
		uglify: {
			options: {
				banner: "<%= meta.banner %>",
				report: "gzip"
			},
			sg: {
				files: {
					"build/sg.<%= pkg.version %>.min.js": ["src/simple-graph.js"]
				}
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: false,
				latedef: true,
				newcap: false,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true,
				node: true,
				smarttabs: true,
				expr: true,
				strict: true,
				validthis: true,
				globals: {
					buckets: true
				}
			},

			beforeUglify: {
				files: {
					src: ["src/simple-graph.js"]
				}
			}
		},
		yuidoc: {
			compile: {
				name: "<%= pkg.name %>",
				description: "<%= pkg.description %>",
				version: "<%= pkg.version %>",
				url: "<%= pkg.homepage %>",
				options: {
					paths: ["src"],
					outdir: "docs"
				}
			}
		},
		jasmine: {
			beforeUglify: {
				src: "src/simple-graph.js",
				options: {
					specs: "spec/*Spec.js",
					vendor: "lib/buckets-minified.js"
				}
			},
			afterUglify: {
				src: "build/sg.<%= pkg.version %>.min.js",
				options: {
					specs: "spec/*Spec.js",
					vendor: "lib/buckets-minified.js"
				}
			}
		}
	});

	// Load tasks
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-yuidoc");
	grunt.loadNpmTasks("grunt-contrib-jasmine");

	// Default task
	grunt.registerTask("default", ["clean:build",
								   "jshint:beforeUglify",
								   "jasmine:beforeUglify",
								   "uglify:sg",
								   "jasmine:afterUglify"]);

	grunt.registerTask("doc", ["clean:docs", "yuidoc"]);
	grunt.registerTask("docs", "doc");
	grunt.registerTask("test", "jasmine:beforeUglify");
	grunt.registerTask("lint", "jshint:beforeUglify");
	grunt.registerTask("hint", "jshint:beforeUglify")
};
