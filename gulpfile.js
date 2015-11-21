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
var notify = require("gulp-notify");
var plumber = require('gulp-plumber');
var mocha = require('gulp-mocha');

var TRAVIS = !!process.env.TRAVIS;

var DEVELOPMENT_FILES = ['client/app/**/*.js', '!client/app/assets/js/*.js', '!client/app/bower_components/**/*.js', '!client/app/dist/**/*.js', '!client/app/components/**/*.js'];
var SASS_FILES = ['client/app/assets/scss/**/*.scss'];
var TEST_FILES = ['test/*.js', '!test/databaseSpec.js'];

gulp.task('default', function(cb) {
  runSequence('build', 'test', cb);
});

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
  // Serve at this specific address for cookie saving
  opn('http://127.0.0.1:3000');
});

gulp.task('concat', function() {
  return gulp.src(DEVELOPMENT_FILES)
    .pipe(plumber({errorHandler: errorAlertConcat}))
    .pipe(concat('app.concat.js'))
    .pipe(gulp.dest('client/app/dist/js'));
});

gulp.task('lint', function() {
  return gulp.src(DEVELOPMENT_FILES)
    //.pipe(plumber())
    .pipe(plumber({errorHandler: errorAlertLint}))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('sass', function() {
  return gulp.src(SASS_FILES)
    .pipe(plumber({errorHandler: errorAlertSass}))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(gulp.dest('client/app/dist/css'));
});
 
gulp.task('compress', function() {
  return gulp.src('client/app/dist/js/app.concat.js')
    .pipe(plumber({errorHandler: errorAlertUgly}))
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('client/app/dist/js'));
});

gulp.task('test', function() {
  return gulp.src(TEST_FILES)
    .pipe(mocha());
});

// Error notification functions
function errorAlertLint(error){
  notify.onError({title: "Lint Error", message: "Check your terminal", sound: "Sosumi"})(error); //Error Notification
  console.log(error.toString());//Prints Error to Console
  this.emit("end"); //End function
};

function errorAlertSass(error){
  notify.onError({title: "Sass Error", message: "Check your terminal", sound: "Sosumi"})(error); //Error Notification
  console.log(error.toString());//Prints Error to Console
  this.emit("end"); //End function
};

function errorAlertConcat(error){
  notify.onError({title: "Concat Error", message: "Check your terminal", sound: "Sosumi"})(error); //Error Notification
  console.log(error.toString());//Prints Error to Console
  this.emit("end"); //End function
};

function errorAlertUgly(error){
  notify.onError({title: "Uglify Error", message: "Check your terminal", sound: "Sosumi"})(error); //Error Notification
  console.log(error.toString());//Prints Error to Console
  this.emit("end"); //End function
};
