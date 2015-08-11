var util = require('util');
var Field = require('../field');
function BooleanField() {
    Field.apply(this, arguments)
}
BooleanField.$typeName = 'boolean';

util.inherits(BooleanField, Field);

BooleanField.prototype.create = function (table, dbName) {
    return table.boolean(dbName)
}
BooleanField.prototype.cast = function (v, model) {
    return v ? true : false
}


module.exports = BooleanField



