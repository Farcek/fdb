var util = require('util');
var Field = require('../field');
var _ = require('lodash');


function DateField() {
    Field.apply(this, arguments)
}
DateField.$typeName = 'date';

util.inherits(DateField, Field);


DateField.prototype.setCast = function (v) {
    if (v instanceof Date) return v;
    return v ? new Date(v) : v
}

DateField.prototype.equal = function (a, b) {
    return a instanceof Date && b instanceof Date && a.getTime() == b.getTime()
}

DateField.prototype.create = function (table, dbName) {
    return table.date(dbName)
}


module.exports = DateField



