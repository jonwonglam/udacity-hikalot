/* File: gulpfile.js */

// grab our gulp packages
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    cleanCSS = require('gulp-clean-css'),
    sass = require('gulp-sass'),
    htmlmin = require('gulp-htmlmin'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

    gulp.task('default', ['min-sass', 'min-css', 'min-html', 'min-js', 'watch']);

// min-css will concatinate all the css files in src/css, clean it,
// and minify it, renamed to styles.min.css. This is to reduce the number
// of requests the browser has to make.
gulp.task('min-css', function() {
    return gulp.src('src/css/*.css')
        .pipe(concat('styles.css'))
        .pipe(gulp.dest('dist/css'))
        .pipe(rename('styles.min.css'))
        .pipe(cleanCSS({
            compatibility: '*'
        }))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('min-sass', function() {
    return gulp.src('src/css/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS({
            compatibility: '*'
        }))
        .pipe(gulp.dest('src/css'));
});

gulp.task('min-html', function() {
    return gulp.src('src/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('min-js', function() {
    return gulp.src('src/js/*js')
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('watch', function() {
    gulp.watch('src/css/*.scss', ['min-sass']);
    gulp.watch('src/css/*.css', ['min-css']);
    gulp.watch('src/js/*.js', ['min-js']);
    gulp.watch('src/*.html', ['min-html']);
});
