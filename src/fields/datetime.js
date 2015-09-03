var util = require('util');
var Field = require('../field');
var _ = require('lodash');


function DatetimeField() {
    Field.apply(this, arguments)
}
DatetimeField.$typeName = 'datetime';

util.inherits(DatetimeField, Field);


DatetimeField.prototype.setCast = function (v) {
    if (v instanceof Date) return v;
    return v ? new Date(v) : v
}

DatetimeField.prototype.equal = function (a, b) {
    return a instanceof Date && b instanceof Date && a.getTime() == b.getTime()
}
DatetimeField.prototype.create = function (table, dbName) {
    return table.dateTime(dbName)
}


module.exports = DatetimeField



