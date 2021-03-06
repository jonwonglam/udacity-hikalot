/* File: gulpfile.js */

// grab our gulp packages
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    cleanCSS = require('gulp-clean-css'),
    sass = require('gulp-sass'),
    htmlmin = require('gulp-htmlmin'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    del = require('del');

    gulp.task('default', ['clean:dist', 'min-sass', 'min-css', 'min-html', 'move-js', 'watch']);
    gulp.task('production', ['clean:dist', 'min-sass', 'min-css', 'min-html', 'min-js', 'watch-production']);

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
        .pipe(gulp.dest('src/css'));
});

gulp.task('min-html', function() {
    return gulp.src('src/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('move-js', function() {
  return gulp.src('src/js/*.js')
        .pipe(gulp.dest('dist/js'));
});

gulp.task('min-js', function() {
    return gulp.src(['src/**/!(app)*.js', 'src/js/app.js'])
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify().on('error', gutil.log))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('clean:dist', function() {
    return del([
      'dist/js/**/*'
    ]);
});

gulp.task('watch', function() {
    gulp.watch('src/css/*.scss', ['min-sass']);
    gulp.watch('src/css/*.css', ['min-css']);
    gulp.watch('src/js/*.js', ['move-js']);
    gulp.watch('src/*.html', ['min-html']);
});

gulp.task('watch-production', function() {
    gulp.watch('src/css/*.scss', ['min-sass']);
    gulp.watch('src/css/*.css', ['min-css']);
    gulp.watch('src/js/*.js', ['min-js']);
    gulp.watch('src/*.html', ['min-html']);
});
