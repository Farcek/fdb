var assert = require("assert");
var utils = require('util')
var FDB = require('../src/container')
var Field = require('../src/field')


describe('Schema Model create', function () {

    var fdb = new FDB(require('./conn'));


    var User = fdb.define('user', {
        id: {
            type: 'integer',
            pk: 1, gen: 1
        },
        user: String
    }, {
        dbName: 'uu2'
    })

    var u1 = {};
    User.on('postCreate', function (u) {
        if (u.id == 2)
            u1 = u
    })


    before(function () {
        return User.init()
            .then(function () {
                return User.knex().from(User.dbName()).where(true).delete()
            })
    });


    describe('create', function () {
        it('get set', function () {
            var n = 'farcek ' + new Date();
            return User.create({
                id: 1,
                user: n
            }, function (err, u) {
                if (err) return err
                assert.equal(u.id, 1)
                assert.equal(u.user, n)

            });


        });

        it('post create', function () {
            var n = 'farcek';
            return User.create({
                id: 2,
                user: n
            }).then(function (u) {
                assert.equal(u1.user, n)
            })


                ;


        });

        it('save', function () {
            var n = 'farcek ' + new Date();
            return User.create({
                id: 4,
                user: n
            }).then(function (u) {
                return u.save();
            })
        });

    });

    describe('load', function () {
        var n = 'farcek ' + new Date();

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
                .result(function (err,u) {
                    if(err) throw new Error(err)
                    assert.equal(u.user , n)
                })
        });
    });


});