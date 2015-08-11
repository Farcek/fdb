var assert = require("assert");
var utils = require('util')
var FDB = require('../src/container')
var Field = require('../src/field')


describe('Schema methods', function () {

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
        dbName: 'user_7'
    })

    User.method({
        images: function () {
            return Image.where({user: this.id}).result()
        }
    });
    User.static({
        adminUsers: function () {
            return this.where('id', '>', 1).result()
        }
    });

    var Image = fdb.define('image', {
        id: {
            type: 'integer',
            pk: 1, gen: 1

        },
        file: String,
        user: {
            type: 'integer', dbName: 'user_id', notNull: 1
        }
    }, {
        dbName: 'image_7'
    })

    var user = 'farcek ' + new Date();
    var id = 55;


    before(function () {
        return fdb.knex().schema.dropTableIfExists(User.dbName())
            .then(function () {
                return fdb.knex().schema.dropTableIfExists(Image.dbName())
            })
            .then(function () {
                return User.init()
            })
            .then(function () {
                return Image.init()
            })
    });


    describe('create', function () {


        it('module method ', function () {
            return User.create({
                id: 1,
                user: 'farcek'

            })
                .then(function (u) {
                    return u.save()
                })
                .then(function (u) {
                    // console.log(u.images)
                    return u.images()
                })
                .then(function (images) {
                    console.log(images)
                })


        });

        it('schema method ', function () {
            return User.adminUsers()

                .then(function (users) {
                    console.log(users)
                })


        });


    });


});