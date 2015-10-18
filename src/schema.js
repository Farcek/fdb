var helper = require('./helper');
var Model = require('./model');
var Field = require('./field');
var Query = require('./query');

var _ = require('lodash');
var util = require('util');

var Promise = require('bluebird');

function Schema(name, options) {
    this.$name = name;
    this.$options = options;

    // --- init
    this.$fields = {};


}

helper.mixin(Schema.prototype, ['name', 'options', 'container', 'dbName', 'privateTmp', 'knex']);
helper.mixin(Schema.prototype, ['on', 'emit']);

Schema.prototype.model = function () {
    if (this.$model) return this.$model;
    // create model class
    var model = this.$model = function () {
        Model.apply(this, arguments)
    }
    util.inherits(model, Model);

    model.prototype.$schema = this;
    model.prototype.$container = this.container();
    model.prototype.$knex = this.knex();

    return model;
}

Schema.prototype.instanceof = function (obj) {
    return obj && obj instanceof  this.model();
}

//<editor-fold desc="field">


Schema.prototype.add = function (name, type, options) {
    if (this.$fields[name]) throw new Error('`' + name + '` the named field already defined');

    // raw field add
    if (type instanceof Field) {
        this.$fields[type.name()] = type;
        type.$schema = this;
        return this;
    }

    var container = this.container();

    function lockupType(type) {
        if (type === String) return container.field('string');
        if (type === Number) return container.field('float');
        if (type === Boolean) return container.field('boolean');
        if (type === Date) return container.field('datetime');
        if (type === Object) return container.field('json');
        if (_.isString(type)) return container.field(type);
        if (Field.isField(type)) return type;

        throw new Error('not supported field type');
    }

    var fieldClass = lockupType(type);

    var field = this.$fields[name] = new fieldClass(name, options);
    field.$schema = this;

    Object.defineProperty(this.model().prototype, field.name(), {
        get: function () {
            return this.get(field.name())
        },
        set: function (value) {
            this.set(field.name(), value)
            return this;
        }
    });


    return this;

}

Schema.prototype.hasField = function (name) {
    return this.$fields[name] ? true : false
}

Schema.prototype.field = function (name) {
    if (this.$fields[name]) return this.$fields[name];
    throw new Error('not found field. find name = ' + name)
}
Schema.prototype.pk = function () {
    var self = this;
    if (self.$__pk__) return self.$__pk__;

    self.$eachFields(function (f) {
        if (f.isPrimaryKey()) self.$__pk__ = f;
    })

    if (self.$__pk__) return self.$__pk__;

    throw new Error('not found pk filed. schema name=' + self.name());
}
//</editor-fold>

//<editor-fold desc="eachFields">
Schema.prototype.$eachFields = function (iter) {
    for (var k in this.$fields) {
        var r = iter(this.$fields[k], k, this.$fields);
        if (r === false) break;
    }

    return this;
}
//</editor-fold>

//<editor-fold desc="init">
Schema.prototype.init = function (callback) {
    var self = this;
    return helper.promise(callback, function () {

        return self.knex().schema
            .hasTable(self.dbName())
            .then(function (has) {
                if (has) return false;
                return self.knex().schema
                    .createTable(self.dbName(), function (table) {
                        self.$eachFields(function (field) {
                            if (field.isVirtual()) return;
                            field.$create(table);
                        })
                    })

            })
            .then(function (setup) {
                if (setup)
                    return self.emit('postSetup', self)
                return true
            })
            .then(function () {
                return self.emit('postDefine', self)

            })
            .then(function () {
                return self
            })


    })
}
//</editor-fold>


//<editor-fold desc="create">
Schema.prototype.create = function (data, callback) {
    var self = this, model = new (this.model())();

    model.$loadData(data)


    return helper.promise(callback, function () {

        return self.emit('postCreate', model)
            .then(function () {
                model.$$postCreate = true;
                return model;
            })
    });
}
//</editor-fold>
//<editor-fold desc="load">
Schema.prototype.load = function (data) {
    var self = this, model = new (this.model())();

    model
        .$loadDBData(data)
        .$setExists();

    return self.emit('postLoad', model)
        .then(function () {
            model.$$postLoad = true
            return model;
        });

}
Schema.prototype.loads = function (dataArray) {
    return Promise.map(dataArray, function (dbRow) {
        return self.schema().load(dbRow);
    })

}
//</editor-fold>

