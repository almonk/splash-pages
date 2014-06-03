'use strict';

angular.module('ngGcSmoothScrollDirective', []).directive('ngGcSmoothScroll', [
  function ngGcSmoothScrollDirective() {

    return {
      link: function link(scope, element) {
        element.on('click', function(e) {
          e.preventDefault();
          $('html, body').animate({
              scrollTop: $($.attr(this, 'href')).offset().top
          }, 500);
          return false;
        });
      }
    };

  }
]);
