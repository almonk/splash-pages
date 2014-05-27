/*eslint-disable */
/* DEPRECATE */

(function() {
  'use strict';

  var Widgets = window.GoCardless.module('widgets');

  Widgets.Views.ModalVimeo = (function() {
    function ModalVimeo() {
      this.setModal = this.setModal.bind(this);
      return ModalVimeo.__super__.constructor.apply(this, arguments);
    }

    window.classExtends(ModalVimeo, Widgets.Views.Modals);

    ModalVimeo.prototype.el = '[data-modal-vimeo]';

    ModalVimeo.prototype.ready = function() {
      ModalVimeo.__super__.ready.apply(this, arguments);
      return this.initAutoplay();
    };

    ModalVimeo.prototype.setModal = function() {
      ModalVimeo.__super__.setModal.apply(this, arguments);
      return this.initVimeoPlayer();
    };

    ModalVimeo.prototype.getVimeoPlayer = function() {
      return this.getModal().videoPlayer;
    };

    ModalVimeo.prototype.initVimeoPlayer = function() {
      var instance = this.getModal();
      var iframe = instance.$el.find('iframe')[0];
      var player = instance.videoPlayer = window.Froogaloop(iframe);
      instance.on('hide', $.proxy(this.onHide, this));

      player.addEvent('ready', $.proxy(function() {
        player.addEvent('pause', $.proxy(this.onPause, this));
        player.addEvent('play', $.proxy(this.onPlay, this));
        player.addEvent('finish', $.proxy(this.onFinish, this));
        player.addEvent('playProgress', $.proxy(this.onProgress, this));
      }, this));

      return instance;
    };

    ModalVimeo.prototype.initAutoplay = function() {
      var search = location.search.substring(1);
      var autoPlay = search && search.match(/autoplay\=([^&]+)/);
      var autoPlayTarget = autoPlay && autoPlay[1];
      if (autoPlayTarget && this.getTarget().match(autoPlayTarget)) {
        return this.play();
      }
    };

    ModalVimeo.prototype.play = function() {
      this.showModal();
      return this.getVimeoPlayer().api('ready', (function(_this) {
        return function() {
          return _this.getVimeoPlayer().api('play');
        };
      })(this));
    };

    ModalVimeo.prototype.onHide = function() {
      return this.getVimeoPlayer().api('pause');
    };

    // Override these event handlers in your subclass
    ModalVimeo.prototype.onFinish = function() {
    }

    ModalVimeo.prototype.onPlay = function() {
    }

    ModalVimeo.prototype.onPause = function() {
    }

    ModalVimeo.prototype.onProgress = function(data) {
    }


    return ModalVimeo;

  })();

}).call(this);
