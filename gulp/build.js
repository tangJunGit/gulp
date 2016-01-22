var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    $ = require('gulp-load-plugins')();

gulp.task("images", function () {
    return gulp.src("app/images/*",{base:"images"})
        .pipe($.cache($.imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true,
            multipass: true
        })))
        .pipe(gulp.dest('images'));
});
gulp.task('js',function(){
    return gulp.src(['app/scripts/**/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter("default"))
        .pipe($.concat('main.js'))
        .pipe($.uglify())
        .pipe($.rename({suffix:'.min'}))
        .pipe(gulp.dest('app/js'));
});

gulp.task('less', function () {
    return gulp.src('app/less/**/*.less')
        .pipe($.less())
        .pipe($.autoprefixer({
            browsers: ['last 2 versions','last 2 Explorer versions','Firefox ESR'],
            cascade: true,
            remove:true 
        }))
        .pipe($.concat('main.css'))
        .pipe($.minifyCss())
        .pipe($.rename({suffix:'.min'}))
        .pipe(gulp.dest('app/css'));
});
gulp.task('clean', function () {
    return gulp.src(['.tmp', 'dist'], { read: false })
        .pipe($.clean());
});
gulp.task('build', ['clean'], function() {
    gulp.start('js','less','images');
});

gulp.task("watch", function () {
    gulp.watch('app/less/**/*.less',["less"]);
    gulp.watch(['app/scripts/**/*.js'],["js"]);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch("app/**/*.html",['less','images','js']).on("change",browserSync.reload);
});

//服务
gulp.task('server',['less','js','images'], function() {
    var files = [
        './app/**/*.html',
        './app/css/**/*.css',
        './app/images/**/*',
        './app/js/**/*.js'
    ];
    gulp.watch('app/less/**/*.less',["less"]);
    gulp.watch(['app/scripts/**/*.js'],["js"]);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch(files).on("change",browserSync.reload);

    browserSync.init(files,{
         proxy: "http://localhost:63342/template/app/"

    });

});

