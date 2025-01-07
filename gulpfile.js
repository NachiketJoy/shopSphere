const gulp = require('gulp');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const watch = require('gulp-watch');
const uglify = require('gulp-uglify');

// Task to merge and minify CSS files
gulp.task('styles', function () {
    return gulp.src([
        'node_modules/materialize-css/dist/css/materialize.css',
        'public/css/**/*.css'
    ])
        .pipe(concat('styles.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('public/dist/css'));
});

gulp.task('scripts', function () {
    return gulp.src('public/js/**/*.js')
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/dist/js'));
});

gulp.task('watch', function () {
    gulp.watch('public/css/**/*.css', gulp.series('styles'));
    gulp.watch('public/js/**/*.js', gulp.series('scripts'));
});

gulp.task('default', gulp.series('styles', 'scripts', 'watch'));