
"use strict"
module.exports = (grunt) ->
	
	# Project configuration.
	# update all file paths to your project

	grunt.initConfig
		# Watch
		watch:
			coffeesrc:
				files: ["static/src/coffee/**/*.coffee"] # scans directory and all subdirectories for coffee files
				tasks: ["coffee"]


			sassrc:
				files: ["static/src/sass/**/*.scss"] # scans directory and all subdirectories for scss files
				tasks: ["compass"]

		exec:
			start_mongo:
				cmd: "mongod"

			move_up:
				cmd: "cd ../"

			start_virt_env:
				cmd: "source ./changebyus3/bin/activate"

			start_server:
				cmd: "python wsgi.py"

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
	grunt.loadNpmTasks "grunt-contrib-compass"
	grunt.loadNpmTasks "grunt-contrib-sass"
	grunt.loadNpmTasks "grunt-contrib-requirejs"
	grunt.loadNpmTasks "grunt-exec"

	# By default, run watch.
	grunt.registerTask "default", ["watch"]
	grunt.registerTask "mongo", ["exec:start_mongo"]
	grunt.registerTask "server", ["exec:move_up","exec:start_virt_env","exec:start_server"]