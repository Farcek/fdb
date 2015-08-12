var assert = require("assert");
var utils = require('util')
var FDB = require('../src/container')
var Field = require('../src/field')


describe('schema findBy value', function () {

    var fdb = new FDB(require('./conn'));


    var User = fdb.define('user', {
        id: {
            type: 'integer',
            pk: 1, gen: 1, dbName: 'kk'

        },
        user: {
            type: String, dbName: 'un1', notNull: 1,
            validation: ['alpha', 'length:15:45']
        }

    }, {
        dbName: 'user_10'
    })


    var user = 'farcek ' + new Date();


    before(function () {
        return fdb.knex().schema.dropTableIfExists(User.dbName())

            .then(function () {
                return User.init()
            })

    });


    describe.only('select', function () {
        it('basic', function () {

            return User
                .select()
                .result(function (users) {

                })



        });





    });


});