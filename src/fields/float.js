var util = require('util');
var Field = require('../field');
function FloatField() {
    Field.apply(this, arguments)
}
FloatField.$typeName = 'float';

util.inherits(FloatField, Field);

FloatField.prototype.create = function (table, dbName) {
    return table.float(dbName)
}


module.exports = FloatField



