var Promise = require('bluebird');
var _ = require('lodash');
var helper = require('./helper');

function Query(schema, knex) {
    this.$schema = schema;
    this.$knex = knex;

    ;
}

helper.mixin(Query.prototype, ['schema', 'knex'])

Query.prototype.from = function () {
    var self = this;
    if (self.$$q) return self.$$q;

    self.$$q = self.$knex(self.$schema.dbName());

    return self.$$q;
}


//<editor-fold desc="select">
Query.prototype.select = function () {
    var fields = this.selected();
    for (var i in arguments) {
        var it = arguments[i];
        var a = it.charAt(0);
        if (a === '+') {
            fields[it.substr(1)] = true;
        } else if (a === '-') {
            fields[it.substr(1)] = false;
        } else {
            fields[it] = true;
        }
    }
    return this;
}
Query.prototype.setSelect = function () {
    this.$$selected = {};
    for (var i in arguments) {
        this.$$selected[arguments[i]] = true;
    }
    return this;
}

Query.prototype.selected = function () {
    var self = this;
    if (self.$$selected)  return self.$$selected;

    self.$$selected = {};
    self.$schema.$eachFields(function (it) {
        if (it.isLazy()) return;
        if (it.isVirtual()) return;
        self.$$selected[it.name()] = true;
    });

    return self.$$selected;
}
//</editor-fold>

Query.prototype.$column = function (name, hasThrow) {
    var self = this;
    var as; // todo as add


    var field = self.schema().field(name);
    if (field)  return field.dbName();

    if (hasThrow)
        throw new Error('`' + name + '` the field not defined field. in schema: ' + self.schema().name());
}
Query.prototype.$columns = function () {
    var me = this, fields = me.selected(), cols = [];
    for (var f in fields) {
        if (fields[f])
            cols.push(me.$column(f, true));
    }
    return cols;
}


Query.prototype.where = function (field, op, value) {
    var self = this;

    // object where
    if (arguments.length === 1 && _.isObject(field)) {
        for (var k in field) self.where(k, field[k]);
        return self;
    }
    //if (field instanceof Raw && arguments.length === 1) return this.whereRaw(column);
    // todo raw


    var col = self.$column(field, true);


    if (arguments.length === 2) {
        value = op;
        op = '=';
    }

    var q = this.from();
    q.where(col, op, value);

    return self;
}

Query.prototype.resultRaw = function (callback) {
    var self = this;
    return helper.promise(callback, function () {
        var q = self.from();
        return q;
    })

}

Query.prototype.result = function (callback) {
    var self = this;

    return helper.promise(callback, function () {
        return self.from()
            .select(self.$columns())
            .then(function (dbResult) {

                if (Array.isArray(dbResult)) {
                    return Promise.map(dbResult, function (dbRow) {
                        return self.schema().load(dbRow);
                    })
                }


                if (dbResult)
                    return self.schema().load(dbResult);

                return undefined;
            })
    })

}


Query.prototype.clone = function () {
    var me = this;

    var q = new Query(me.schema(), me.knex());
    q.$$selected = _.clone(me.$$selected);
    q.$$q = me.from().clone();

    return q;
}

Query.prototype.update = function (data, returning) {
    var me = this;
    me.from().update(data, returning);
    return me;
}
Query.prototype.insert = function (data, returning) {
    var me = this;
    me.from().insert(data, returning);
    return me;
}
Query.prototype.limit = function (value) {
    var me = this;
    me.from().limit(value)
    return me;
}
Query.prototype.offset = function (value) {
    var me = this;
    me.from().offset(value)
    return me;
}

Query.prototype.first = function () {
    var me = this;
    me.from().first()
    return me;
}


Query.prototype.orderBy = function (field, direction) {
    var me = this;
    var col = me.$column(field, true);
    me.from().orderBy(col, direction);
    return me;
}
Query.prototype.transacting = function (trx) {
    var me = this;

    me.from().transacting(trx.transacting());
    return me;
}


Query.prototype.count = function (callback) {
    var self = this;
    return helper.promise(callback, function () {
        var q = self.from();

        return q.select(self.knex().raw('count(*) as total'))
            .first()
            .then(function (d) {
                return d.total || 0
            })
    })

}


Query.prototype.join = function (schema, first, operator, second) {
    var self = this;
    var joinSchema = self.schema().container().schema(schema);
    self.from().join(joinSchema.dbName(), first, operator, second)

    return self;
}

module.exports = Query;