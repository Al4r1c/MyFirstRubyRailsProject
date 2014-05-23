(function ($) {
    $.fn.validInput = function (option, onHover) {
        onHover = onHover ? onHover : false;

        return this.each(function () {
            if (typeof $(this).data('validInput') != 'function') {
                $(this).data('validInput', new $.validInput(this, option, onHover));
            } else {
                $(this).data('validInput')(option);
            }
        });
    };


    $.validInput = function (el, options, onHover) {
        var base = this, defaultValidationOptions = {
            required: true,
            notnull: false,
            same: false,
            minlength: false,
            maxlength: false,
            type: false,
            forbiddenchar: false,
            forbiddenword: false,
            checkFileName: false,
            notInDatasource: false
        }, validationOptions = $.extend({}, defaultValidationOptions, options);

        var arrayInOrder = ['notnull', 'minlength', 'maxlength', 'type', 'forbiddenchar', 'forbiddenword',
            'checkFileName', 'notInDatasource', 'same'];


        var isRequired = true;

        base.$element = $(el);
        base.element = el;


        base.mainFunction = function () {
            base.init();

            return function (newOptions) {
                base.modifierOption(newOptions);
            }
        };


        base.init = function () {
            var func;


            if (validationOptions.required === false) {
                isRequired = false;
            }
            delete validationOptions.required;


            $.each(validationOptions, function (clef, valeurOption) {
                if (valeurOption !== false) {
                    func = base.getFunction(clef, valeurOption);

                    if (func != null) {
                        if (base.$element.data('valid') == undefined) {
                            base.$element.data('valid', []);
                        }

                        base.$element.data('valid')[arrayInOrder.indexOf(clef)] =
                            base.createFunctionWithRequiredTest(func);

                        func = null;
                    }
                }
            });


            base.$element.on('focusout.validInput',function () {
                if ($(this).data('valid') != undefined) {
                    var message = true;

                    $.each($(this).data('valid'), function (clef, fonction) {
                        if (fonction != undefined) {
                            message = fonction($.trim(base.$element.val()));

                            if (message !== true) {
                                base.$element.tooltips('show', message, onHover);
                                base.$element.addClass('invalid').removeClass('valid');
                                return false;
                            }
                        }

                        return true;
                    });

                    if (message === true) {
                        base.$element.tooltips('hide');
                        base.$element.removeClass('invalid').addClass('valid');
                    }
                }
            }).tooltips('init');
        };


        base.modifierOption = function (options) {
            $.each(options, function (clef, valeurOption) {
                if (clef == 'required') {
                    isRequired = valeurOption === true;
                } else if (validationOptions[clef] != valeurOption) {
                    validationOptions[clef] = valeurOption;
                    base.$element.data('valid')[arrayInOrder.indexOf(clef)] = base.getFunction(clef, valeurOption);
                }
            });
        };


        base.createFunctionWithRequiredTest = function (functionSent) {
            return function (val) {
                return ((val && !isRequired) || isRequired ? functionSent(val) : true);
            }
        };


        base.getFunction = function (typeValidation, valeurOption) {
            var func = null;
            var messageFromOption = null;

            if (typeof valeurOption == 'object' && valeurOption.message != undefined) {
                messageFromOption = valeurOption.message;
                valeurOption = valeurOption.val;
            }


            switch (typeValidation) {
                case 'notnull':
                    if (valeurOption === true) {
                        func = function (val) {
                            if (val != null && val != '') {
                                return true;
                            } else {
                                return (messageFromOption ? messageFromOption : 'Ce champs est obligatoire.');
                            }
                        };
                    }
                    break;
                case 'type':
                    if (valeurOption == 'filename') {
                        func = function (val) {
                            var expressionCharacter = /^[a-zA-Z0-9_-]+$/i;

                            if (expressionCharacter.test(val) === true) {
                                return true;
                            } else {
                                return (messageFromOption ? messageFromOption :
                                    'Ce champs ne doit contenir que des caractères simples.');
                            }
                        };

                        base.$element.keypress(function (e) {
                            if (e.which == 0) {
                                return true;
                            }

                            return (e.which >= 48 && e.which <= 57) || (e.which >= 97 && e.which <= 122) ||
                                (e.which >= 65 && e.which <= 90) || e.which == 45 || e.which == 95 || e.which == 8 ||
                                e.which == 13 ||
                                (e.ctrlKey == true &&
                                    (e.which == 65 || e.which == 67 || e.which == 86 || e.which == 88 ||
                                        e.which == 97 || e.which == 99 || e.which == 118 || e.which == 120 ));
                        });

                    } else if (valeurOption == 'numeric' || valeurOption == 'numeric+' || valeurOption == 'integer' ||
                        valeurOption == 'integer+') {
                        func = function (val) {
                            if (!isNaN(val)) {
                                if (valeurOption.indexOf('+') != '-1' && val < 0) {
                                    return 'Le nombre doit être positif.';
                                } else {
                                    return true;
                                }
                            } else {
                                return 'Ce champs doit être une valeur numérique valide.';
                            }
                        };

                        base.$element.bindAsNumber(valeurOption);
                    } else if (valeurOption == 'url') {
                        func = function (val) {
                            var expressionUrl = /^http[s]?:\/\/([a-z]+\.)?([a-z]+)(\.[a-z]{2,4})(\/{1}[a-zA-Z-_\/\.0-9#:?=&%;,|]*)?$/i;

                            if (expressionUrl.test(val) === true) {
                                return true;
                            } else {
                                return (messageFromOption ? messageFromOption : 'Ce champs doit être une url valide.');
                            }
                        };
                    } else if (valeurOption == 'mail') {
                        func = function (val) {
                            var expressionUrl = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

                            if (expressionUrl.test(val) === true) {
                                return true;
                            } else {
                                return (messageFromOption ? messageFromOption :
                                    'Ce champs doit être une adresse email valide.');
                            }
                        };
                    } else if (valeurOption == 'slug') {
                        func = function (val) {
                            var expressionUrl = /^[a-z0-9-_\/]+$/i;

                            if (expressionUrl.test(val) === true) {
                                return true;
                            } else {
                                return (messageFromOption ? messageFromOption :
                                    'Ce champs doit être une url valide (caractères non accentués, chiffres, - et _ uniquement).');
                            }
                        };
                    }
                    break;
                case 'minlength':
                    if (!isNaN(parseInt(valeurOption))) {
                        func = function (val) {
                            var nbChar = parseInt(valeurOption);
                            if (nbChar < 0) {
                                nbChar = 0;
                            }

                            if (base.strip(val).length >= nbChar) {
                                return true;
                            } else {
                                return (messageFromOption ? messageFromOption.replace('__VAL__', nbChar) :
                                    'Minimum de caractères: ' + nbChar);
                            }
                        };
                    }
                    break;
                case 'maxlength':
                    if (!isNaN(parseInt(valeurOption))) {
                        func = function (val) {
                            var nbChar = parseInt(valeurOption);
                            if (nbChar < 1) {
                                nbChar = 1;
                            }

                            if (base.strip(val).length <= nbChar) {
                                return true;
                            } else {
                                return (messageFromOption ? messageFromOption.replace('__VAL__', nbChar) :
                                    'Maximum de caractères: ' + nbChar);
                            }
                        };

                        base.element.maxLength = parseInt(valeurOption);
                    }
                    break;
                case 'forbiddenchar':
                    func = function (val) {
                        for (var x = 0; x < valeurOption.length; x++) {
                            if (val.indexOf(valeurOption.charAt(x)) !== -1) {
                                return (
                                    messageFromOption ? messageFromOption.replace('__VAL__', valeurOption.charAt(x)) :
                                        'Caractère interdit: "' + valeurOption.charAt(x) + '"');
                            }
                        }

                        return true;
                    };
                    break;
                case 'forbiddenword':
                    func = function (val) {
                        var tabMots = valeurOption.split(',');

                        for (var x = 0; x < tabMots.length; x++) {
                            if (val == tabMots[x]) {
                                return (messageFromOption ? messageFromOption.replace('__VAL__', tabMots[x]) :
                                    'Mot interdit: "' + tabMots[x] + '"');
                            }
                        }

                        return true;
                    };
                    break;
                case 'checkFileName':
                    func = function (val) {
                        if (valeurOption.original.substr(0, valeurOption.original.lastIndexOf('.')) == val) {
                            return true;
                        } else {
                            var message = true;

                            $.ajax({
                                async: false,
                                method: 'POST',
                                url: valeurOption.url,
                                data: {
                                    chemin: valeurOption.path,
                                    nomFichier: val
                                },
                                success: function (result) {
                                    if (result != 1) {
                                        message =
                                            (messageFromOption ? messageFromOption :
                                                'Un fichier du même nom existe déjà.');
                                    }
                                }
                            });

                            return message;
                        }
                    };
                    break;

                case 'link':
                    func = function (val) {
                        var message = true, data = {
                            value: val
                        };

                        valeurOption.allow ? data.allow = valeurOption.allow : '';

                        $.ajax({
                            async: false,
                            method: 'POST',
                            data: data,
                            url: valeurOption.url,
                            success: function (result) {
                                if (result != 1) {
                                    message = (messageFromOption ? messageFromOption : 'Valeur déjà utilisée.');
                                }
                            }
                        });

                        return message;
                    };

                    break;
                case 'same':
                    func = function (val) {
                        if (val != valeurOption.val()) {
                            return (messageFromOption ? messageFromOption : 'Les valeurs ne correspondent pas');
                        }

                        return true;
                    };

                    break;
            }

            return func;
        };

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

        base.strip = function (html) {
            var tmp = document.createElement('DIV');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || "";
        };


        return base.mainFunction();
    };
})(jQuery);