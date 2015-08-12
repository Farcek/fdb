/**
 *
 * @param schema Schema
 * @param options
 */
module.exports = function (schema, options) {
    options = options || {}
    var field = options.field || 'created_at';
    var dbName = options.dbName || field;


    schema.add(field, Date, {
        dbName: dbName, indexed: true
    })

}