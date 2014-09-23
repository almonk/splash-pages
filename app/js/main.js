'use strict';

require('./initializers/raven-config');
require('./initializers/cookies');

require('./directives/ng-gc-form-submit-directive');
require('./directives/ng-gc-href-active-directive');
require('./directives/ng-gc-ga-event-tracker-directive');
require('./directives/ng-gc-form-submit-directive');
require('./directives/ng-gc-randomize-team-directive');
require('./directives/ng-gc-smooth-scroll-directive');
require('./directives/ng-gc-sticky-nav-directive');
require('./directives/ng-gc-team-member-directive');
require('./directives/ng-gc-vimeo-iframe-directive');
require('./directives/ng-gc-video-thumb-directive');
require('./directives/ng-gc-nav-toggle-directive');

require('./controllers/ng-gc-prospect-form-controller');
require('./controllers/ng-gc-active-video-controller');

require('../components/ng-gc-components/ng-gc-dialog-directive/dialog-controller');
require('../components/ng-gc-components/ng-gc-popover-directive/popover-directive');
require('../components/ng-gc-components/ng-gc-toggle-directive/ng-gc-toggle-directive');

var StickyTabs = require('../js/deprecated-js/widgets/sticky-tabs');
var Affix = require('../js/deprecated-js/widgets/affix');
require('../js/deprecated-js/lib/bootstrap/tab.js');

var angular = require('angular');

require('../components/angular-animate/angular-animate');
require('../components/angular-scroll/angular-scroll');

angular.module('home', [
  'ngAnimate',
  'duScroll',
  'ngGcGaEventTrackerDirective',
  'ngGcFormSubmitDirective',
  'ngGcHrefActiveDirective',
  'ngGcCookiesInit',
  'gc.popover',
  'gc.toggle',
  'ngGcProspectFormCtrl',
  'ngGcActiveVideoCtrl',
  'ngGcRandomizeTeamDirective',
  'ngGcSmoothScrollDirective',
  'ngGcVimeoIframeDirective',
  'ngGcVideoThumbDirective',
  'ngGcTeamMemberDirective',
  'ngGcStickyNavDirective',
  'gcNavToggleDirective'
]).
  run(function($rootScope, $location){
    $rootScope.$on('duScrollspy:becameActive', function($event, $element){
      var hash = $element.attr('href').replace(/^#/, '');
      if (hash) {
        window.history.pushState({}, '', '#/' + hash);
      }
    });
  });

function isSupportedBrowser() {
  var hasJSON = 'JSON' in window && 'parse' in JSON;
  var supportMode = location.search.match(/supportMode/);
  return hasJSON && !supportMode;
}

angular.element(document).ready(function setup() {
  // Only give decent browser a js experience
  if (isSupportedBrowser()) {
    // Bootstrap Angular
    angular.bootstrap(document, ['home']);
  }
});

module.exports = {
  stickyTabs: new StickyTabs(),
  affix: new Affix({
    el: '[data-affix-footer-fixed]'
  })
};
