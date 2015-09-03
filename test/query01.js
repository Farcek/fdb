var assert = require("assert");
var utils = require('util')
var FDB = require('../src/container')
var Field = require('../src/field')


describe('query', function () {

    var fdb = new FDB(require('./conn'));


    var User = fdb.define('user', {
        id: {
            type: 'integer',
            pk: 1, gen: 1, dbName: 'kk'

        },
        user: String

    }, {
        dbName: 'user_query'
    })


    var user = 'farcek ' + new Date();


    before(function () {
        return fdb.knex().schema.dropTableIfExists(User.dbName())

            .then(function () {
                return User.init()
            })

    });


    describe('query', function () {
        it('or where', function () {

            var q = User.select();
            q.where('id',15)
            q.where(function (sq) {
                this.where('id', 1).orWhere('id', '>', 10)
            })



            assert.equal('select * from `user_query` where `kk` = 15 and (`kk` = 1 or `kk` > 10)', q.toString())

        });


    });


});