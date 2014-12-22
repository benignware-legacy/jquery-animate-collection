module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'), 
    clean: {
      tmp: ["tmp"], 
      dist: ["dist"],
      pdf: ["pdf"]
    }, 
    wrap: {
      css_matrix: {
        src: ['vendor/components/arian-css-matrix/CSSMatrix.js'],
        dest: 'tmp/CSSMatrix.js' ,
        options: {
          wrapper: ["var CSSMatrix = (function() { if (typeof CSSMatrix == 'undefined') { \nvar module = {};\n (function (module) {\n", "\n})(module); \n return module.exports; }\n})();"]
        }
      }, 
      build: {
        src: ['tmp/<%= pkg.pluginName %>.js'],
        dest: 'tmp/<%= pkg.pluginName %>.js', 
        options: {
          wrapper: ["(function($, window) {\n", "\n})(jQuery, window);\n"]
        }
      }
    },
    concat: {
      options: {
        stripBanners: false,
        banner: '/*!\n' + 
          ' * <%= pkg.pluginName %> - v<%= pkg.version %> - \n' + 
          ' * build: <%= grunt.template.today("yyyy-mm-dd") %>\n' + 
          ' */\n\n',
      },
      dist: {
        src: [
          'tmp/CSSMatrix.js', 
          'src/<%= pkg.pluginName %>.js', 
          'src/<%= pkg.pluginName %>-blocks.js', 
          'src/<%= pkg.pluginName %>-itemopts.js'
        ],
        dest: 'tmp/<%= pkg.pluginName %>.js',
      },
    }, 
    // Lint definitions
    jshint: {
      all: ["src/**.js"],
      options: {
        jshintrc: ".jshintrc"
      }
    },
    uglify: {
      options: {
        stripBanners: false
      },
      dist: {
        files: {
          'tmp/<%= pkg.pluginName %>.min.js': [ 'src/<%= pkg.pluginName %>.js']
        }
      }
    }, 
    copy: {
      build: {
        expand: true,
        cwd: 'tmp',
        src: ['<%= pkg.pluginName %>.min.js', '<%= pkg.pluginName %>.js'], 
        dest: 'dist',
        flatten: true,
        filter: 'isFile'
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-wrap');

  grunt.registerTask('default', ['clean:dist', 'wrap:css_matrix', 'jshint', 'concat', 'wrap:build', 'uglify', 'copy', 'clean:tmp']);
  grunt.registerTask('pdf', ['clean:pdf', 'markdownpdf']);
  
};