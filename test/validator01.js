var assert = require("assert");
var utils = require('util')
var validator = require('../src/validator')


describe('validator', function () {

    var roles = [{
        field: 'id',
        validator: 'range',
        params: [5, 10]
    }, {
        field: 't',
        validator: function (value, model, params) {
            return value ? true : false
        },
        message: ' heh ok {0}'
    }];

    var roles1 = [{
        validator: function (value, model, params) {

            console.log(value,model)

            return model.id || model.id2
        },
        message: ' id1 or id2 not definex {0}'
    }];


    describe('01', function () {

        it('basic rule ', function () {
            return validator({id: 1, t: 'ok'}, roles)
                .then(function (r) {
                    console.log('finish ---', r)
                })
        });

        it.only('field null rule ', function () {
            return validator({id1: 1, t: 'ok'}, roles1)
                .then(function (r) {
                    console.log('finish ---', r)
                })

        });

    });
});