var util = require('util');
var Field = require('../field');
var _ = require('lodash');


function JsonField() {
    Field.apply(this, arguments)
}
JsonField.$typeName = 'json';

util.inherits(JsonField, Field);


JsonField.prototype.cast = function (v, model) {
    if (_.isString(v)) {
        var pv = JSON.parse(v);
        model && model.set(this.name(), pv);
        return pv
    }

    return v
};
JsonField.prototype.dbCast = function (v) {
    return JSON.stringify(v);

}
JsonField.prototype.create = function (table, dbName) {
    return table.json(dbName)
}

JsonField.prototype.hasDBDefaultValue = function () {
    return false;
}

module.exports = JsonField



