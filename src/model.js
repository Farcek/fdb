var helper = require('./helper');
var Field = require('./field');
var Transaction = require('./transaction');
var _ = require('lodash');

var Promise = require('bluebird');

function Model() {
}
//<editor-fold desc="isNew || isExists">
Model.prototype.$setExists = function () {
    this.privateTmp().exists = true;
    return this;
}
Model.prototype.isExists = function () {
    return this.privateTmp().exists ? true : false;
}
Model.prototype.isNew = function () {
    return !this.isExists()
}
//</editor-fold>

helper.mixin(Model.prototype, ['container', 'knex', 'schema', 'privateTmp']);


//<editor-fold desc="get set">
Model.prototype.data = function () {
    return this.$data || (this.$data = {});
}
Model.prototype.$loadDBData = function (data) {


    var self = this;
    self.$data = {};
    self.schema().$eachFields(function (field) {
        var mdN = field.name();
        var dbN = field.dbName();

        if (dbN in data && data[dbN] !== null) {
            self.$data[mdN] = field.setCast(data[dbN], self);
        } else {
            if (field.hasDefaultValue())
                self.$data[mdN] = field.setCast(field.defaultValue(), self);
        }

    });


    return self;
}
Model.prototype.$loadData = function (data) {
    var self = this;
    self.$data = {};
    self.schema().$eachFields(function (field) {
        var n = field.name();
        if (n in data) {
            self.$data[n] = field.setCast(data[n], self);
        } else {
            if (field.hasDefaultValue())
                self.$data[n] = field.setCast(field.defaultValue(), self);
        }

    });


    return self;
}
Model.prototype.modifiedData = function () {
    return this.$modifiedData || (this.$modifiedData = {});
}

Model.prototype.hasValue = function (name) {
    var data = this.data();
    var modifiedData = this.modifiedData();

    return name in modifiedData || name in data
}
Model.prototype.pk = function () {
    var pk = this.schema().pk();
    return this.get(pk.name());
}

Model.prototype.$get = function (name) {
    var data = this.data();
    var modifiedData = this.modifiedData();

    if (name in modifiedData) return modifiedData[name];

    return data[name]
}
Model.prototype.get = function (name) {
    var self = this, field = this.schema().field(name);


    if (field.isLazy()) {

        if (self.hasValue(name)) {
            return Promise.resolve(field.getCast(self.$get(name), this));
        }

        if (self.isNew()) {
            return Promise.resolve(undefined);
        }


        var pk = self.schema().pk();
        var q = self.schema().createQuery();


        pk.where(q, self.get(pk.name()), self);


        return q
            .setSelect(field.name())
            .first()
            .resultRaw()
            .then(function (result) {

                var val = undefined;
                if (result) {
                    val = result[field.dbName()];
                }

                return (self.data()[field.name()] = val)
            })
            .then(function (val) {
                return field.getCast(val, this)
            })
    }

    return self.hasValue(name) && field.getCast(self.$get(name), this);
}


//Model.prototype.$set = function (name, value) {
//    var data = this.data(), field = this.schema().field(name);
//    data[name] = field.setCast(value, this);
//}
Model.prototype.set = function (name, value, hard) {


    var field = this.schema().field(name);
    var data = this.data();
    if (!field.equal(data[name], value) || hard) {
        var modifiedData = this.modifiedData();
        modifiedData[name] = field.setCast(value, this)
        this.$modified = true;
    }

    return this
}
Model.prototype.isModified = function (name) {
    var modifiedData = this.modifiedData();
    if (name) return name in modifiedData;

    return this.$modified ? true : false
}
//</editor-fold>


//<editor-fold desc="save">
Model.prototype.save = function (trx, callback) {
    var self = this;
    var method, w8;

    if (_.isFunction(trx)) {
        callback = trx;
        trx = undefined;
    }


    if (self.isExists()) {
        w8 = self.$$waitPostLoad();
        method = self
            .$update(trx)

    } else {
        w8 = self.$$waitPostCreate();
        method = self
            .$insert(trx)
    }

    return helper.promise(callback, function () {
        return w8
            .then(function () {
                return self.schema().emit('preSave', self, trx)
            })
            .then(function () {

                return method;
            })
            .then(function () {
                return self.schema().emit('postSave', self, trx)
            })
            .then(function () {
                return self
            })
    })
}
//</editor-fold>
Model.prototype.isDelete = function () {
    return this.$isDeleted ? true : false
}
Model.prototype.delete = function (trx, callback) {
    var self = this;

    if (_.isFunction(trx)) {
        callback = trx;
        trx = undefined;
    }

    return helper.promise(callback, function () {
        return self.schema()
            .emit('preDelete', self, trx)
            .then(function () {

                var q = self.schema().createQuery()

                self.schema().pkWhere(q, self);

                if (trx)
                    q.transacting(trx)

                return q.delete()
                    .resultRaw()
                    .then(function () {
                        self.$isDeleted = true;
                    })
                    ;
            })
            .then(function () {
                return self.schema().emit('postDelete', self, trx)
            })
    })
}

