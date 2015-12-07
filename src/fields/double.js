var util = require('util');
var Field = require('../field');
function DoubleField() {
    Field.apply(this, arguments)
}
DoubleField.$typeName = 'double';

util.inherits(DoubleField, Field);

DoubleField.prototype.create = function (table, dbName) {
    return table.double(dbName)
}


module.exports = DoubleField



