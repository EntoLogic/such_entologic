module.exports = function(grunt) {
  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      js: {
        files: ['assets/**/*.js', 'app/**/*.js'],
        tasks: ['jshint', 'uglify'],
        options: {
          livereload: true,
        },
      },
      html: {
        files: ['public/views/**', 'public/index.html'],
        options: {
          livereload: true,
        },
      },
      css: {
        files: ['assets/custom.scss'],
        tasks: ['sass', 'cssmin'],
        options: {
          livereload: true
        }
      }
    },
    sass: {
      dist: {
        files: {
          'public/comp/custom.css': 'assets/custom.scss'
        }
      }
    },
    jshint: {
      all: ['gruntfile.js', 'assets/ngapp/**/*.js', 'app/**/*.js']
    },
    // concat: {
    //   options: {
    //     separator: ';',
    //   },
    //   dist: {
    //     src: [
    //          ],
    //     dest: 'public/custom.js',
    //   }
    // },
    uglify: {
      options: {
        mangle: false
      },
      my_target: {
        files: {
          'public/comp/custom.min.js': [
            'assets/lib/cm_mode*',
            'assets/lib/ui-bootstrap-tpls-0.7.0.js',
            'assets/lib/extra.js',
            'assets/lib/ui-codemirror.js',
            'assets/ngapp/main.js',
            'assets/ngapp/services.js',
            'assets/ngapp/controllers.js',
            'assets/ngapp/directives.js'
          ]
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'public/comp/all.css': [
            "assets/csslib/*.css",
            "assets/csslib/cm_themes/*.css",
            "public/comp/custom.css"
          ]
        }
      }
    },
    nodemon: {
      dev: {
        options: {
          file: 'such.js',
          args: [],
          ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
          watchedExtensions: ['js'],
          watchedFolders: ['app', 'config'],
          debug: true,
          delayTime: 1,
          env: {
            PORT: 3000
          },
          cwd: __dirname
        }
      }
    },
    concurrent: {
      tasks: ['nodemon', 'watch'], 
      options: {
        logConcurrentOutput: true
      }
    }
  });

  //Load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');

  //Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  //Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify', 'sass', 'cssmin', 'concurrent']);
};
