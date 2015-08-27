var Promise = require('bluebird');
var _ = require('lodash');
var helper = require('./helper');

function Query(schema, knex, $$q) {
    this.$schema = schema;
    this.$knex = knex;
    this.$$q = $$q;

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

//<editor-fold desc="where group">
Query.prototype.$where = function (method, params) {

    var self = this;
    var rq = this.from();
    var fn = rq[method];
    if (fn && _.isFunction(fn)) {
        if (params.length === 1) {
            var p = params[0]
            if (p === false || p === true) {
                fn.call(rq, p);
                return self
            }

            if (_.isFunction(p)) {
                fn.call(rq, function () {
                    var sq = new Query(self.schema(), self.knex(), this)
                    p.call(sq);
                });

                return self
            }


            if (_.isPlainObject(p)) {
                for (var k in p) self.$where(method, [k, p[k]]);
                return self
            }
            throw 'todo'
        }
        if (params.length === 2) {


            var col = params[0];
            if (_.isString(col)) {
                col = self.$column(col, true);
            }


            fn.call(rq, col, params[1])
            return self
        }
        if (params.length === 3) {


            var col = params[0];
            if (_.isString(col)) {
                col = self.$column(col, true);
            }


            fn.call(rq, col, params[1], params[2])
            return self
        }

        throw new Error('bad request');

    }
    throw new Error('not fund function. find function name ' + method);
}

Query.prototype.where = function (field, op, value) {
    return this.$where('where', arguments)
}
Query.prototype.orWhere = function (field, op, value) {
    return this.$where('orWhere', arguments)
}

Query.prototype.whereNot = function (field, op, value) {
    return this.$where('whereNot', arguments)
}
Query.prototype.orWhereNot = function (field, op, value) {
    return this.$where('orWhereNot', arguments)
}

Query.prototype.whereIn = function (field, op, value) {
    return this.$where('whereIn', arguments)
}
Query.prototype.orWhereIn = function (field, op, value) {
    return this.$where('orWhereIn', arguments)
}

Query.prototype.whereNotIn = function (field, op, value) {
    return this.$where('whereNotIn', arguments)
}
Query.prototype.orWhereNotIn = function (field, op, value) {
    return this.$where('orWhereNotIn', arguments)
}

Query.prototype.whereNull = function (field, op, value) {
    return this.$where('whereNull', arguments)
}
Query.prototype.orWhereNull = function (field, op, value) {
    return this.$where('orWhereNull', arguments)
}

Query.prototype.whereNotNull = function (field, op, value) {
    return this.$where('whereNotNull', arguments)
}
Query.prototype.orWhereNotNull = function (field, op, value) {
    return this.$where('orWhereNotNull', arguments)
}

Query.prototype.whereExists = function (field, op, value) {
    return this.$where('whereExists', arguments)
}
Query.prototype.orWhereExists = function (field, op, value) {
    return this.$where('orWhereExists', arguments)
}

Query.prototype.whereExists = function (field, op, value) {
    return this.$where('whereExists', arguments)
}
Query.prototype.orWhereExists = function (field, op, value) {
    return this.$where('orWhereExists', arguments)
}

Query.prototype.whereNotExists = function (field, op, value) {
    return this.$where('whereNotExists', arguments)
}
Query.prototype.orWhereNotExists = function (field, op, value) {
    return this.$where('orWhereNotExists', arguments)
}

Query.prototype.whereBetween = function (field, op, value) {
    return this.$where('whereBetween', arguments)
}
Query.prototype.orWhereBetween = function (field, op, value) {
    return this.$where('orWhereBetween', arguments)
}
//</editor-fold>


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

Query.prototype.delete = function () {
    var me = this;
    me.from().delete();
    return me;
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

// todo
//Query.prototype.join = function (schema, first, operator, second) {
//    var self = this;
//    var joinSchema = self.schema().container().schema(schema);
//    self.from().join(joinSchema.dbName(), first, operator, second)
//
//    return self;
//}

Query.prototype.toSQL = function () {
    var self = this;
    return self.from().toSQL()
}

Query.prototype.toString = function () {
    var self = this;
    return self.from().toString()
}


module.exports = Query;