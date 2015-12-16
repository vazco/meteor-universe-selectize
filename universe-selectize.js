'use strict';

var uniSelectize = function (options) {
    this.items           = new ReactiveVar([]);
    this.itemsSelected   = new ReactiveVar([]);
    this.itemsUnselected = new ReactiveVar([]);
    this.searchText      = new ReactiveVar();
    this.open            = new ReactiveVar(false);

    this.multiple = options.multiple;
    this.create   = options.create;
};

uniSelectize.prototype.setItems = function (items) {
    if (!_.isArray(items)) {
        console.warn('invalid options format');
    }

    items = _.filter(items, function (item) {
        if (!item.value || !item.label) {
            console.info('invalid option', item);
            return false;
        }
        return true;
    });

    this.items.set(items);
};

uniSelectize.prototype.itemsAutorun = function () {
    var items = this.items.get();
    var itemsSelected   = [];
    var itemsUnselected = [];

    _.each(items, function (item) {
        if (item.selected) {
            itemsSelected.push(item);
        } else {
            itemsUnselected.push(item);
        }
    });

    this.itemsSelected.set(itemsSelected);
    this.itemsUnselected.set(itemsUnselected);
};

uniSelectize.prototype.selectItem = function (value) {
    var items = this.items.get();
    var multiple = this.multiple;

    _.each(items, function (item) {
        if (item.value === value) {
            item.selected = true;
        } else if (!multiple) {
            item.selected = false;
        }
    });

    this.setItems(items);
};

uniSelectize.prototype.unselectItem = function (value) {
    var items = this.items.get();

    _.each(items, function (item) {
        if (item.value === value) {
            item.selected = false;
        }
    });

    this.setItems(items);
};

uniSelectize.prototype.removeLastItem = function () {
    var items = this.itemsSelected.get();
    var last;

    _.each(items, function (item) {
        last = item;
    });

    this.unselectItem(last.value);
};

uniSelectize.prototype.selectFirstItem = function () {
    var itemsUnselected = this.itemsUnselected.get();
    var itemToSelect = itemsUnselected && itemsUnselected[0];

    itemToSelect && this.selectItem(itemToSelect.value);
};

uniSelectize.prototype.createItem = function () {
    var searchText = this.searchText.get();
    var items = this.items.get();

    if (!searchText) {
        return false;
    }

    var item = {
        label: searchText,
        value: searchText
    };

    if (!_.find(items, function (obj) {
            return obj.value === searchText;
        })) {
        items.push(item);
    }

    this.setItems(items);
    this.selectItem(searchText);

    this.searchText.set('');
};



Template.universeSelectize.onCreated(function () {
    var template = this;
    template.uniSelectize = new uniSelectize(template.data);
});

Template.universeSelectize.onRendered(function () {
    var template = this;

    template.autorun(function () {
        var data = Template.currentData();
        var options = data.options;

        template.uniSelectize.setItems(options);
    });

    template.autorun(function () {
        template.uniSelectize.itemsAutorun();
    });
});


Template.universeSelectize.helpers({
    multipleClass: function () {
        var template = Template.instance();
        return template.uniSelectize.multiple ? 'multi' : 'single';
    },
    removeClass: function () {
        var template = Template.instance();
        return template.uniSelectize.multiple ? 'plugin-remove_button' : '';
    },
    getItems: function () {
        var template = Template.instance();
        return template.uniSelectize.items.get();
    },
    getItemsSelected: function () {
        var template = Template.instance();
        return template.uniSelectize.itemsSelected.get();
    },
    getItemsUnselected: function () {
        var template = Template.instance();
        var items = template.uniSelectize.itemsUnselected.get();
        var searchText = template.uniSelectize.searchText.get();

        return _.filter(items, function (item) {
            if (item.label && item.label.search(new RegExp(searchText, 'i')) !== -1) {
                return true;
            }
            return false;
        });
    },
    getSearchText: function () {
        var template = Template.instance();
        return template.uniSelectize.searchText.get();
    },
    open: function () {
        var template = Template.instance();
        return template.uniSelectize.open.get();
    }
});


