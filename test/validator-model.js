var assert = require("assert");
var utils = require('util')
var FDB = require('../src/container')


describe('validator-model', function () {
    var fdb = new FDB(require('./conn'));
    var User = fdb.define('user', {
        id: {
            type: 'integer',
            pk: 1, gen: 1, dbName: 'kk'

        },
        user: {
            type: String, required: 1
        },
        email: {
            type: String
        },
        age: {
            type: 'integer', default: 21
        },
        active: {
            type: Boolean, dbName: 'is_active'
        }

    }, {
        dbName: 'valid-model',
        validations: [
            {
                field: 'user',
                message: "not found email and user",
                validator: function (v, model) {
                    return model.user && model.email
                }
            }
        ]
    })
    var user = 'farcek ' + new Date();
    var id = 55;

    before(function () {
        return fdb.knex().schema.dropTableIfExists(User.dbName())

            .then(function () {
                return User.init()
            })

    });

    describe.only('01', function () {

        it('module method one user', function () {
            return User.create({
                user: user
            })
                .then(function (u) {
                    return u.isValid()
                })

        });

        it('module method ', function () {
            return User.create({
                email: '1212'
            })
                .then(function (u) {
                    return u.isValid()
                })

        });

    });
});