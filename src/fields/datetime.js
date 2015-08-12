var util = require('util');
var Field = require('../field');
var _ = require('lodash');


function DatetimeField() {
    Field.apply(this, arguments)
}
DatetimeField.$typeName = 'datetime';

util.inherits(DatetimeField, Field);


DatetimeField.prototype.cast = function (v) {
    if (v instanceof Date) return v;
    return v ? new Date(v) : v
}
DatetimeField.prototype.create = function (table, dbName) {
    return table.dateTime(dbName)
}


module.exports = DatetimeField



