/* Meteor need globals */
/* eslint strict: 0 */

UniSelectize = function (options) {
    this.items           = new ReactiveVar([]);
    this.itemsSelected   = new ReactiveVar([]);
    this.itemsUnselected = new ReactiveVar([]);

    this.open          = new ReactiveVar(false);
    this.searchText    = new ReactiveVar();
    this.activeOption  = new ReactiveVar(-1);
    this.inputPosition = new ReactiveVar(-1);

    this.create       = options.create;
    this.multiple     = options.multiple;
    this.placeholder  = options.placeholder;
    this.removeButton = options.removeButton !== false;
    this.createMethod = options.createMethod;
};

UniSelectize.prototype.setItems = function (items, value) {
    if (!_.isArray(items)) {
        console.warn('invalid options format');
    }

    var values = value && (_.isArray(value) ? value : [value]);

    items = _.filter(items, function (item) {
        if (!item.value || !item.label) {
            console.info('invalid option', item);
            return false;
        }
        return true;
    });

    var itemValues = items.map(function (item) {
        return item.value;
    });

    _.each(values, function (val) {
        if (!_.contains(itemValues, val) && val) {
            items.push({
                value: val,
                label: val
            });
        }
    });

    _.each(items, function (item) {
        if (_.contains(values, item.value)) {
            item.selected = true;
        }
    });

    this.items.set(items);
};

UniSelectize.prototype.itemsAutorun = function () {
    var items           = this.items.get();
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

    var itemsSelectedPrev = this.itemsSelected.get();
    if (!_.isEqual(itemsSelectedPrev, itemsSelected)) {
        this.itemsSelected.set(itemsSelected);
    }

    this.itemsUnselected.set(itemsUnselected);
};

UniSelectize.prototype.itemsSelectedAutorun = function (template) {
    var itemsSelected = template.uniSelectize.itemsSelected.get();
    var $select = $(template.find('select'));
    Meteor.defer(function () {
        $select.change();
    });

    template.uniSelectize.inputPosition.set(itemsSelected.length - 1);
};

UniSelectize.prototype.inputFocus = function (template) {
    Meteor.defer(function () {
        var $input = $(template.find('input'));
        $input.focus();
    });
};

