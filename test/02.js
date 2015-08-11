var assert = require("assert");
var utils = require('util')
var FDB = require('../src/container')
var Field = require('../src/field')


describe('Schema', function () {

    var fdb = new FDB(require('./conn'));


    var User = fdb.define('user', {
        id: {
            type: 'integer',
            pk: 1, gen: 1
        },
        user: String
    }, {
        dbName: 'uu1'
    })

    var postSetup = false;
    var postDefine = false;

    User.on('postSetup', function () {
        postSetup = true
    });
    User.on('postDefine', function () {
        postDefine = true
    });


    before(function (done) {

        fdb.knex().schema.dropTableIfExists(User.dbName())

            .finally(done)
    });


    describe('init', function () {
        it('postSetup', function (done) {
            User
                .init()
                .then(function (r) {
                    assert.equal(postSetup, true)
                })
                .finally(function () {
                    done()
                })

        });
        it('postDefine', function (done) {
            User
                .init()
                .then(function (r) {
                    assert.equal(postDefine, true)

                })
                .finally(function () {
                    done()
                })

        });

    });




});