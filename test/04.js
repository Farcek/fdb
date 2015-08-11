var assert = require("assert");
var utils = require('util')
var FDB = require('../src/container')
var Field = require('../src/field')


describe('Schema advanset', function () {

    var fdb = new FDB(require('./conn'));


    var User = fdb.define('user', {
        id: {
            type: 'integer',
            pk: 1, gen: 1, dbName: 'kk'

        },
        user: {
            type: String, dbName: 'un1', notNull: 1
        },
        age: {
            type: 'integer', default: 21
        },
        active: {
            type: Boolean
        },
        note: {
            type: 'text', lazy: 1
        }

    }, {
        dbName: 'uu5'
    })


    before(function () {
        return fdb.knex().schema.dropTableIfExists(User.dbName())
            .then(function () {
                return User.init()
                    .then(function () {
                        return User.knex().from(User.dbName()).where(true).delete()
                    })
            })


    });


    describe('load', function () {
        this.timeout(5000)
        var n = 'farcek ' + new Date();
        var txt = 'this is lazy content'

        it('save', function () {

            return User.create({
                id: 15,
                user: n
            }).then(function (u) {
                return u.save();
            })
        });

        it('load where', function () {

            return User.where({
                id: 15
            })
                .first()
                .result()
                .then(function (u) {

                    assert.equal(u.user, n)
                    u.note = txt
                    return u.save()
                        .then(function (u) {
                            return u.note().then(function(note){
                                assert.equal(note, txt)
                            })


                        })
                })

        });

    });


});