(function ($, window) {
    $.fn.dialogBox = function (type, options) {
        this.each(function () {
            (new $.dialogBoxPlugin(type, options, this));
        });

        return this;
    };


    $.Dialog = function (type, options) {
        new $.dialogBoxPlugin(type, options);
    };


    $.dialogBoxPlugin = function (type, options, element) {
        var base = this, defaultOptions = {
            title: 'Dialog',
            text: '',
            form: null,
            fadeIn: 250,
            fadeOut: 350,
            buttons: null,
            onClose: null,
            onCancel: null,
            onValid: null
        };


        var ecran, dialogBoxDiv , spanContent , buttonsDiv;

        var timeOutCenter, centerSpeed = 150;

        base.init = function () {
            base.options = $.extend({}, defaultOptions, options);
            if (base.options.onCancel != null) {
                base.options.onCancel = [base.options.onCancel];
            } else {
                base.options.onCancel = [];
            }

            if (base.options.onValid != null) {
                base.options.onValid = [base.options.onValid];
            } else {
                base.options.onValid = [];
            }


            if (base.options.buttons == null) {
                if (type == 'confirm') {
                    base.options.buttons = [
                        {caption: 'oui', class: 'yes', type: 'valid'},
                        {caption: 'non', class: 'no', type: 'cancel'},
                        {caption: 'fermer', class: 'cancel', type: 'cancel'}
                    ];
                } else if (type == 'form' || type == 'bigform') {
                    base.options.buttons = [
                        {caption: 'ok', class: 'yes', type: 'valid'},
                        {caption: 'annuler', class: 'no', type: 'cancel'}
                    ];
                } else {
                    base.options.buttons = ['ok'];
                }
            }

            if (element != undefined) {
                $(element).click(function () {
                    base.showDialogBox();
                });
            } else {
                base.showDialogBox();
            }
        };


        base.showDialogBox = function () {
            ecran = $('<div class="dialogBox-overlay"></div>');
            dialogBoxDiv =
                $('<div class="dialogBox ' + type + '"><div class="title"></div><div class="content"></div></div>');
            spanContent = $('<span></span>').appendTo(dialogBoxDiv.find('div.content'));
            buttonsDiv = $('<div class="buttons"></div>');

            dialogBoxDiv.find('div.title').text(base.options.title);


            if ((type == 'form' || type == 'bigform') && base.options.form != null) {
                base.makeForm();
            } else {
                spanContent.text(base.options.text);
            }


            if (type != 'confirm' && type != 'error') {
                var closeCrossButton = $('<a href="#" title="Fermer" class="close" href="#"></a>');

                dialogBoxDiv.prepend(closeCrossButton);
                base.makeItCancelable(closeCrossButton, 'cancel');
                base.makeItCancelable(ecran, 'cancel');
            }

            base.bindKeyboard();

            dialogBoxDiv.append(base.createButtons(buttonsDiv));


            $(window).bind('resize.dialogbox', function () {
                ecran.height($(window).height());
                base.centerElement();
            });

            ecran.hide();
            $('body').append(ecran.fadeTo(base.options.fadeIn, 0.3).height($(window).height()));
            dialogBoxDiv.hide().appendTo('body').fadeIn(base.options.fadeIn).css(base.getCenter(dialogBoxDiv));

            dialogBoxDiv.trigger('onShow.dialogBox');
        };


        base.calcCenter = function (width, height) {
            return {
                left: Math.max(0, (($(window).width() - width) / 2)),
                top: Math.max(0, (($(window).height() - height) / 2))
            };
        };


        base.getCenter = function (element) {
            return base.calcCenter(element.outerWidth(), element.outerHeight());
        };


        base.centerElement = function () {
            clearTimeout(timeOutCenter);

            timeOutCenter = setTimeout(function () {
                dialogBoxDiv.animate(base.getCenter(dialogBoxDiv), 350);
            }, centerSpeed);
        };


        base.makeForm = function () {
            var form = $('<form action="#"></form>');

            $.each(base.options.form, function () {
                var fieldset = $('<fieldset><label for="' + this.id + '">' + this.label +
                    ':</label></fieldset>'), objet;

                if (this.type == 'select') {
                    var listeVal;

                    objet = $('<select></select>');

                    if (typeof this.value == 'function') {
                        listeVal = this.value();
                    } else {
                        listeVal = this.value;
                    }

                    $.each(listeVal, function (id, element) {
                        var value, libelle;
                        var option = $('<option></option>').appendTo(objet);

                        if (typeof element == 'string') {
                            value = libelle = element;
                        } else {
                            value = element.value;
                            libelle = (element.libelle != undefined ? element.libelle : value);

                            if (element.selected === true) {
                                option.attr('selected', true);
                            }

                            if (typeof element.callback == 'function') {
                                option.click(function () {
                                    element.callback(spanContent);
                                });
                            }
                        }

                        option.val(value);
                        option.text(libelle);
                    });
                } else {
                    objet = $('<input type="text" />');

                    if (this.value != undefined) {
                        objet.attr('value', this.value);
                    }
                }

                if (this.disabled === true) {
                    objet.attr('disabled', true);
                }

                objet.attr({
                    id: this.id,
                    class: (this.class != undefined ? this.class : '')
                }).appendTo(fieldset);

                if (this.valid != undefined) {
                    objet.validInput(this.valid);
                }

                form.append(fieldset);
            });

            spanContent.append(form);
        };


        base.bindKeyboard = function () {
            $(window).bind('keypress.dialogbox', function (e) {
                var code = (e.keyCode ? e.keyCode : e.which);

                if (code == 13) {
                    $.each(base.getButtonsType('valid'), function (index) {
                        buttonsDiv.find('button').eq(index).click();
                    });
                    return false;
                } else if (code == 27) {
                    base.doCancel('cancel');
                    return false;
                }

                return true;
            });
        };


        base.createButtons = function (buttonsDiv) {
            $.each(base.options.buttons, function () {
                var defaultButtonOptions = {
                    caption: null,
                    class: null,
                    callback: null,
                    type: 'cancel',
                    confirm: false
                }, buttonOption = $.extend({}, defaultButtonOptions, this);

                var caption = (
                    buttonOption.caption != null ? buttonOption.caption : this), button = $('<button class="button">' +
                    caption + '</button>');

                if (buttonOption.class != undefined) {
                    button.addClass(buttonOption.class);
                }

                if (buttonOption.callback != null) {
                    if (buttonOption.callback instanceof Array) {
                        button.data('buttonCallback', buttonOption.callback);
                    } else {
                        button.data('buttonCallback', []);
                        button.data('buttonCallback').push(buttonOption.callback);
                    }
                }

                base.makeItCancelable(button, buttonOption.type, buttonOption);

                buttonsDiv.append(button);
            });

            return buttonsDiv;
        };


        base.makeItCancelable = function (element, type, buttonClicked) {
            element.click(function () {
                var valid = true;

                if (type == 'valid') {
                    spanContent.find('input[type="text"]').focusout();

                    if (spanContent.find('.tooltip').length > 0) {
                        valid = false;
                    }
                }

                if (valid === true) {
                    if (typeof $(this).data('buttonCallback') == 'object') {
                        $.each($(this).data('buttonCallback'), function () {
                            this(buttonClicked != undefined ? buttonClicked : '');
                        });
                    }

                    base.doCancel(type, buttonClicked);
                }
            });
        };

        base.doCancel = function (type, buttonClicked) {
            ecran.fadeOut(base.options.fadeOut);
            dialogBoxDiv.fadeOut(base.options.fadeOut, function () {
                if (type == 'cancel' && typeof base.options.onCancel == 'object') {
                    $.each(base.options.onCancel, function () {
                        this(spanContent, buttonClicked != undefined ? buttonClicked : '');
                    });
                }

                if (type == 'valid' && typeof base.options.onValid == 'object') {
                    $.each(base.options.onValid, function () {
                        this(spanContent, buttonClicked != undefined ? buttonClicked : '');
                    });
                }

                if (base.options.onClose && typeof base.options.onClose == 'function') {
                    base.options.onClose(spanContent, buttonClicked != undefined ? buttonClicked : '');
                }

                ecran.detach();
                dialogBoxDiv.detach();

                $(window).off('resize.dialogbox').off('keypress.dialogbox');

                dialogBoxDiv.trigger('onClose.dialogBox');
            });
        };

        base.getButtonsType = function (type) {
            var validButtons = [];

            $.each(base.options.buttons, function () {
                if (this.type == type) {
                    validButtons.push(this);
                }
            });

            return validButtons;
        };

        base.init();
    };
})(jQuery, window);