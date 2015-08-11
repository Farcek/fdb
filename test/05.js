var assert = require("assert");
var utils = require('util')
var FDB = require('../src/container')
var Field = require('../src/field')


describe('Schema advanset lazy', function () {

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
            type: Boolean, dbName: 'is_active'
        },
        active1: {
            type: Boolean
        },
        note: {
            type: 'text', lazy: 1, dbName: 'note_note'
        }

    }, {
        dbName: 'uu6'
    })
    var user = 'farcek ' + new Date();
    var txt = 'this is lazy content'
    var id = 55;


    before(function () {
        return fdb.knex().schema.dropTableIfExists(User.dbName())
            .then(function () {
                return User.init()
                    .then(function () {
                        return User.create({
                            id: id,
                            user: user,
                            note: txt,
                            active: 1
                        }).then(function (u) {
                            return u.save();
                        })
                    })
            })


    });


    describe('load', function () {


        it('load lazy', function () {

            return User.where({
                id: id
            })
                .first()
                .result()
                .then(function (u) {
                    return u.note().then(function (note) {
                        assert.equal(note, txt)
                    })
                })

        });

        it('load boolean', function () {

            return User.where({
                id: id
            })
                .first()
                .result()
                .then(function (u) {
                    assert.strictEqual(u.active, true)
                    assert.strictEqual(u.active1, false)
                })

        });
    });


});