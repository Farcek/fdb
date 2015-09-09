var assert = require("assert");
var utils = require('util')
var FDB = require('../src/container')
var Field = require('../src/field')


describe('datetime', function () {

    var fdb = new FDB(require('./conn'));


    var User = fdb.define('user', {
        id: {
            type: 'integer',
            pk: 1, gen: 1

        },
        user: String,
        createAt: Date

    }, {
        dbName: 'user_datetime'
    })


    var user = 'farcek ' + new Date();


    before(function () {
        return fdb.knex().schema.dropTableIfExists(User.dbName())

            .then(function () {
                return User.init()
            })

    });


    describe('test', function () {
        it('create', function () {
            var d = new Date()

            return User.create({
                user: user,
                createAt: d
            })
                .then(function (u) {
                    return u.save()
                        .then(function (u) {
                            assert.equal(d, u.get('createAt'))
                        })
                })


        });
        it('create from String', function () {
            var d = '2015-12-11T15:00:00.000Z'

            return User.create({
                user: user,
                createAt: d
            })
                .then(function (u) {

                    return u.save()
                        .then(function (u) {
                            assert.equal(new Date(d).getTime(), u.get('createAt').getTime())
                        })
                })


        });


    });


});