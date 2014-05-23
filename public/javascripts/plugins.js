// Avoid `console` errors in browsers that lack a console.
(function () {
    var method;
    var noop = function () {
    };
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed',
        'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp',
        'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

(function (H) {
    H.className = H.className.replace(/\bno-js\b/, 'js')
})(document.documentElement);


$.fn.bindAsNumber = function (type) {
    var base = this;
    base.element = this.get(0);
    base.$element = $(this);

    base.$element.keydown(function (e) {
        if ((e.which < 48 || e.which > 57) && (e.which < 65 || e.which > 90) && (e.which < 96 || e.which > 105) &&
            (e.which < 37 || e.which > 40) && e.which != 46 && e.which != 8 && e.which != 13 && e.which != 59 &&
            e.which != 109 && e.which != 110) {
            e.preventDefault();
        }
    });

    base.$element.keypress(function (e) {
        if (e.which == 0) {
            return true;
        }

        if (base.$element.val().startsWith('-') === true && base.getCaretPosition(base.element) == 0 &&
            ((e.which >= 48 && e.which <= 57) || e.which == 46)) {
            return false;
        }

        if ((e.which >= 48 && e.which <= 57) || e.which == 8 || e.which == 13 ||
            (e.ctrlKey == true &&
                (e.which == 65 || e.which == 67 || e.which == 86 || e.which == 88 || e.which == 97 || e.which == 99 ||
                    e.which == 118 || e.which == 120 ))) {
            return true;
        }

        if (e.which == 46 && type.indexOf('integer') == -1 && base.$element.val().indexOf('.') == -1 &&
            ((base.getCaretPosition(base.element) > 0 && base.$element.val().startsWith('-') === false) ||
                base.getCaretPosition(base.element) > 1
                )) {
            return true;
        }

        return e.which == 45 && type.indexOf('+') == -1 && base.getCaretPosition(base.element) == 0 &&
            base.$element.val().startsWith('-') == false;
    });

    base.getCaretPosition = function (oField) {
        var iCaretPos = 0;

        if (document.selection) {
            oField.focus();

            var oSel = document.selection.createRange();

            oSel.moveStart('character', -oField.value.length);

            iCaretPos = oSel.text.length;
        } else if (oField.selectionStart || oField.selectionStart == '0') {
            iCaretPos = oField.selectionStart;
        }

        return (iCaretPos);
    };
};

String.prototype.endsWith = function(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
};