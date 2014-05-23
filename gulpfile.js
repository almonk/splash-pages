'use strict';

var gulp = require('gulp');
var clean = require('gulp-clean');
var eslint = require('gulp-eslint');
var csslint = require('gulp-csslint');
var size = require('gulp-size');
var filter = require('gulp-filter');
var useref = require('gulp-useref');
var sass = require('gulp-sass');
var flatten = require('gulp-flatten');
var livereload = require('gulp-livereload');
var autoprefixer = require('gulp-autoprefixer');
var karma = require('gulp-karma');
var gif = require('gulp-if');

var httpProxy = require('http-proxy');
var APIProxy = httpProxy.createProxyServer();

var template = require('./tasks/template');
var deploy = require('./tasks/deploy');

var redirect = require('./tasks/redirect');
var redirects = require('./redirects.json');

var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var csso = require('gulp-csso');

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

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
    .pipe(sass({
      style: 'expanded',
      loadPath: ['assets/css'],
    }))
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('.tmp/css'))
    .pipe(size());
});

// Adds a CSS file for Greenhouse application forms
gulp.task('greenhouse-css', function () {
  return gulp.src('assets/css/greenhouse-forms.scss')
    .pipe(sass({
      style: 'expanded',
      loadPath: ['assets/css']
    }))
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('build/css'))
    .pipe(size());
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
    .pipe(gif(isProduction(), uglify()))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe(gif(isProduction(), csso()))
    .pipe(cssFilter.restore())
    .pipe(useref.restore())
    .pipe(useref())
    .pipe(gulp.dest('build'))
    .pipe(htmlFilter)
    .pipe(gulp.dest('.tmp/templates'))
    .pipe(size());
});

function templateMetadata() {
  var mixpanelProduction = '0ebe37c4ed96a0432e989cc20ca1db04';
  var mixpanelTest = 'fa029f81daf1c512854b1345342c4e6c';
  var mixpanelToken = isProduction() ? mixpanelProduction : mixpanelTest;

  return {
    ENV_PRODUCTION: isProduction(),
    MIXPANEL_TOKEN: mixpanelToken,
    TRADING_ADDRESS: '22-25 Finsbury Square<br>London, EC2A 1DX',
    SUPPORT_CONTACT_NUMBER: '020 7183 8674',
    SUPPORT_EMAIL: 'help@gocardless.com',
    GITHUB_LINK: 'http://github.com/gocardless',
    TWITTER_LINK: 'https://twitter.com/gocardless'
  };
}

gulp.task('template', ['html'], function () {
  return gulp.src(['pages/**/*.html', '!pages/**/_*.html'])
    .pipe(template({}, templateMetadata()))
    .pipe(gulp.dest('build'))
    .pipe(size());
});

gulp.task('redirects', function () {
  return gulp.src(['redirects.json'])
    .pipe(redirect(redirects))
    .pipe(gulp.dest('build'))
    .pipe(size());
});

gulp.task('imagemin', function () {
  return gulp.src('assets/images/**/*')
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('assets/images'))
    .pipe(size());
});

gulp.task('images', function () {
  return gulp.src('assets/images/**/*')
    .pipe(gulp.dest('build/images'))
    .pipe(size());
});

gulp.task('clean', function () {
  return gulp.src(['build'], { read: false })
    .pipe(clean());
});

gulp.task('fonts', function () {
  return gulp.src('assets/fonts/**/*')
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
      .use(function(req, res, next) {
        if (req.url.match(/^\/api\//) ||
            req.url.match(/^\/admin\//) ||
            req.url.match(/^\/web\//) ||
            req.url.match(/^\/merchants\//) ||
            req.url.match(/^\/users\//) ||
            req.url.match(/^\/assets\//) ||
            req.url.match(/^\/connect\//)) {
          APIProxy.web(req, res, {
            target: 'http://gocardless.dev:3000'
          });
        } else {
          return next();
        }
      })
      .use(connect.static('build'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://gocardless.dev:9000');
    });
});

gulp.task('watch', ['build', 'connect', 'serve'], function () {
  var server = livereload();

  gulp.watch([
    'build/**/*'
  ]).on('change', function (file) {
    server.changed(file.path);
  });

  gulp.watch([
    'pages/**/*.html',
    'templates/**/*.html',
    'assets/css/**/*.scss',
    'assets/js/**/*.js'
  ], ['template']);

  gulp.watch('public/**/*', ['public']);
  gulp.watch('assets/fonts/**/*', ['fonts']);
  gulp.watch('assets/images/**/*', ['images']);
});

gulp.task('unit', function() {
  return gulp.src([
    'assets/components/jquery/dist/jquery.js',
    'assets/components/lodash/dist/lodash.compat.js',
    'assets/components/angular/angular.js',
    'assets/components/angular-cookies/angular-cookies.js',
    'assets/components/es5-shim/es5-shim.js',
    'assets/components/mute-console/mute-console.js',

    'assets/components/jasmine-helpers/*.js',
    'assets/components/angular-mocks/angular-mocks.js',

    'assets/js/lib/bootstrap/tab.js',
    'assets/js/lib/froogaloop.js',

    'assets/js/directives/ng-gc-ga-event-tracker-directive.js',
    'assets/js/directives/ng-gc-form-submit-directive.js',
    'assets/js/directives/ng-gc-href-active-directive.js',
    'assets/js/modal/modal.js',
    'assets/js/gocardless-global.js',
    'assets/js/module.js',
    'assets/js/base-view.js',
    'assets/js/class-extends.js',
    'assets/js/widgets/modals.js',
    'assets/js/widgets/modal-vimeo.js',
    'assets/js/widgets/demo-modal.js',
    'assets/js/widgets/popover.js',
    'assets/js/widgets/affix.js',
    'assets/js/widgets/sticky-tabs.js',
    'assets/js/metrics/**/*.js',
    'assets/js/cookies.js',
    'assets/js/url-parameter-service.js',
    'assets/js/**/*spec.js'
  ])
  .pipe(karma({
    configFile: 'karma-unit.conf.js',
    action: 'run'
  }))
  .on('error', function(err) {
    throw err;
  });
});

gulp.task('deploy', ['clean', 'build'], function() {
  return gulp.src('build/**/*')
    .pipe(deploy({
      region: 'eu-west-1',
      accessKeyId: process.env.GC_AWS_ACCESS_KEY,
      secretAccessKey: process.env.GC_AWS_SECRET
    }, {
      Bucket: process.env.AWS_S3_BUCKET,
    }));
});

gulp.task('test', ['unit']);

gulp.task('build', [
  'template', 'redirects', 'images', 'fonts', 'public', 'greenhouse-css'
]);

gulp.task('default', function () {
  gulp.start('watch');
});
