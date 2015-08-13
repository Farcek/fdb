var assert = require("assert");
var utils = require('util')
var Promise = require('bluebird')
var FDB = require('../src/container')
var Field = require('../src/field')


describe('transaction', function () {

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
        dbName: 'user_trx_1'
    })


    var user = 'farcek ' + new Date();


    before(function () {
        return fdb.knex().schema.dropTableIfExists(User.dbName())

            .then(function () {
                return User.init()
            })

    });


    describe('select', function () {
        it('basic', function () {

            return fdb.transaction(function (trx) {
                var d = {
                    u1: User
                        .create({
                            user: '1 ' + user
                        })
                        .then(function (u) {
                            return u.save(trx)
                        }),
                    u2: User
                        .create({
                            user: '2 ' + user
                        })
                        .then(function (u) {
                            return u.save(trx)
                        }),
                    u3: User
                        .create({
                            user: '3 ' + user
                        })
                        .then(function (u) {
                            return u.save(trx)
                        })
                }

                return Promise.props(d)
                    .then(function () {
                        assert.ok(true)

                    })


            })


                .then(function () {

                    return User.from().count().then(function (t) {
                        console.log('total', t)
                        return t
                    })
                })


        });


    });


});