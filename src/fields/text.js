var util = require('util');
var Field = require('../field');
function TextField() {
    Field.apply(this, arguments)
}
TextField.$typeName = 'text';

util.inherits(TextField, Field);

TextField.prototype.textType = function () {
    var opt = this.options()
    return opt.textType;
}

TextField.prototype.create = function (table, dbName) {
    return table.text(dbName, this.textType())
}


module.exports = TextField



