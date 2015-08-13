function Transaction(knexTrx) {
    this.$knexTrx = knexTrx
}


Transaction.prototype.transacting = function () {
    return this.$knexTrx;
}

module.exports = Transaction;