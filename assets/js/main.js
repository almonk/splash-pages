'use strict';

require('es5-shim');
require('mute-console');

var angular = require('angular');

require('./initializers/raven-config')
require('./initializers/cookies');

require('./directives/ng-gc-form-submit-directive');
require('./directives/ng-gc-href-active-directive');
require('./directives/ng-gc-ga-event-tracker-directive');
require('./directives/ng-gc-form-submit-directive');

require('./controllers/ng-gc-prospect-form-controller');
require('./controllers/ng-gc-watch-demo-form-controller');

require('./metrics/pageview-events');
require('./metrics/request-demo-funnel');
require('./metrics/signup-funnel');

require('../components/ng-gc-components/ng-gc-dialog-directive/dialog-controller');
require('../components/ng-gc-components/ng-gc-popover-directive/popover-directive');
require('../components/ng-gc-components/ng-gc-toggle-directive/ng-gc-toggle-directive');

var ModalVimeo = require('../components/deprecated-js/widgets/modal-vimeo');
var DemoModal = require('../components/deprecated-js/widgets/demo-modal');
var StickyTabs = require('../components/deprecated-js/widgets/sticky-tabs');
var Affix = require('../components/deprecated-js/widgets/affix');
require('../components/deprecated-js/lib/bootstrap/tab.js');

angular.module('home', [
  'ngGcGaEventTrackerDirective',
  'ngGcFormSubmitDirective',
  'ngGcHrefActiveDirective',
  'ngGcSignupFunnel',
  'ngGcRequestDemoFunnel',
  'ngGcPageViewEvents',
  'ngGcCookiesInit',
  'gc.popover',
  'gc.toggle',
  'ngGcProspectFormCtrl',
  'ngGcWatchDemoFormCtrl'
]);

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

new ModalVimeo();

new DemoModal({
  el: '[data-modal-demo]'
});

new StickyTabs();

new Affix({
  el: '[data-affix-footer-fixed]'
});
