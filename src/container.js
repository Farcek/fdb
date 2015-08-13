var knex = require('knex');
var helper = require('./helper')
var Field = require('./field')
var Schema = require('./schema')
var Transaction = require('./transaction')
var Promise = require('bluebird')
var _ = require('lodash')

function Container(connection) {
    this.$knex = knex(connection);

    // --- init
    this.$fields = {};
    this.$schemas = {};


    this
        .registerField(require('./fields/string'))
        .registerField(require('./fields/text'))
        .registerField(require('./fields/integer'))
        .registerField(require('./fields/float'))
        .registerField(require('./fields/boolean'))

        .registerField(require('./fields/enum'))
        .registerField(require('./fields/json'))

        .registerField(require('./fields/date'))
        .registerField(require('./fields/datetime'))
        .registerField(require('./fields/decimal'))


    ;
}

helper.mixin(Container.prototype, ['knex']);


//<editor-fold desc="Field">

Container.prototype.registerField = function (fieldType) {
    if (Field.isField(fieldType)) {
        var n = fieldType.$typeName;

        if (this.$fields[n]) throw new Error('`' + n + ' `the type name already registered');
        this.$fields[n] = fieldType;
    }
    else throw new TypeError('not support type');

    return this;
}
Container.prototype.field = function (name) {
    if (this.$fields[name]) {
        return this.$fields[name];
    }
    throw new Error('not found field type. typename=' + name);
}
//</editor-fold>


//<editor-fold desc="schemas">

Container.prototype.define = function (name, fieldDefines, options) {
    if (this.$schemas[name]) throw new Error('`' + name + '` the schema is already defined');

    var schema = this.$schemas[name] = new Schema(name, options);
    schema.$container = this;
    schema.$knex = this.knex();

    for (var key in fieldDefines) {
        var def = fieldDefines[key];

        if (def.type) {
            schema.add(key, def.type, def)
        } else schema.add(key, def, {});
    }

    return schema
}
Container.prototype.schema = function (name) {
    if (this.$schemas[name]) return this.$schemas[name];
    throw new Error('not found schema. find name=' + name)
}
//</editor-fold>


Container.prototype.validator = function () {
    return this.$validator || ( this.$validator = require('./validator') )
}


Container.prototype.generateValue = function (generator, schema, field) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var name = schema.name() + '_' + field.name();
        if (_.isFunction(generator)) {
            throw new Error('todo'); // todo
        } else if (_.isString(generator)) {
            name = generator;
        }

        self.$defaultStore()
            .then(function (store) {
                var value = store.next(name, true)
                resolve(value)
            }, reject)


    })
}
Container.prototype.$loadStore = function (storeTableName) {
    var self = this;

    if (self.$$defaultStore) {
        return Promise.resolve(self.$$defaultStore)
    }

    if (self.$$defaultStore_process) {
        return new Promise(function (resolve, reject) {
            var w8 = function (t) {

                if (self.$$defaultStore) resolve(self.$$defaultStore)
                setTimeout(w8, t || 20)
            }
            w8(30)
        })

    }

    self.$$defaultStore_process = true;

    return self.knex().schema.hasTable(storeTableName)
        .then(function (has) {
            if (has) return true;

            return self.knex().schema.createTable(storeTableName, function (table) {

                table.varchar('name', 100)
                table.integer('value')
                table.primary('name')
            })
                .then(function () {
                    return false
                })
        })
        .then(function (load) {
            if (load)
                return self.knex()(storeTableName).where(true)
            return []
        })
        .then(function (data) {

            var store = {}

            data.map(function (it) {
                store[it.name] = it.value
            })
            return store
        })
        .then(function (store) {
            return self.$$defaultStore = store
        })
}
Container.prototype.$defaultStore = function () {
    var self = this, storeTableName = '__inc__store__1';

    return self.$loadStore(storeTableName)
        .then(function (store) {
            var timers = self.$storeTimes || (self.$storeTimes = {});

            function update(name, value) {
                if (timers[name]) clearTimeout(timers[name]);
                timers[name] = setTimeout(function () {
                    self.knex()(storeTableName)
                        .update({value: value})
                        .where('name', name)
                        .then(function () {
                        })
                }, 2000)
            }

            return {
                get: function (name) {
                    return store[name];
                },
                set: function (name, value) {
                    store[name] = value;
                },
                next: function (name, save) {
                    var value = store[name];
                    if (value) {
                        value++;

                        if (save) {
                            update(name, value)
                        }
                    } else {
                        value = 1;
                        if (save) {
                            self.knex()(storeTableName)
                                .insert({value: value, name: name})
                                .then(function () {
                                })
                        }

                    }
                    return (store[name] = value)
                }
            }
        })


}


Container.prototype.transaction = function (handler) {
    return this.knex().transaction(function (trx) {
        return handler(new Transaction(trx));
    })
}
module.exports = Container;
