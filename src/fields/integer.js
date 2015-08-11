var util = require('util');
var Field = require('../field');
var _ = require('lodash');
function IntegerField() {
    Field.apply(this, arguments)
}
IntegerField.$typeName = 'integer';

util.inherits(IntegerField, Field);

IntegerField.prototype.cast = function (v) {
    if(_.isNumber(v)) return v;
    return parseInt(v)
}
IntegerField.prototype.create = function (table, dbName) {
    return table.integer(dbName)
}


module.exports = IntegerField



