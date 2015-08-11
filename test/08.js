var assert = require("assert");
var utils = require('util')
var FDB = require('../src/container')
var Field = require('../src/field')


describe('validation', function () {

    var fdb = new FDB(require('./conn'));


    var User = fdb.define('user', {
        id: {
            type: 'integer',
            pk: 1, gen: 1, dbName: 'kk'

        },
        user: {
            type: String, dbName: 'un1', notNull: 1,
            validation: ['alpha', 'length:15:45']
        },
        fname: {
            type: String,
            validation: ['alpha', {
                validator: 'length:44',
                params: [20, 30]
            }]
        },
        email: {
            type: String, required: 1,
            validation: ['email', function (v, model) {


                return User.where('email', v).first().result().then(function (u) {
                    return u ? false : true;
                })
            }]
        },
        startup: {
            type: String,
            validation: [{
                validator: 'date',
                message: 'ene date baih estoi',
                group: 'save'
            }]
        }
    }, {
        dbName: 'user_8'
    })


    var user = 'farcek ' + new Date();
    var id = 55;


    before(function () {
        return fdb.knex().schema.dropTableIfExists(User.dbName())

            .then(function () {
                return User.init()
            })

    });


    describe('module', function () {

        it('valid module ', function () {


            return User.create({})
                .then(function (u) {
                    return u.isValid()
                })
                .then(function (err) {
                    console.log('result 1', err)
                })

        });

        it('valid schema', function () {


            return User.isValid({
                id: 1
            })
                .then(function (err) {
                    console.log('result 2', err)
                })

        });

    });


});