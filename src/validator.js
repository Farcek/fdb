var validator = require('validator');
var Promise = require('bluebird')
var format = require('string-format')
var _ = require('lodash')


var validators = {
    alpha: {
        validator: validator.isAlpha,
        message: '`{0}` the value not alpha format '
    },
    date: {
        validator: validator.isDate,
        message: '`{0}` the value not Date '
    },
    email: {
        validator: validator.isEmail,
        message: '`{0}` the value not Email '

    },
    min: {
        validator: function (value, min) {
            return _.isNumber(value) && value > min;
        },
        message: '`{2}`-s ih utga oruul '
    },
    max: {
        validator: function (value, max) {
            return _.isNumber(value) && value < max;
        },
        message: '`{2}`-s baga utga oruul '
    },
    range: {
        validator: function (value, min, max) {
            return _.isNumber(value) && value > min && value < max;
        },
        message: '`{2}`-s {3} hoorond utga oryyl '
    },
    length: {
        validator: function () {
            return validator.isLength.apply(null, arguments)
        },
        message: function (value, model, min, max) {

            var min = '{2}-s ih utga oruulna uu'
            var max = '{3}-s baga utga oruulna uu'

            if (max) {
                return min + max;
            }
            return min
        }
    },
    unique: {
        validator: function (value, model, params) {
            return true;
        },
        message: 'burtgeltei bna'
    }
}

function buildItem(rule) {

    var message = function (msg) {
        return _.isFunction(msg) ? msg : function () {
            return msg;
        };
    }

    var buildMessage = function (defaultMessage) {

        return function (value, model, params) {
            var args = [value, model].concat(params || []);

            var message = rule.message || defaultMessage || 'Error 008800';
            var template = _.isFunction(message) ? message.apply(null, args) : message;


            return Promise.resolve(template)
                .then(function (t) {
                    return format.apply(null, [t].concat(args));
                })
        }
    }

    if (_.isString(rule.validator)) {
        var item = validators[rule.validator];

        if (item) {
            return {
                validator: function (value, model, params) {

                    return item.validator.apply(null, [value].concat(params || []))
                },
                message: buildMessage(item.message)
            }
        }
        throw  new Error(format('the `{0}` validator not found', rule.validator));
    }

    if (_.isFunction(rule.validator)) {


        return {
            validator: function (value, model, params) {
                return rule.validator.apply(null, [value, model].concat(params || []))
            },
            message: buildMessage()
        }

    }

    throw  new Error(format('not supporting validation .  rule# {0} ', rule));
}

function v(model, roles, resolve) {
    var items = [];

    resolve = resolve || function (path, model) {
        return Promise.resolve(model[path]);
    }

    function build(rule) {
        var fn = buildItem(rule);

        var p = Promise.resolve(resolve(rule.field, model))
            .then(function (value) {
                var args = [value, model].concat(rule.params || [])

                return Promise.resolve(fn.validator(value, model, rule.params))

                    .then(function (valid) {
                        if (valid) return {
                            valid: true
                        }

                        return Promise.resolve(fn.message(value, model, rule.params))

                            .then(function (message) {
                                return {
                                    valid: false,
                                    field: rule.field,
                                    message: message
                                }
                            })

                    })
            })


        items.push(p)

    }

    roles.forEach(function (rule) {
        build(rule)
    })

    return Promise.all(items)
        .filter(function (it) {
            return it.valid ? false : true
        })
        .map(function (it) {
            return {
                field: it.field,
                message: it.message
            }
        })
        .then(function (datas) {
            return {
                valid: datas.length === 0,
                errors: datas
            }
        })


}

module.exports = v