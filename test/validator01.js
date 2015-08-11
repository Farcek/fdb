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


    describe('01', function () {

        it('module method ', function () {
            return validator({id: 1,t:'ok'}, roles)
                .then(function (r) {
                    console.log('finish ---', r)
                })

        });

    });
});