/* File: gulpfile.js */

// grab our gulp packages
var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    cleanCSS = require('gulp-clean-css'),
    htmlmin = require('gulp-htmlmin'),
    uglify = require('gulp-uglify'),
    pump = require('pump');

gulp.task('default', ['min-css', 'min-html', 'min-images', 'min-js', 'watch']);

gulp.task('min-css', function() {
  return gulp.src('app/*.css')
    .pipe(cleanCSS({compatibility: '*'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('min-html', function() {
  return gulp.src('app/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('min-js', function(cb) {
  pump([
      gulp.src('app/*.js'),
      uglify(),
      gulp.dest('dist')
    ],
    cb
  );
});

gulp.task('watch', function() {
  gulp.watch('app/*.css', ['min-css']);
  gulp.watch('app/*.html', ['min-html']);
});