//<editor-fold desc="insert">
Model.prototype.$insertValue = function () {
    var self = this, data = {}
    this.schema().$eachFields(function (f) {
        if (f.isVirtual())  return;

        var n = f.name();
        if (self.hasValue(n)) {
            data[f.dbName()] = f.dbCast(self.$get(n), self);
        } else if (f.hasDefaultValue()) {
            data[f.dbName()] = f.defaultValue()
        } else {
            var gen = f.autoGenerated();
            if (gen) {
                data[f.dbName()] = self.schema().container().generateValue(gen, self.schema(), f);
            }
        }
    })
    return Promise.props(data)
}
Model.prototype.$insert = function (trx) {
    var self = this;

    return self.$$waitPostCreate()
        .then(function () {
            return self.schema().emit('preInsert', self, trx)
        })
        .then(function () {

            return self
                .$insertValue()
                .then(function (data) {

                    var q = self.schema().createQuery()
                        .insert(data)
                    if (trx)
                        q.transacting(trx);

                    return q.resultRaw()
                        .then(function (dbResult) {
                            self.$loadDBData(data);
                            self.$setExists();
                        })
                        ;
                });
        })
        .then(function () {
            return self.schema().emit('postInsert', self, trx);
        })

}
//</editor-fold>
//<editor-fold desc="update">
Model.prototype.$updateValue = function () {
    var self = this, data = {}
    this.schema().$eachFields(function (f) {
        if (f.isVirtual())  return;
        if (self.isModified(f.name())) {
            data[f.dbName()] = f.dbCast(self.$get(f.name(), self))
        }
    })

    return Promise.props(data)
}
Model.prototype.$update = function (trx) {
    var self = this;


    return self.$$waitPostLoad()
        .then(function () {
            return self.schema().emit('preUpdate', self, trx)
        })
        .then(function () {
            if (self.isModified())
                return self
                    .$updateValue()
                    .then(function (data) {
                        //var pk = self.schema().pk();
                        var q = self.schema().createQuery()
                            .update(data)


                        //pk.where(q, self.get(pk.name()), self);

                        self.schema().pkWhere(q, self);


                        if (trx)
                            q.transacting(trx);

                        return q.resultRaw(function () {
                            return true;
                        });
                    })
            else return false;
        })
        .then(function () {
            return self.schema().emit('postUpdate', self, trx);
        })
}
//</editor-fold>

//<editor-fold desc="$$waitPostCreate || $$waitPostLoad">
Model.prototype.$$waitPostCreate = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        function w8(delay) {
            if (self.$$postCreate) return resolve();
            setTimeout(w8, delay || 10);
        }

        w8(20);
    });
}
Model.prototype.$$waitPostLoad = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        function w8(delay) {
            if (self.$$postLoad) return resolve();
            setTimeout(w8, delay || 10);
        }

        w8(20);
    });
}
//</editor-fold>

Model.prototype.isValid = function (group, callback) {
    var self = this;
    if (_.isFunction(group)) {
        callback = group;
        group = undefined;
    }

    var rules = self.schema().$buildValidator(group);
    var validator = self.schema().container().validator();


    return helper.promise(callback, function () {


        return validator(self, rules, function () {
            return {
                value: function (path, model) {
                    return model.get(path)
                },
                has: function (path, model) {
                    return model.hasValue(path)
                }
            }
        })
            .then(function (r) {
                if (r.valid) return self;
                throw {
                    message: 'validation error',
                    errors: r.errors
                };
            })


    })
}

Model.prototype.toObject = function (options) {
    options = options || {}
    var self = this;
    var lazy = options.lazy || false;


    var obj = {};

    self.schema().$eachFields(function (f) {
        if (!lazy && f.isLazy()) return;

        obj[f.name()] = self.get(f.name())
    })

    return obj
}

Model.prototype.toJSON = Model.prototype.toObject


module.exports = Model;