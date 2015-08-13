var util = require('util');
var Field = require('../field');
function DecimalField() {
    Field.apply(this, arguments)
}
DecimalField.$typeName = 'decimal';

util.inherits(DecimalField, Field);

DecimalField.prototype.precision = function () {
    return this.options().precision
}
DecimalField.prototype.scale = function () {
    return this.options().scale
}
DecimalField.prototype.create = function (table, dbName) {
    return table.decimal(dbName, this.precision(), this.scale())
}


module.exports = DecimalField;



