var assert = require("assert");
var utils = require('util')
var FDB = require('../src/container')
var Field = require('../src/field')


describe('Schema enum field', function () {

    var fdb = new FDB(require('./conn'));


    var User = fdb.define('user', {
        id: {
            type: 'integer',
            pk: 1, gen: 1, dbName: 'kk'

        },
        user: {
            type: String, dbName: 'un1', notNull: 1
        },

        active1: {
            type: Boolean
        },

        gender1: {
            type: 'enum', dbName: 'gd1', values: {mr: 'm1', mss: 'm2'},enumType:'string'
        },
        gender2: {
            type: 'enum', dbName: 'gd2', values: {mr: 10, mss: 20}
        }

    }, {
        dbName: 'user_6'
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
                            active: 1,
                            gender1: 'mss',
                            gender2: 'mr'

                        }).then(function (u) {
                            return u.save();
                        })
                    })
            })
    });


    describe.only('load', function () {

         console.log(User.field('gender1').values())
         console.log(User.field('gender2').values())


        it('load lazy', function () {
           return  User.findById(id)
                .then(function (u) {
                    assert.strictEqual(u.gender2, 'mr')
                    assert.strictEqual(u.gender1, 'mss')
                })

        });


    });


});