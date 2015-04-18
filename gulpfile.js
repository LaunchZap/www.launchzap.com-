var gulp = require('gulp')
,   $ = require('gulp-load-plugins')()
,   runSequence = require('run-sequence')
,   browserSync = require('browser-sync')
,   inject = require('gulp-inject')
,   wiredep = require('wiredep').stream
,   nib = require('nib');

/***************
* build
****************/

gulp.task('default', function(){
    runSequence('build', 'serve');
});

/***************
* build
****************/

gulp.task('build', function(){
    runSequence('compile-stylus', 'inject', 'wiredep');
});

/***************
* compile-stylus
****************/

gulp.task('compile-stylus', function() {
  return gulp.src([__dirname + '/app/stylus/main.styl'])
    .pipe(plumber())
    .pipe($.stylus({use: nib(), errors: true}))
    .pipe($.autoprefixer('> 1%', 'last 2 version', 'ff 12', 'ie 8', 'opera 12', 'chrome 12', 'safari 12', 'android 2'))
    .pipe($.rename(function(path) {
      path.dirname = '.';
      path.basename = 'launchzap-' + path.basename;
      path.ext = 'css';
    }))
    .pipe(gulp.dest(__dirname + '/app/css/'));
});

/***************
* serve
****************/

gulp.task('serve', ['browser-sync'], function(){
    gulp.watch(
      [__dirname + '/app/stylus/**/*.styl'],
      {debounceDelay: 400},
      ['compile-stylus']
    );
});

/***************
* browser-sync
****************/

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: __dirname + '/app/',
      directory: true
    },
    ghostMode: false,
    notify: false,
    debounce: 200,
    port: 9000,
    startPath: 'index.html'
  });

  gulp.watch([
    __dirname + '/app/**/*.{js,html,css,svg,png,gif,jpg,jpeg}'
  ], {
    debounceDelay: 400
  }, function() {
    browserSync.reload();
  });
});

/***************
* dist-server
****************/

gulp.task('dist-server', function() {
  browserSync({
    server: {
      baseDir: __dirname + '/dist/',
      directory: true
    },
    ghostMode: false,
    notify: false,
    debounce: 200,
    port: 9000,
    startPath: 'index.html'
  });
});

/***************
* inject
****************/

gulp.task('inject', function() {

    var sources = gulp.src(['./app/js/**/*.js','./app/css/**/*.css']);
    return gulp.src('index.html', {cwd: './app'})
    .pipe(inject(sources, {
        read: false,
        ignorePath: '/app'
    }))
    .pipe(gulp.dest('./app'))
    .pipe(notify('Injected archives into your html'));
});

/***************
* wiredep
****************/

gulp.task('wiredep', function () {
    gulp.src('./app/index.html')
    .pipe(wiredep({
        directory: './app/lib'
    }))
    .pipe(gulp.dest('./app'));
});

/***************
* utils
****************/
function plumber() {
  return $.plumber({errorHandler: $.notify.onError()});
}

function notify(message) {
    return $.notify(function() {
        return message;
    });
}
