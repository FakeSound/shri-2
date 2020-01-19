var gulp = require('gulp'),
    sass = require('gulp-sass'),
    prefix = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    imageresize = require('gulp-image-resize'),
    twig = require('gulp-twig'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browsersync  = require('browser-sync'),

    /* funcs */

    reload = browsersync.reload,

    /* config */

    projectName = 'new-project',

    path = {
        base: './',
        build: './build',
        src: './src'
    },

    config = {
        fonts: {
            path: {
                src: `${path.src}/fonts/**/*.*`,
                dest: `${path.build}/fonts/`
            }
        },
        html: {
            path: {
                index: `${path.src}/view/*.twig`,
                src: `${path.src}/view/**/*.twig`,
                dest: path.base
            }
        },
        css: {
            path: {
                index: `${path.src}/style.scss`,
                src: `${path.src}/**/*.scss`,
                dest: `${path.build}/`
            }
        },
        js: {
            path: {
                index: `${path.src}/linter.js`,
                src: `${path.src}/**/*.js`,
                dest: `${path.build}/`
            }
        },
        img: {
            path: {
                src: `${path.src}/img/**/*.*`,
                dest: `${path.build}/img/`
            }
        },
        resize: {
            path: {
                src: [`${path.src}/img/**/*.*`],
                dest: `${path.build}/img/resized/`
            }
        }
    };

/* tasks */

function css(done) {
    gulp.src(config.css.path.index)
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(prefix({ browsers: ['last 2 versions'], cascade: false }))
        .pipe(gulp.dest(config.css.path.dest))
        .pipe(reload({ stream: true }));
    done();
}

function js(done) {
    browserify(config.js.path.index).bundle()
        .pipe(source('linter.js'))
        .pipe(buffer())
        // .pipe(uglify())
        .pipe(gulp.dest(config.js.path.dest))
        .pipe(reload({ stream: true }));
    done();
}

function html(done) {
    gulp.src(config.html.path.index)
        .pipe(twig({
            data: {
                title: projectName
            }
        }))
        .pipe(gulp.dest(config.html.path.dest))
        .pipe(reload({ stream: true }));
    done();
}

function fonts(done) {
    gulp.src(config.fonts.path.src)
        .pipe(gulp.dest(config.fonts.path.dest));
    done();
}

function watch(done) {
    gulp.watch([config.css.path.src], css);
    gulp.watch([config.js.path.src], js);
    gulp.watch([config.html.path.src], html);
    done();
}

function img(done) {
    gulp.src(config.img.path.src)
        .pipe(imagemin([
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ opimizationLevel: 5 })
        ], {
            verbose: true
        }))
        .pipe(gulp.dest(config.img.path.dest));
    done();
}

function resize(done) {
    gulp.src(config.resize.path.src)
        .pipe(imageresize({
            width: 1600,
            height: 900,
            crop: false,
            upscale: false,
            noProfile: true,
            imageMagick: true,
            cover: true,
            filter: 'Catrom' // Catrom - for reduction, Hermite - for enlargement
        }))
        .pipe(gulp.dest(config.resize.path.dest));
    done();
}

function server(done) {
    browsersync({
        server: { baseDir: path.base },
        notify: true
    });
    done();
}

exports.img = img;
exports.resize = resize;
exports.fonts = fonts;
exports.html = html;
exports.css = css;
exports.js = js;
exports.dev = gulp.parallel(js);
exports.build = gulp.parallel(js);
exports.default = gulp.series(
    gulp.parallel(js),
    watch
    // watch,
    // server
);
