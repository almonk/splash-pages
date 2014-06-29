'use strict';

angular.module('ngGcTeamPopoverDirective', []).directive('ngGcTeamPopover', [
  function ngGcTeamPopoverDirective() {

    // James' function for showing/hiding popovers
    $.fn.popoverDisplay = function(option) {

      var callback, opacity, top;

      if (option === 'show') {
        opacity = 1;
        top = 121;
        callback = function(){
          $(this).addClass('is-active');
        };
      } else if (option === 'hide') {
        opacity = 0;
        top = 151;
        callback = function(){
          $(this).addClass('u-is-hidden').removeClass('is-active');
        };
      }

      $(this).stop().animate({
        'opacity': opacity,
        'top': top
      }, 200, 'swing', callback);
    };

    return {
      link: function link(scope, element) {

        var $popover = $('.team-member__popover', element);

        element.on('click', function(e){
          // Ignore if you've clicked on a link inside a team member's bio
          // or if the popover is mid animation
          if (!$(e.target).is('.team-member__link') && !$popover.is(':animated') ) {

            // Hide any currently active popovers
            $('.is-active').popoverDisplay('hide');

            // If not active, show - otherwise, hide.
            if ($popover.hasClass('is-active')) {
              $popover.popoverDisplay('hide');
            } else if (!$popover.hasClass('is-active')) {
              $popover.removeClass('u-is-hidden').popoverDisplay('show');
            }
          }
        });
      }

    };

  }
]);