Template.universeSelectize.events({
    'click .selectize-input': function (e, template) {
        //_checkDisabled(template);

        var $input = $(template.find('input.js-universeSelectizeInput'));
        $input.focus();

        //_getOptionsFromMethod($input.val(), null, template);
    },
    'keydown input.js-universeSelectizeInput': function (e, template) {
        var uniSelectize = template.uniSelectize;
        var itemsUnselected = uniSelectize.itemsUnselected.get();
        var itemsSelected = uniSelectize.itemsSelected.get();

        _checkDisabled(template);

        var $input = $(e.target);
        var width = _measureString($input.val(), $input) + 10;

        var $createItem = $(template.find('.selectize-dropdown-content > div.create'));

        $input.width(width);

        switch (e.keyCode) {
            case 8: // backspace
                if ($input.val() === '') {
                    uniSelectize.removeLastItem();
                }

                break;

            case 27: // escape
                $input.blur();
                break;

            case 13: // enter
                e.preventDefault();

                if ($input.val() === '') {
                    break;
                }

                if (itemsUnselected.length === 1) {
                    uniSelectize.selectFirstItem();
                    $input.val('');
                } else if (uniSelectize.create) {
                    uniSelectize.createItem();
                    $input.val('');
                }

                break;
        }

        if (!template.uniSelectize.multiple && itemsSelected.length) {
            return false;
        }
    },
    'keyup input.js-universeSelectizeInput': function (e, template) {
        _checkDisabled(template);

        var $el = $(e.target);
        var value = $el.val();
        template.uniSelectize.searchText.set(value);
    },
    'focus input.js-universeSelectizeInput': function (e, template) {
        _checkDisabled(template);

        template.uniSelectize.open.set(true);
        Meteor.clearTimeout(template.uniSelectize.timeoutId);
    },
    'change input.js-universeSelectizeInput': function(e, template) {
        _checkDisabled(template);

        // prevent non-autoform fields changes from submitting the form when autosave is enabled
        e.preventDefault();
        e.stopPropagation();
    },
    'blur input.js-universeSelectizeInput': function (e, template) {
        _checkDisabled(template);

        template.uniSelectize.timeoutId = Meteor.setTimeout(function () {
            template.uniSelectize.open.set(false);
        }, 500);
    },
    'click .selectize-dropdown-content > div:not(.create)': function (e, template) {
        e.preventDefault();
        _checkDisabled(template);
        var $input = $(template.find('input'));

        template.uniSelectize.selectItem(this.value);
        $input.val('');

        if (template.uniSelectize.multiple) {
            Meteor.clearTimeout(template.uniSelectize.timeoutId);
            template.uniSelectize.open.set(true);
            $input.focus();
        } else {
            template.uniSelectize.open.set(false);
        }
    },
    'click .create': function (e, template) {
        e.preventDefault();
        _checkDisabled(template);
        var $input = $(template.find('input'));

        template.uniSelectize.createItem();
        $input.val('');

        if (template.uniSelectize.multiple) {
            Meteor.clearTimeout(template.uniSelectize.timeoutId);
            template.uniSelectize.open.set(true);
            $input.focus();
        } else {
            template.uniSelectize.open.set(false);
        }
    },
    'click .remove': function (e, template) {
        e.preventDefault();
        _checkDisabled(template);

        template.uniSelectize.unselectItem(this.value);
    }
});


var _checkDisabled = function (template) {
    if (template.data.disabled) {
        throw new Meteor.Error('This field is disabled');
    }
};




// from selectize utils https://github.com/brianreavis/selectize.js/blob/master/src/utils.js

var _measureString = function (str, $parent) {
    if (!str) {
        return 0;
    }

    var $test = $('<test>').css({
        position: 'absolute',
        top: -99999,
        left: -99999,
        width: 'auto',
        padding: 0,
        whiteSpace: 'pre'
    }).text(str).appendTo('body');

    _transferStyles($parent, $test, [
        'letterSpacing',
        'fontSize',
        'fontFamily',
        'fontWeight',
        'textTransform'
    ]);

    var width = $test.width();
    $test.remove();

    return width;
};

var _transferStyles = function ($from, $to, properties) {
    var i, n, styles = {};

    if (properties) {
        for (i = 0, n = properties.length; i < n; i++) {
            styles[properties[i]] = $from.css(properties[i]);
        }
    } else {
        styles = $from.css();
    }

    $to.css(styles);
};
