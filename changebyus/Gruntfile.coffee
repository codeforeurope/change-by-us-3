
"use strict"
module.exports = (grunt) ->
	
	# Project configuration.
	# update all file paths to your project

	grunt.initConfig
		pkg: grunt.file.readJSON('package.json')

		# Watch
		watch:
			coffeesrc:
				files: ["static/src/coffee/**/*.coffee"] # scans directory and all subdirectories for coffee files
				tasks: ["coffee"]

			sassrc:
				files: ["static/src/sass/**/*.scss"] # scans directory and all subdirectories for scss files
				tasks: ["compass"]

		docco: 
			document: 
				src: ["static/src/coffee/**/*.coffee"]
				options: 
					output: 'docs/'

		coffee:
			compile:  
				options:
					bare: true
				expand: true
				flatten: false # maintain the relative paths
				cwd: "static/src/coffee/" # cwd is current working directory
				src: ["**/*.coffee"]
				dest: "static/js"
				ext: ".js"

		uglify:
			my_target:
				files: [{
					expand: true,
					cwd: 'static/js',
					src: ['main.js','collection/*.js','views/*.js','model/*.js'],
					dest: "static/js"
				}]

		scsslint:
			allFiles:["static/src/sass/*.scss"]
			options: 
				config: '.scss-lint.yml'
				reporterOutput: 'output/scss-lint-report.xml'

		coffeelint: 
			app: ["static/src/coffee/**/*.coffee"]
			options:
				no_trailing_whitespace:
					level: 'ignore'
				indentation:
					level: 'ignore'
				max_line_length:
					level: 'ignore'
				no_unnecessary_fat_arrows:
					level: 'ignore'

		compass:
			dev:  
				options:
					config:'static/src/sass/config.rb' # paths in config.rg should be relative to the Gruntfile
					#sourcemap:true 

		requirejs:
			production:
				options: 
					name: "main"
					baseUrl: "static/js/"
					mainConfigFile: "static/js/main.js"
					out: "static/js/main.min.js"

	# These plugins provide necessary tasks.
	grunt.loadNpmTasks "grunt-contrib-watch"
	grunt.loadNpmTasks "grunt-contrib-clean"
	grunt.loadNpmTasks "grunt-contrib-coffee"
	grunt.loadNpmTasks "grunt-contrib-uglify"
	grunt.loadNpmTasks "grunt-contrib-compass"
	grunt.loadNpmTasks "grunt-contrib-sass"
	grunt.loadNpmTasks "grunt-contrib-requirejs"
	grunt.loadNpmTasks "grunt-contrib-csslint"
	grunt.loadNpmTasks "grunt-scss-lint"
	grunt.loadNpmTasks "grunt-exec"
	grunt.loadNpmTasks "grunt-docco" 


	# By default, run watch.
	grunt.registerTask "default", ["watch"]
	grunt.registerTask "build", ["docco"]