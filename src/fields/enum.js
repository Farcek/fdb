var util = require('util');
var _ = require('lodash');
var Field = require('../field');
function EnumField() {
    Field.apply(this, arguments)
}
EnumField.$typeName = 'enum';

util.inherits(EnumField, Field);

EnumField.prototype.values = function () {
    var values = this.options().values;
    if (values) return values;
    throw  new Error('not defined enum values ');
}
EnumField.prototype.isIntEnum = function () {
    return Array.isArray(this.values());
}
EnumField.prototype.isStringEnum = function () {
    return _.isPlainObject(this.values());
}

EnumField.prototype.create = function (table, dbName) {
    if (this.isIntEnum())
        return table.integer(dbName)
    if (this.isStringEnum())
        return table.varchar(dbName)

    throw new Error('not supporting enum type');
}
EnumField.prototype.cast = function (v, model) {
    var values = this.values();
    if (this.isIntEnum()) {
        return values[v];
    }
    if (this.isStringEnum()) {
        for (var k in values) {
            if (values[k] === v) return k;
        }
        return undefined;
    }
    throw new Error('not supporting enum');
}
EnumField.prototype.dbCast = function (v, model) {
    if (this.isIntEnum()) {
        return this.values().indexOf(v);
    }
    if (this.isStringEnum()) {
        return this.values()[v];
    }
    throw new Error('not supporting enum');
}


module.exports = EnumField



