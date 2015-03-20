/* global module:true */
/* global require:true */
var gulp = require('gulp');
var zip = require('gulp-zip');
var clean = require('gulp-clean');

gulp.task('default', function () {
  return gulp.src(['*', '!node_modules', '!output'])
    .pipe(zip('gitlab-merge-requests-extension.zip'))
    .pipe(gulp.dest('output'));
});

gulp.task('clean', function() {
  return gulp.src("output", {read: false})
    .pipe(clean());
});
