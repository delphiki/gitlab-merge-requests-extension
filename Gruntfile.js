module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    manifest: grunt.file.readJSON('src/manifest.json'),
    crx: {
      gitlabMergeRequests: {
        "src": [
          "src/",
        ],
        "dest": "dist/",
        "zipDest": "dist/",
        "privateKey": "../gitlab-merge-requests.pem"
      }
    },
    copy: {
      front_images: {
        files: [
          {
            expand: true,
            cwd: 'bower_components/moment/min/',
            src: ['moment.min.js'],
            dest: 'src/vendor'
          },
        ]
      }
    },

    open: {
      dev: {
        url: 'http://reload.extensions'
      }
    },
    watch: {
      js: {
        files: ['src/*.js'],
        tasks: ['copy', 'crx', 'open']
      },
      html: {
        files: ['src/*.html'],
        tasks: ['copy', 'crx', 'open']
      }
    }
  });

  grunt.registerTask('default', ['copy', 'crx']);
};
