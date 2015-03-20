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
        "dest": "dist/<%= pkg.name %>-<%= manifest.version %>.crx",
        "zipDest": "dist//<%= pkg.name %>-<%= manifest.version %>.zip",
        "privateKey": "../gitlab-merge-requests.pem",
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
        tasks: ['crx', 'open']
      }
    }
  });

  grunt.registerTask('default', ['crx']);
};
