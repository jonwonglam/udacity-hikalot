/* File: gulpfile.js */

// grab our gulp packages
var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    cleanCSS = require('gulp-clean-css'),
    sass = require('gulp-sass');
    htmlmin = require('gulp-htmlmin'),
    uglify = require('gulp-uglify'),
    pump = require('pump');

gulp.task('default', ['min-sass', 'min-css', 'min-html', 'min-js', 'watch']);

gulp.task('min-css', function() {
  return gulp.src('src/css/*.css')
    .pipe(cleanCSS({compatibility: '*'}))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('min-sass', function() {
  return gulp.src('src/css/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS({compatibility: '*'}))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('min-html', function() {
  return gulp.src('src/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('min-js', function(cb) {
  pump([
      gulp.src('src/js/*.js'),
      uglify(),
      gulp.dest('dist/js')
    ],
    cb
  );
});

gulp.task('watch', function() {
  gulp.watch('src/css/*.css', ['min-css']);
  gulp.watch('src/js/*.js', ['min-js']);
  gulp.watch('src/*.html', ['min-html']);
});