//<editor-fold desc="query">
Schema.prototype.from = function () {
    return this.knex()(this.dbName());
}
Schema.prototype.createQuery = function () {
    return new Query(this, this.knex());
}
Schema.prototype.select = Schema.prototype.createQuery;


Schema.prototype.where = function () {
    var q = this.createQuery();
    return q.where.apply(q, Array.prototype.slice.call(arguments));
}
Schema.prototype.count = function (field) {
    var q = this.createQuery();
    return q.count(field);
}
Schema.prototype.findById = function (id) {
    var pk = this.pk();

    return pk.where(this.createQuery(), id)
        .first()
        .result()
        .then(function (model) {
            if (model) return model;
            throw new Error('not found model. find by id = `' + id + '`');
        })
}
Schema.prototype.pkWhere = function (q, model) {
    var pk = this.pk();
    pk.where(q, model.get(pk.name()), model);
}
//</editor-fold>

//<editor-fold desc="deny names">
Schema.prototype.modelDenyNames = function () {
    var names = this.privateTmp().modelDenyNames;
    if (names) return names;

    names = this.privateTmp().modelDenyNames = [];

    names.concat(Object.keys(this.model().prototype));
    names.concat(Object.keys(this.model().super_.prototype));


    return names;
}
Schema.prototype.schemaDenyNames = function () {
    var names = this.privateTmp().schemaDenyNames;
    if (names) return names;

    names = this.privateTmp().schemaDenyNames = [];

    names.concat(Object.keys(Schema.prototype));
    //names.concat(Object.keys(this.model().super_.prototype));


    return names;
}
//</editor-fold>

/**
 * Module custom method add
 * @param name
 * @param handler
 */
Schema.prototype.method = function (name, handler) {
    if (arguments.length == 1 && _.isPlainObject(name)) {
        for (var it in name) {
            this.method(it, name[it])
        }
        return this;
    }

    if (name in this.modelDenyNames()) throw new Error('not allow name, request name=' + name);


    this.model().prototype[name] = handler;

    return this;

}

/**
 * Schema custom method add
 * @param name
 * @param handler
 */
Schema.prototype.static = function (name, handler) {
    if (arguments.length == 1 && _.isPlainObject(name)) {
        for (var it in name) {
            this.static(it, name[it])
        }
        return;
    }

    if (name in this.schemaDenyNames()) throw new Error('not allow name, request name=' + name);

    this[name] = handler;
}

//<editor-fold desc="validation">
Schema.prototype.$buildValidator = function (groups) {


    var self = this, results = self.privateTmp()._validators_ || [];


    self.$eachFields(function (f) {
        results = results.concat(f.validators(groups))
    })

    return results;

}

Schema.prototype.isValid = function (model, groups, callback) {
    var self = this;
    if (_.isFunction(groups)) {
        callback = groups;
        groups = undefined;
    }

    var rules = self.$buildValidator(groups);
    var validator = self.container().validator();

    return helper.promise(callback, function () {

        return validator(model, rules)
            .then(function (r) {
                return r
            })
    })
}

Schema.prototype.addValidation_sdf654sd6f5s4df6s54df6 = function (field, validator, params, message, groups) {
    var self = this;

    if (arguments.length === 1 && _.isArray(field)) {
        _.forEach(field, function (it) {
            self.addValidation(it.field, it.validator, it.params, it.message, it.groups)
        })
        return self
    }
    if (arguments.length === 1 && _.isObject(field)) {
        self.addValidation(field.field, field.validator, field.params, field.message, field.groups)
        return self
    }

    var validators = self.privateTmp()._validators_ || (self.privateTmp()._validators_ = []);

    validators.push({
        field: field,
        validator: validator,
        params: params,
        message: message,
        groups: groups
    })

}

Schema.prototype.validation = function (groups) {
    var self = this;
    return function (req, res, next) {
        var rules = self.$buildValidator(groups);
        var validator = self.container().validator();


        validator(req.body, rules)
            .then(function (result) {
                if (result.valid) return next();

                next({
                    message: ' not validated',
                    errors: result.errors
                })
            }, next);
    }
};
//</editor-fold>

Schema.prototype.plugin = function (plugin, options) {
    if (_.isFunction(plugin)) {
        plugin(this, options)
        return this;
    }
    throw  new Error('not supported plugin. request plugin : ' + plugin);
}


Schema.prototype.transaction = function (handler) {
    return this.container().transaction(handler);
}


module.exports = Schema;