UniSelectize.prototype.selectItem = function (value) {
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

UniSelectize.prototype.unselectItem = function (value) {
    var items = this.items.get();

    _.each(items, function (item) {
        if (item.value === value) {
            item.selected = false;
        }
    });

    this.setItems(items);
};

UniSelectize.prototype.removeItemBeforeInput = function () {
    var items = this.itemsSelected.get();
    var inputPosition = this.inputPosition.get();
    var itemToRemove;

    _.each(items, function (item, index) {
        if (index === inputPosition) {
            itemToRemove = item;
        }
    });

    if (itemToRemove) {
        this.unselectItem(itemToRemove.value);
    }
};

UniSelectize.prototype.removeItemAfterInput = function () {
    var items = this.itemsSelected.get();
    var inputPosition = this.inputPosition.get();
    var itemToRemove;

    _.each(items, function (item, index) {
        if (index === inputPosition + 1) {
            itemToRemove = item;
        }
    });

    if (itemToRemove) {
        this.unselectItem(itemToRemove.value);
    }
};

UniSelectize.prototype.selectActiveItem = function (template) {
    var itemsUnselected = this.getItemsUnselectedFiltered();
    var activeOption = this.activeOption.get();
    var itemToSelect = itemsUnselected && itemsUnselected[activeOption];

    if (activeOption === itemsUnselected.length && this.create) {
        this.createItem(template);
        return;
    }

    itemToSelect && this.selectItem(itemToSelect.value);

    if (this.multiple) {
        this.open.set(true);
        this.inputFocus(template);
    } else {
        this.open.set(false);
    }
};

UniSelectize.prototype.createItem = function (template) {
    var self = this;
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

    if (template.uniSelectize.createMethod) {
        Meteor.call(template.uniSelectize.createMethod, searchText, searchText, function () {
            var itemsSelected = self.itemsSelected.get();
            Meteor.defer(function () {
                _.each(itemsSelected, function (item) {
                    self.selectItem(item.value);
                });
                self.inputFocus(template);
            });
        });
    }

    if (!_.find(items, function (obj) {
            return obj.value === searchText;
        })) {
        items.push(item);
    }

    this.setItems(items, searchText);

    this.searchText.set('');

    if (this.multiple) {
        this.inputFocus(template);
    } else {
        this.open.set(false);
    }
};

UniSelectize.prototype.getItemsUnselectedFiltered = function () {
    var items = this.itemsUnselected.get();
    var searchText = this.searchText.get();

    return _.filter(items, function (item) {
        if (item.label && item.label.search(new RegExp(searchText, 'i')) !== -1) {
            return true;
        }
        return false;
    });
};


UniSelectize.prototype.checkDisabled = function (template) {
    if (template.data.disabled) {
        throw new Meteor.Error('This field is disabled');
    }
};

UniSelectize.prototype.measureString = function (str, $parent) {
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

UniSelectize.prototype.transferStyles = function ($from, $to, properties) {
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
    template.uniSelectize = new UniSelectize(template.data);
});

Template.universeSelectize.onRendered(function () {
    var template = this;

    template.autorun(function () {
        var data = Template.currentData();
        var value   = data.value;
        var options = data.options;
        template.uniSelectize.setItems(options, value);
    });

    template.autorun(function () {
        template.uniSelectize.itemsAutorun(template);
    });

    template.autorun(function () {
        template.uniSelectize.itemsSelectedAutorun(template)
    });
});

Template.universeSelectize.helpers({
    multiple: function () {
        var template = Template.instance();
        return template.uniSelectize.multiple;
    },
    removeButton: function () {
        var template = Template.instance();
        return template.uniSelectize.multiple && template.uniSelectize.removeButton;
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
    },
    inputPosition: function (position) {
        var template = Template.instance();
        var inputPosition = template.uniSelectize.inputPosition.get();
        return position === inputPosition;
    },
    activeOption: function (position) {
        var template = Template.instance();
        var activeOption = template.uniSelectize.activeOption.get();
        var itemsUnselected = template.uniSelectize.getItemsUnselectedFiltered();
        var createOption = template.uniSelectize.create;

        if (activeOption === itemsUnselected.length && createOption) {
            return position === 'create';
        }

        return position === activeOption;
    },
    getPlaceholder: function () {
        var template = Template.instance();
        var itemsSelected = template.uniSelectize.itemsSelected.get();

        if (itemsSelected.length) {
            return false;
        }

        return template.uniSelectize.placeholder;
    }
});


Template.universeSelectize.events({
    'click .selectize-input': function (e, template) {
        template.uniSelectize.checkDisabled(template);
        template.uniSelectize.inputFocus(template);

        //_getOptionsFromMethod($input.val(), null, template);
    },
    'keydown input.js-universeSelectizeInput': function (e, template) {
        var uniSelectize = template.uniSelectize;
        var itemsSelected = uniSelectize.itemsSelected.get();
        var itemsUnselected = uniSelectize.getItemsUnselectedFiltered();
        var inputPosition = uniSelectize.inputPosition.get();
        var activeOption = uniSelectize.activeOption.get();

        template.uniSelectize.checkDisabled(template);

        var $input = $(e.target);
        var width = template.uniSelectize.measureString($input.val(), $input) + 10;

        $input.width(width);

        switch (e.keyCode) {
            case 8: // backspace
                //e.preventDefault();
                //e.stopPropagation();
                if ($input.val() === '') {
                    uniSelectize.removeItemBeforeInput();
                }
                uniSelectize.open.set(true);
                uniSelectize.inputFocus(template);

                break;

            case 46: // delete
                if ($input.val() === '') {
                    uniSelectize.removeItemAfterInput();
                }
                uniSelectize.open.set(true);
                uniSelectize.inputFocus(template);

                break;

            case 27: // escape
                $input.blur();
                break;

            case 13: // enter
                e.preventDefault();

                if (activeOption === -1 && $input.val() === '') {
                    break;
                }

                if (itemsUnselected && itemsUnselected.length > 0) {
                    uniSelectize.selectActiveItem(template);
                    $input.val('');
                } else if (uniSelectize.create /*&& createOnBlur*/) {
                    uniSelectize.createItem(template);
                    $input.val('');
                }

                break;
            case 37:    // left
                if (!uniSelectize.multiple) {
                    break;
                }
                if (inputPosition > -1) {
                    uniSelectize.inputPosition.set(inputPosition - 1);
                    uniSelectize.inputFocus(template);
                }
                break;
            case 39:    // right
                if (!uniSelectize.multiple) {
                    break;
                }
                if (inputPosition < itemsSelected.length - 1) {
                    uniSelectize.inputPosition.set(inputPosition + 1);
                    uniSelectize.inputFocus(template);
                }
                break;
            case 38:    // up
                if (activeOption > -1) {
                    uniSelectize.activeOption.set(activeOption - 1);
                }
                break;
            case 40:    // down
                if (activeOption < itemsUnselected.length - 1 ||
                    (activeOption < itemsUnselected.length && uniSelectize.create)) {
                    uniSelectize.activeOption.set(activeOption + 1);
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
            template.uniSelectize.inputFocus(template);
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
