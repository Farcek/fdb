var assert = require("assert");
var utils = require('util')
var FDB = require('../src/container')
var Field = require('../src/field')


describe('container', function () {

    var fdb = new FDB(require('./conn'));


    describe('#registerField()', function () {
        it('buruu torol add', function () {

            assert.throws(function () {
                fdb.registerField(1123)
            });
            assert.throws(function () {
                fdb.registerField(require('../src/fields/string'))
            });

        });
        it('normal', function () {

            assert.doesNotThrow(function () {
                function test(){

                }
                test.$typeName = 'test'
                utils.inherits(test,Field)
                fdb.registerField(test)
            });

        });
    });

    describe('#define()', function () {
        it('normal', function () {

            var schema= fdb.define('test',{
                test : String
            })

            assert.equal( schema.field('test').name(), 'test' )

        });
    });


});