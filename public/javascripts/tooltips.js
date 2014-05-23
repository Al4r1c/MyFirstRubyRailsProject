(function ($, window) {
    $.fn.tooltips = function (methodOrAction) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            if (typeof $(this).data('tooltips') != 'function') {
                $(this).data('tooltips', new $.tooltips(this));
            }

            $(this).data('tooltips')(methodOrAction, args);
        });
    };

    $.tooltips = function (el) {
        var base = this;

        base.$element = $(el);

        base.span = $('<span class="tooltip"></span>');
        base.parent = null;
        base.timer = false;

        base.timeout = false;

        base.main = function () {
            return function (method, args) {
                if (base.methods[method]) {
                    return base.methods[ method ].apply(this, args);
                } else {
                    return null;
                }
            }
        };

        base.init = function (parent, timer) {
            if (parent) {
                base.parent = $(parent);
            }

            if (timer != undefined) {
                base.timer = timer;
            }

            $(window).resize(function () {
                if (base.getParent().is(':visible')) {
                    base.refresh();
                } else {
                    base.$element.data('showEvent', base.refresh);
                }
            });
        };

        base.getParent = function () {
            if (base.parent != null) {
                return base.parent;
            }

            return base.$element.parent();
        };

        base.show = function (message, onHover) {
            onHover = onHover ? onHover : false;

            var funcShow = function () {
                base.refresh();
                base.span.show();
            };

            base.span.html(message);

            if (!$.contains(document.documentElement, base.span[0])) {
                base.span.hide().appendTo(base.getParent());
            }


            if (onHover !== true) {
                funcShow();
            } else {
                base.$element.on('mouseenter.tooltips', funcShow);

                base.$element.on('focus.tooltips', function () {
                    funcShow();

                    base.$element.on('focusout.tooltips', function () {
                        base.span.hide();
                    });
                });

                base.$element.on('mouseleave.tooltips', function () {
                    if (!$(this).is(':focus')) {
                        base.span.hide();
                        base.$element.off('focusout.tooltips')
                    }
                });
            }

            if (base.timer != false) {
                if (base.timeout != false) {
                    clearTimeout(base.timeout);
                }

                base.timeout = setTimeout(function () {
                    base.span.fadeOut(250, function () {
                        base.span.detach();
                    });
                }, base.timer);
            }
        };

        base.hide = function () {
            if ($.contains(document.documentElement, base.span[0])) {
                base.span.fadeOut(250, function () {
                    base.span.detach();
                });

                base.$element.off('mouseenter.tooltips').off('mouseleave.tooltips').off('focus.tooltips').off('focusout.tooltips');
            }
        };

        base.refresh = function () {
            var elementOffset = base.$element.position();
            var additionalDecal = 0;


            if (base.$element.next('.inputAdditional').length == 1) {
                additionalDecal = base.$element.next('.inputAdditional').outerWidth();
            }

            base.span.css({
                top: elementOffset.top + base.$element.outerHeight() / 2 - (base.span.outerHeight() / 2),
                left: elementOffset.left + base.$element.outerWidth() + additionalDecal
            });
        };

        base.methods = {
            init: base.init,
            show: base.show,
            hide: base.hide
        };

        return base.main();
    };
})(jQuery, window);