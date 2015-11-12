var gulp = require('gulp');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var exec = require('child_process').exec;
var opn = require('opn');

var DEVELOPMENT_FILES = ['client/app/**/*.js', '!client/app/assets/js/*.js', '!client/app/bower_components/**/*.js', '!client/app/dist/**/*.js', '!client/app/components/**/*.js'];

var SASS_FILES = ['client/app/assets/scss/*.scss'];

gulp.task('build', function(cb) {
  runSequence('lint', 'concat', 'compress', 'sass', cb);
});

gulp.task('build:js', function(cb) {
  runSequence('lint', 'concat', 'compress', cb);
});

gulp.task('watch', function() {
  gulp.watch(DEVELOPMENT_FILES, ['build:js']);
  gulp.watch(SASS_FILES, ['sass']);
});

gulp.task('start', ['build'], function () {
  exec('node server/server.js');
  opn('http://localhost:3000');
});

gulp.task('concat', function() {
  return gulp.src(DEVELOPMENT_FILES)
    .pipe(concat('app.js'))
    .pipe(gulp.dest('client/app/dist/js'));
});

gulp.task('lint', function() {
  return gulp.src(DEVELOPMENT_FILES)
    .pipe(jshint('.jshintrc'))
    // .pipe(jshint.reporter('jshint-stylish'))
    // .pipe(jshint.reporter('fail'));
});

gulp.task('sass', function() {
  return gulp.src(SASS_FILES)
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(gulp.dest('client/app/dist/css'));
});
 
gulp.task('compress', function() {
  return gulp.src('client/app/dist/js/app.concat.js')
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('client/app/dist/js'));
});
