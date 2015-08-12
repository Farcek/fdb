var util = require('util');
var Field = require('../field');
var _ = require('lodash');


function JsonField() {
    Field.apply(this, arguments)
}
JsonField.$typeName = 'json';

util.inherits(JsonField, Field);


JsonField.prototype.cast = function (v) {
    if (_.isString(v)) return JSON.parse(v);
    return v
}
JsonField.prototype.dbCast = function (v) {
    return JSON.stringify(v);

}
JsonField.prototype.create = function (table, dbName) {
    return table.json(dbName)
}


module.exports = JsonField



