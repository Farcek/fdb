var assert = require("assert");
var utils = require('util')
var FDB = require('../src/container')
var Field = require('../src/field')


describe('generate value', function () {

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
        dbName: 'user_9'
    })


    var user = 'farcek ' + new Date();


    before(function () {
        return fdb.knex().schema.dropTableIfExists(User.dbName())

            .then(function () {
                return User.init()
            })

    });


    describe.only('int inc', function () {
        it('container', function () {

            return User.container().$defaultStore()
                .then(function (store) {
                    var r = store.next('heh',true)

                    assert.ok(r)
                })



        });


        it('inc', function () {


            return User.create({
                user: user
            })
                .then(function (u) {
                    return u.save()
                })
                .then(function (u) {
                    assert.ok(u.id)

                    return User.findById(u.id)
                        .then(function (u) {
                            assert.equal(u.user, user)
                        })
                })

        });


    });


});