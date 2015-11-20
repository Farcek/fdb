/**
 * Created by Administrator on 11/15/2015.
 */


module.exports = function ValidationError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
};

require('util').inherits(module.exports, Error);