module.exports = function(grunt) {
  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      js: {
        files: ['assets/**/*.js', 'app/**/*.js'],
        tasks: ['jshint', 'uglify', 'sloc'],
        options: {
          livereload: true,
        },
      },
      html: {
        files: ['public/views/**', 'assets/index.html'],
        tasks: ['htmlmin'],
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
    sloc: {
      options: {
        reportType: 'json',
        reportPath: 'sloc.json',
      },
      'my-source-files': {
      files: {
        '.': [ 'app/**/*.js', 'assets/ngapp/**.js', 'config/**/*.js' ]
      },
      }
    },
    uglify: {
      options: {
        mangle: false,
        beautify: true,
        compress: false
      },
      my_target: {
        files: {
          'public/comp/custom.min.js': [
            'assets/lib/cm_mode*',
            'assets/lib/cm_addon*',
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
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {                                   
          'public/index.html': 'assets/index.html' // 'destination': 'source'
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
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-sloc');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');

  //Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  //Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify', 'sass', 'cssmin', 'htmlmin', 'sloc', 'concurrent']);
};
