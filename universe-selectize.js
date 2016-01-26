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

    itemsSelected = _.sortBy(itemsSelected, function (item) {
        return item.label;
    });

    itemsUnselected = _.sortBy(itemsUnselected, function (item) {
        return item.label;
    });

    this.itemsSelected.set(itemsSelected);
    this.itemsUnselected.set(itemsUnselected);
};

uniSelectize.prototype.itemsSelectedAutorun = function (template) {
    template.uniSelectize.itemsSelected.get();
    var $select = $(template.find('select'));
    Meteor.defer(function () {
        $select.change();
    });
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
    var itemsUnselected = this.getItemsUnselectedFiltered();
    var itemToSelect = itemsUnselected && itemsUnselected[0];

    itemToSelect && this.selectItem(itemToSelect.value);

    if (this.multiple) {
        this.open.set(true);
    } else {
        this.open.set(false);
    }
};

uniSelectize.prototype.createItem = function (template) {
    var searchText = this.searchText.get();
    var items = this.items.get();
    var $input = $(template.find('input'));

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

    if (this.multiple) {
        Meteor.clearTimeout(this.timeoutId);
        this.open.set(true);
        $input.focus();
    } else {
        this.open.set(false);
    }
};

uniSelectize.prototype.getItemsUnselectedFiltered = function () {
    var items = this.itemsUnselected.get();
    var searchText = this.searchText.get();

    return _.filter(items, function (item) {
        if (item.label && item.label.search(new RegExp(searchText, 'i')) !== -1) {
            return true;
        }
        return false;
    });
};


uniSelectize.prototype.checkDisabled = function (template) {
    if (template.data.disabled) {
        throw new Meteor.Error('This field is disabled');
    }
};

uniSelectize.prototype.measureString = function (str, $parent) {
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

    this.transferStyles($parent, $test, [
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

uniSelectize.prototype.transferStyles = function ($from, $to, properties) {
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
        template.uniSelectize.itemsAutorun(template);
    });

    template.autorun(function () {
        template.uniSelectize.itemsSelectedAutorun(template)
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
        return template.uniSelectize.getItemsUnselectedFiltered();
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
        template.uniSelectize.checkDisabled(template);

        var $input = $(template.find('input.js-universeSelectizeInput'));
        $input.focus();

        //_getOptionsFromMethod($input.val(), null, template);
    },
    'keydown input.js-universeSelectizeInput': function (e, template) {
        var uniSelectize = template.uniSelectize;
        var itemsSelected = uniSelectize.itemsSelected.get();
        var itemsUnselected = uniSelectize.getItemsUnselectedFiltered();

        template.uniSelectize.checkDisabled(template);

        var $input = $(e.target);
        var width = template.uniSelectize.measureString($input.val(), $input) + 10;

        $input.width(width);

        switch (e.keyCode) {
            case 8: // backspace
                if ($input.val() === '') {
                    uniSelectize.removeLastItem();
                }
                uniSelectize.open.set(true);

                break;

            case 27: // escape
                $input.blur();
                break;

            case 13: // enter
                e.preventDefault();

                if ($input.val() === '') {
                    break;
                }

                if (itemsUnselected && itemsUnselected.length > 0) {
                    uniSelectize.selectFirstItem();
                    $input.val('');
                } else if (uniSelectize.create /*&& createOnBlur*/) {
                    uniSelectize.createItem(template);
                    $input.val('');
                }

                break;
        }

        if (!template.uniSelectize.multiple && itemsSelected.length) {
            return false;
        }
    },
    'keyup input.js-universeSelectizeInput': function (e, template) {
        template.uniSelectize.checkDisabled(template);

        var $el = $(e.target);
        var value = $el.val();
        template.uniSelectize.searchText.set(value);
    },
    'focus input.js-universeSelectizeInput': function (e, template) {
        template.uniSelectize.checkDisabled(template);

        template.uniSelectize.open.set(true);
        Meteor.clearTimeout(template.uniSelectize.timeoutId);
    },
    'change input.js-universeSelectizeInput': function(e, template) {
        template.uniSelectize.checkDisabled(template);

        // prevent non-autoform fields changes from submitting the form when autosave is enabled
        e.preventDefault();
        e.stopPropagation();
    },
    'blur input.js-universeSelectizeInput': function (e, template) {
        template.uniSelectize.checkDisabled(template);

        template.uniSelectize.timeoutId = Meteor.setTimeout(function () {
            template.uniSelectize.open.set(false);
        }, 500);
    },
    'click .selectize-dropdown-content > div:not(.create)': function (e, template) {
        e.preventDefault();
        template.uniSelectize.checkDisabled(template);
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
        template.uniSelectize.checkDisabled(template);
        var $input = $(template.find('input'));

        template.uniSelectize.createItem(template);
        $input.val('');
    },
    'click .remove': function (e, template) {
        e.preventDefault();
        template.uniSelectize.checkDisabled(template);

        template.uniSelectize.unselectItem(this.value);
    }
});
