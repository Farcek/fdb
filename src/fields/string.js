var util = require('util');
var Field = require('../field');
var _ = require('lodash');
function StringField() {
    Field.apply(this, arguments)
}
StringField.$typeName = 'string';

util.inherits(StringField, Field);

StringField.prototype.dbLength = function () {
    var opt = this.options()
    return opt.dbLength || opt.length || opt.size;
}

StringField.prototype.cast = function (v) {
    if (_.isString(v)) return v;
    return '' + v
}
StringField.prototype.create = function (table, dbName) {
    return table.varchar(dbName, this.dbLength())
}


module.exports = StringField



