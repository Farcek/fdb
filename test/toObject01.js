var assert = require("assert");
var utils = require('util')
var FDB = require('../src/container')
var Field = require('../src/field')


describe('toObject', function () {

    var fdb = new FDB(require('./conn'));


    var User = fdb.define('user', {
        id: {
            type: 'integer',
            pk: 1, gen: 1, dbName: 'kk'

        },
        user: String

    }, {
        dbName: 'user_to_object'
    })


    var user = 'farcek ' + new Date();


    before(function () {
        return fdb.knex().schema.dropTableIfExists(User.dbName())

            .then(function () {
                return User.init()
            })

    });


    describe('toOnkecy', function () {
        it('basic', function () {

            return User.create({
                user: user
            })

                .then(function (u) {

                    return u.save()
                })

                .then(function (u) {
                    console.log(u)



                    console.log(JSON.stringify(u))

                    return u
                })


        });


    });


});