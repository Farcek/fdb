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
EnumField.prototype.enumType = function () {
    return this.options().enumType || 'int';
}

EnumField.prototype.isIntDb= function () {
    var t=this.enumType()
    return  t == 'integer' || t === 'int';
}
EnumField.prototype.isStringDB = function () {
    var t=this.enumType()
    return  t == 'String' || t == 'string'  || t === String;
}



EnumField.prototype.create = function (table, dbName) {
    if (this.isIntDb())
        return table.integer(dbName)
    if (this.isStringDB())
        return table.varchar(dbName)

    throw new Error('not supporting enum type');
}
EnumField.prototype.cast = function (v, model) {
    var values = this.values();

    for (var k in values) {
        if (values[k] === v) return k;
    }
    return undefined;

}
EnumField.prototype.dbCast = function (v, model) {
    return this.values()[v];
}


module.exports = EnumField



