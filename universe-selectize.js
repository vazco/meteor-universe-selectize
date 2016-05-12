/* Meteor need globals */
/* eslint strict: 0 */
/* jshint strict: false */

UniSelectize = function (options, template) {
    this.items           = new ReactiveVar([]);
    this.itemsSelected   = new ReactiveVar([]);
    this.itemsUnselected = new ReactiveVar([]);

    this.open                = new ReactiveVar(false);
    this.loading             = new ReactiveVar(false);
    this.searchText          = new ReactiveVar();
    this.activeOption        = new ReactiveVar(-1);
    this.inputPosition       = new ReactiveVar(-1);
    this.optionsMethodParams = new ReactiveVar();

    this.create             = options.create;
    this.template           = template;
    this.multiple           = options.multiple;
    this.sortMethod         = _.isUndefined(options.sortMethod) ? 'label' : options.sortMethod;
    this.placeholder        = options.placeholder;
    this.removeButton       = options.removeButton !== false;
    this.createMethod       = options.createMethod;
    this.optionsMethod      = options.optionsMethod;
    this.optionsPlaceholder = options.optionsPlaceholder;

};

UniSelectize.prototype.triggerChangeEvent = function() {
    var self = this;
    Meteor.defer(function () {
        $(self.template.find('select')).change();
    });
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

UniSelectize.prototype.addItems = function (newItems, value) {
    if (!_.isArray(newItems)) {
        console.warn('invalid options format');
    }

    var values = value && (_.isArray(value) ? value : [value]);
    var items = this.items.get();
    var itemsValues = items.map(function (item) {
        return item.value;
    });

    _.each(newItems, function (newItem) {
        if (!newItem.value || !newItem.label) {
            console.info('invalid option', newItem);
            return;
        }

        if (!_.contains(itemsValues, newItem.value)) {
            var item = {
                value: newItem.value,
                label: newItem.label,
                selected: newItem.selected
            };

            if (_.contains(values, newItem.value)) {
                item.selected = true;
            }

            items.push(item);
        } else if (typeof newItem.selected !== 'undefined') {
            var item = _.find(items, function (item) {
                return item.value === newItem.value;
            });
            item.selected = newItem.selected;
        }
    });

    this.items.set(items);
};


UniSelectize.prototype.removeUnusedItems = function (newItems) {
    if (!_.isArray(newItems)) {
        console.warn('invalid options format');
    }

    var items = this.items.get();
    var newItemsValues = newItems.map(function (item) {
        return item.value;
    });

    items = _.filter(items, function (item) {
        return _.contains(newItemsValues, item.value) || item.selected;
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

    itemsSelected = _.sortBy(itemsSelected, this.sortMethod);

    itemsUnselected = _.sortBy(itemsUnselected, this.sortMethod);

    var itemsSelectedPrev = this.itemsSelected.get();
    if (!_.isEqual(itemsSelectedPrev, itemsSelected)) {
        this.itemsSelected.set(itemsSelected);
    }

    if (this.placeholder && this.optionsPlaceholder) {
        itemsUnselected.unshift({
            value: '',
            label: _.isString(this.optionsPlaceholder) ? this.optionsPlaceholder: this.placeholder
        });
    }

    this.itemsUnselected.set(itemsUnselected);
};

UniSelectize.prototype.itemsSelectedAutorun = function () {
    var itemsSelected = template.uniSelectize.itemsSelected.get();
    this.template.uniSelectize.inputPosition.set(itemsSelected.length - 1);
};

UniSelectize.prototype.inputFocus = function () {
    var self = this;
    Meteor.defer(function () {
        var $input = $(self.template.find('input'));
        $input.focus();
    });
};

UniSelectize.prototype.selectItem = function (value) {
    var items = this.items.get();
    var multiple = this.multiple;

    _.each(items, function (item) {
        if (value === '') {
            item.selected = false;
        } else if (item.value === value) {
            item.selected = true;
        } else if (!multiple) {
            item.selected = false;
        }
    });

    this.setItems(items);
    this.triggerChangeEvent();
};

UniSelectize.prototype.unselectItem = function (value, reset) {
    var items = this.items.get();

    _.each(items, function (item) {
        if (item.value === value || reset) {
            item.selected = false;
        }
    });

    this.setItems(items);
    this.triggerChangeEvent()
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
        this.unselectItem(itemToRemove.value, false);
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
        this.unselectItem(itemToRemove.value, false);
    }
};

UniSelectize.prototype.selectActiveItem = function (template) {
    var itemsUnselected = this.getItemsUnselectedFiltered();
    var activeOption = this.activeOption.get();
    var itemToSelect = itemsUnselected && itemsUnselected[activeOption];

    if (activeOption === itemsUnselected.length && this.create) {
        this.createItem();
        return;
    }

    itemToSelect && this.selectItem(itemToSelect.value);

    if (this.multiple) {
        this.open.set(true);
        this.inputFocus();
    } else {
        this.open.set(false);
    }
};

UniSelectize.prototype.insertItem = function (item) {
    var items = this.items.get();

    if (!_.find(items, function (obj) {
            if (obj.value === item.value) {
                obj.selected = item.selected;
                return true;
            }
            return false;
        })) {
        items.push(item);
    }

    this.setItems(items);
    this.triggerChangeEvent();
};

UniSelectize.prototype.createItem = function () {
    var self = this;
    var template = this.template;
    var searchText = this.searchText.get();

    if (!searchText) {
        return false;
    }

    var item = {
        label: searchText,
        value: searchText,
        selected: true
    };

    if (template.uniSelectize.createMethod) {
        Meteor.call(template.uniSelectize.createMethod, searchText, searchText, function (error, value) {
            if (error) {
                console.error('universe selectize create method error:', error);
                return;
            }

            Meteor.defer(function () {
                item.value = value || item.value;
                self.insertItem(item);
            });
        });
    } else {
        this.insertItem(item);
    }

    if (this.multiple) {
        this.inputFocus();
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


UniSelectize.prototype.checkDisabled = function () {
    if (this.template.data.disabled) {
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

UniSelectize.prototype.getOptionsFromMethod = function (values) {
    var self = this;
    var methodName = this.optionsMethod;
    var searchText = this.searchText.get();
    var params = this.optionsMethodParams.get();

    if (!methodName) {
        return false;
    }

    var searchVal = {
        searchText: searchText,
        values: values || [],
        params: params || null
    };

    self.loading.set(true);
    Meteor.call(methodName, searchVal, function (err, options) {
        self.loading.set(false);
        if (params) {
            self.removeUnusedItems(options);
        }
        self.addItems(options, values);
    });
};

Template.universeSelectize.onCreated(function () {
    var template = this;
    template.uniSelectize = new UniSelectize(template.data, template);
});

Template.universeSelectize.onRendered(function () {
    var template = this;

    template.autorun(function () {
        var data = Template.currentData();
        var value = data.value;

        if (template.uniSelectize.optionsMethod) {
            template.uniSelectize.getOptionsFromMethod(value);
        } else {
            var options = data.options;
            template.uniSelectize.setItems(options, value);
        }
    });

    template.autorun(function () {
        template.uniSelectize.itemsAutorun(template);
    });

    template.autorun(function () {
        template.uniSelectize.itemsSelectedAutorun(template);
    });

    template.autorun(function () {
        var data = Template.currentData();
        var methodParams = data.optionsMethodParams;
        var params = _.isFunction(methodParams) ? methodParams() : methodParams;

        template.uniSelectize.optionsMethodParams.set(params);
    });

    this.form = $(template.find('select')).parents('form');
    this.form.bind('reset', function () {
        template.uniSelectize.unselectItem(null, true);
    });
});

Template.universeSelectize.onDestroyed(function () {
    if (this.form) {
        this.form.unbind('reset');
    }
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
    loading: function () {
        var template = Template.instance();
        return template.uniSelectize.loading.get();
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
    },
    isPlaceholder: function () {
        return this.value === '' ? 'uniPlaceholder' : '';
    }
});


Template.universeSelectize.events({
    'click .selectize-input': function (e, template) {
        template.uniSelectize.checkDisabled();
        template.uniSelectize.inputFocus(template);

        template.uniSelectize.getOptionsFromMethod();
    },
    'keydown input.js-universeSelectizeInput': function (e, template) {
        var uniSelectize = template.uniSelectize;
        var itemsSelected = uniSelectize.itemsSelected.get();
        var itemsUnselected = uniSelectize.getItemsUnselectedFiltered();
        var inputPosition = uniSelectize.inputPosition.get();
        var activeOption = uniSelectize.activeOption.get();

        template.uniSelectize.checkDisabled();

        var $input = $(e.target);
        var width = template.uniSelectize.measureString($input.val(), $input) + 10;

        $input.width(width);

        switch (e.keyCode) {
            case 8: // backspace
                if ($input.val() === '') {
                    e.preventDefault();
                    uniSelectize.removeItemBeforeInput();
                }
                uniSelectize.open.set(true);
                uniSelectize.inputFocus();

                break;

            case 46: // delete
                if ($input.val() === '') {
                    uniSelectize.removeItemAfterInput();
                }
                uniSelectize.open.set(true);
                uniSelectize.inputFocus();

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
                    uniSelectize.searchText.set('');
                    $input.val('');
                } else if (uniSelectize.create /*&& createOnBlur*/) {
                    uniSelectize.createItem();
                    uniSelectize.searchText.set('');
                    $input.val('');
                }

                break;
            case 37:    // left
                if (!uniSelectize.multiple) {
                    break;
                }
                if (inputPosition > -1) {
                    uniSelectize.inputPosition.set(inputPosition - 1);
                    uniSelectize.inputFocus();
                }
                break;
            case 39:    // right
                if (!uniSelectize.multiple) {
                    break;
                }
                if (inputPosition < itemsSelected.length - 1) {
                    uniSelectize.inputPosition.set(inputPosition + 1);
                    uniSelectize.inputFocus();
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
        template.uniSelectize.checkDisabled();

        var $el = $(e.target);
        var value = $el.val();
        template.uniSelectize.searchText.set(value);
        template.uniSelectize.getOptionsFromMethod();
    },
    'focus input.js-universeSelectizeInput': function (e, template) {
        template.uniSelectize.checkDisabled();
        template.uniSelectize.open.set(true);

        Meteor.clearTimeout(template.uniSelectize.timeoutId);
    },
    'change input.js-universeSelectizeInput': function(e, template) {
        template.uniSelectize.checkDisabled();

        // prevent non-autoform fields changes from submitting the form when autosave is enabled
        e.preventDefault();
        e.stopPropagation();
    },
    'blur input.js-universeSelectizeInput': function (e, template) {
        template.uniSelectize.checkDisabled();

        template.uniSelectize.timeoutId = Meteor.setTimeout(function () {
            template.uniSelectize.open.set(false);
        }, 500);
    },
    'click .selectize-dropdown-content > div:not(.create)': function (e, template) {
        e.preventDefault();
        template.uniSelectize.checkDisabled();
        var $input = $(template.find('input'));
        var itemsUnselected = template.uniSelectize.getItemsUnselectedFiltered();
        var itemsUnselectedLength = itemsUnselected && itemsUnselected.length;

        template.uniSelectize.selectItem(this.value);
        template.uniSelectize.searchText.set('');
        $input.val('');

        if (template.uniSelectize.multiple && itemsUnselectedLength && this.value) {
            template.uniSelectize.inputFocus();
        } else {
            template.uniSelectize.open.set(false);
        }
    },
    'mouseenter .selectize-dropdown-content > div': function (e, template) {
        var $el = $(e.target);
        var elIndex = $el.attr('data-index');
        var itemsUnselected = template.uniSelectize.getItemsUnselectedFiltered();

        if (elIndex === 'create') {
            elIndex = itemsUnselected.length;
        } else {
            elIndex = parseInt(elIndex);
        }

        template.uniSelectize.activeOption.set(elIndex);
    },
    'click .create': function (e, template) {
        e.preventDefault();
        template.uniSelectize.checkDisabled();
        var $input = $(template.find('input'));

        template.uniSelectize.createItem();
        template.uniSelectize.searchText.set('');
        $input.val('');
    },
    'click .remove': function (e, template) {
        e.preventDefault();
        template.uniSelectize.checkDisabled();

        template.uniSelectize.unselectItem(this.value, false);
    }
});
