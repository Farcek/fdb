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
            type: String, dbName: 'un1', notNull: 1
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


    describe('transaction', function () {
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

        it('joined', function () {

            return fdb.transaction(function (trx) {
                return User
                    .create({
                        user: '1 ' + user
                    })
                    .then(function (u) {
                        return u.isValid('create')
                            .then(function () {
                                return u.save(trx)
                                    .then(function (u) {
                                        return Promise.each([10, 11, 12], function (cate) {
                                            console.log(cate)
                                            return User.create({
                                                user: cate + ' user'
                                            }).then(function (c) {
                                                return c.save(trx)
                                            })
                                        })
                                    })
                                    .then(function () {
                                        return User.create({
                                            user: 'prev prev user ' + u.id
                                        }).then(function (u1) {
                                            return u1.save(trx)
                                        })
                                    })
                            })

                    })


            })


                .then(function () {

                    assert.ok(true)
                })


        });


    });


});