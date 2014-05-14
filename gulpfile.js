'use strict';

var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
var csslint = require('gulp-csslint');
var size = require('gulp-size');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var filter = require('gulp-filter');
var cache = require('gulp-cache');
var useref = require('gulp-useref');
var exec = require('gulp-exec');
var csso = require('gulp-csso');
var rubySass = require('gulp-ruby-sass');
var bowerFiles = require('gulp-bower-files');
var flatten = require('gulp-flatten');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');
var autoprefixer = require('gulp-autoprefixer');
var karma = require('gulp-karma');
var through = require('through2');
var nunjucks = require('nunjucks');
var debug = require('debug')('gocardless');
var _ = require('lodash');
var chalk = require('chalk');
var tempWrite = require('temp-write');

gulp.task('eslint', function() {
  return gulp.src('assets/js/**/*.js')
    .pipe(eslint({
      config: 'eslint.json'
    }))
    .pipe(eslint.format('stylish'));
});

gulp.task('csslint', function() {
  return gulp.src('assets/css/**/*.css')
    .pipe(csslint('csslintrc.json'))
    .pipe(csslint.reporter());
});

gulp.task('css', function () {
  return gulp.src('assets/css/main.scss')
    .pipe(rubySass({
      style: 'expanded',
      precision: 10,
      bundleExec: true,
      loadPath: ['assets/css'],
      sourcemap: true
    }))
    .pipe(autoprefixer('last 1 version'))
    .pipe(gulp.dest('.tmp/css'))
    .pipe(size());;
});

gulp.task('assets', function () {
  return gulp.src(['assets/*.*'])
    .pipe(gulp.dest('build'));
});

gulp.task('public', function() {
  return gulp.src('public/**/*', { base: 'public' })
    .pipe(gulp.dest('build'))
    .pipe(size());
});

gulp.task('html', ['css'], function () {
  var jsFilter = filter('**/*.js');
  var cssFilter = filter('**/*.css');
  var htmlFilter = filter('**/*.html');

  return gulp.src('templates/**/*.html')
    .pipe(useref.assets({ searchPath: '{.tmp,assets}' }))
    .pipe(jsFilter)
    .pipe(uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    // .pipe(csso())
    .pipe(cssFilter.restore())
    .pipe(useref.restore())
    .pipe(useref())
    .pipe(gulp.dest('build'))
    .pipe(htmlFilter)
    .pipe(gulp.dest('.tmp/templates'))
    .pipe(size());
});

function templateMetadata() {
  var isProduction = (process.env.NODE_ENV == 'production');
  var mixpanelToken = isProduction ? '0ebe37c4ed96a0432e989cc20ca1db04' :
    'fa029f81daf1c512854b1345342c4e6c';

  return {
    ENV_PRODUCTION: isProduction,
    MIXPANEL_TOKEN: mixpanelToken,
    TRADING_ADDRESS: '22-25 Finsbury Square, London, EC2A 1DX',
    SUPPORT_CONTACT_NUMBER: '020 7183 8674',
    SUPPORT_EMAIL: 'help@gocardless.com',
    GITHUB_LINK: 'http://github.com/gocardless',
    TWITTER_LINK: 'https://twitter.com/gocardless'
  };
}

gulp.task('template', ['html'], function () {
  return gulp.src('pages/**/*.html')
    .pipe(template({}, templateMetadata()))
    .pipe(gulp.dest('build'))
    .pipe(size());
});

var env = nunjucks.configure(path.join(__dirname, '.tmp', 'templates'), {
  autoescape: false
});

function template(options, metadata) {
  options = options || {};

  return through.obj(function(file, enc, cb) {
    var _this = this;

    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('template',
                                               'Streaming not supported'));
      return cb();
    }

    gutil.log('template:', 'checking file:', chalk.blue(file.path));

    var templateData = _.extend({
      filename: file.path
    }, metadata);

    var templateStr = file.contents.toString();

    var res = env.renderString(templateStr, templateData);

    gutil.log('template:', 'converted file:',
              chalk.blue(file.path));

    file.contents = new Buffer(res);
    _this.push(file);

    cb();
  });
}

gulp.task('images', function () {
  return gulp.src('assets/images/**/*')
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('build/images'))
    .pipe(size());
});

gulp.task('clean', function () {
    return gulp.src(['build'], { read: false })
      .pipe(clean());
});

gulp.task('fonts', function () {
  var streamqueue = require('streamqueue');
  return streamqueue({ objectMode: true },
    bowerFiles(),
    gulp.src('assets/fonts/**/*')
  )
    .pipe(filter('**/*.{eot,svg,ttf,woff}'))
    .pipe(flatten())
    .pipe(gulp.dest('build/fonts'))
    .pipe(size());
});

gulp.task('serve', ['build', 'connect'], function () {
  require('opn')('http://localhost:9000');
});

gulp.task('connect', function () {
  var connect = require('connect');
  var app = connect()
      .use(require('connect-livereload')({ port: 35729 }))
      .use(connect.static('build'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('watch', ['build', 'connect', 'serve'], function () {
  var server = livereload();

  gulp.watch([
    'build/**/*'
  ]).on('change', function (file) {
    server.changed(file.path);
  });

  gulp.watch(['pages/**/*.html', 'templates/**/*.html'], ['template']);
  gulp.watch('public/**/*', ['public']);
  gulp.watch('assets/css/**/*.css', ['html']);
  gulp.watch('assets/images/**/*', ['images']);
});

gulp.task('unit', function() {
  return gulp.src([
      'assets/components/jasmine-helpers/*.js',
      'assets/components/jquery/dist/jquery.js',
      'assets/components/lodash/dist/lodash.compat.js',
      'assets/components/angular/angular.js',
      'assets/components/angular-mocks/angular-mocks.js',
      'assets/components/es5-shim/es5-shim.js',
      'assets/components/raven-js/dist/raven.js',
      'assets/js/**/*.js'
    ])
    .pipe(karma({
      configFile: 'karma-unit.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      throw err;
    });
});

gulp.task('test', ['unit']);

gulp.task('build', ['template', 'fonts', 'public', 'assets']);

gulp.task('default', function () {
  gulp.start('watch');
});
