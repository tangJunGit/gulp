var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    $ = require('gulp-load-plugins')(),
    rev = require('gulp-rev'),

    // 配置参数
    config = {              
        dev: '.tmp',        // 开发文件夹名
        dest: 'dist',       // 打包文件夹名
        rev: 'rev',         // rev-manifest.json 文件夹名
        js: 'js',           // js 目录文件夹名
        css: 'css',         // css 目录文件夹名
        images: 'images',   // images 目录文件夹名
        rename: '.bundle'   // 重命名
    };


// ========================     脚本     ====================================

// dev
gulp.task('js', function(){
    return gulp.src('app/'+config.js+'/*.js')
        .pipe($.jshint())                                 // js 检查
        .pipe($.jshint.reporter("default"))
        .pipe($.concat('app.js'))                         // 合并
        .pipe($.rename({suffix: config.rename}))          // 重命名
        .pipe(gulp.dest(config.dev+'/'+config.js));       // 生成文件
});
// build
gulp.task('js:build', ['js'], function(){
    return gulp.src(config.dev+'/'+config.js+'/*.js')
        .pipe($.uglify())                                 // 压缩 js
        .pipe(rev())                                      // rev md5
        .pipe(gulp.dest(config.dest+'/'+config.js))       // 生成文件
        .pipe(rev.manifest())                             
        .pipe(gulp.dest(config.rev+'/'+config.js));       // 生成 rev-manifest.json 文件
});


// ========================     样式     ====================================

// dev
gulp.task('less', function () {
    return gulp.src('app/'+config.css+'/*.less')
        .pipe($.less())                                   // less
        .pipe($.autoprefixer({                            // autoprefixer
            browsers: ['last 2 versions','last 2 Explorer versions','Firefox ESR'],
            cascade: true,
            remove:true 
        }))
        .pipe($.concat('app.css'))                        // 合并
        .pipe($.rename({suffix: config.rename}))          // 重命名
        .pipe(gulp.dest(config.dev+'/'+config.css))
});
// build
gulp.task('less:build', ['less'], function () {
    return gulp.src(config.dev+'/'+config.css+'/*.css')
        .pipe($.minifyCss())                              // 压缩 css
        .pipe(rev())                                      // rev md5
        .pipe(gulp.dest(config.dest+'/'+config.css))
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.rev+'/'+config.css));
});



// ========================     样式     ====================================

// dev
gulp.task("images", function () {
    return gulp.src('app/'+config.images+'/**')
        .pipe($.cache($.imagemin({                        // 优化图片
            optimizationLevel: 5,
            progressive: true,
            interlaced: true,
            multipass: true
        })))
        .pipe(gulp.dest(config.dev+'/'+config.images));
});
// build
gulp.task("images:build", ['images'], function () {
    return gulp.src(config.dev+'/'+config.images+'/**')
        .pipe(rev())
        .pipe(gulp.dest(config.dest+'/'+config.images))
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.rev+'/'+config.images));
});



// ========================     html     ====================================

// dev
gulp.task('html', function() {
    return gulp.src('app/*.html')
        .pipe(gulp.dest(config.dev));
});
// build
gulp.task('html:build', function() {
    return gulp.src(['rev/**/*.json', 'app/*.html'])
        .pipe($.revCollector({                              // 集合
            replaceReved: true,
            dirReplacements: {                              // 替换 md5 文件名
                'js': config.js,
                'css': config.css,
                'images': function(manifest_value) {
                    return config.images+'/' + manifest_value;
                }
            }
        }))
        .pipe($.minifyHtml({                                // 压缩 html
            empty:true,
            spare:true
        }))
        .pipe(gulp.dest(config.dest));
});


// ========================     清除     ====================================

gulp.task('clean', function () {
    return gulp.src(config.dest, { read: false })
        .pipe($.clean());
});


// ========================     build     ====================================

gulp.task('build', ['clean'], function() {
    gulp.start('js:build', 'less:build', 'images:build', 'html:build');
});


// ========================     dev     ====================================

gulp.task('server', ['js', 'less', 'images', 'html'], function() {
    //监听
    gulp.watch('app/'+config.css+'/*.less', ["less"]);
    gulp.watch('app/'+config.js+'/*.js', ["js"]);
    gulp.watch('app/'+config.images+'/**', ['images']);
    gulp.watch('app/*.html', ['html']);

    gulp.watch(config.dev+'/**').on("change", browserSync.reload);      // 刷新页面
    
    //同步
    browserSync.init({
        server: {
            baseDir: config.dev,
            index: 'index.html'
        },
        port: 3001
    });

});

