const bnToHex = (bn) => {
    const h = bn.toHexString().replace(/^0x0+/, '0x')
    return h == '0x' ? '0x0' : h
}

function toHex(num) {
    return '0x' + num.toString(16)
}

function getTxArgs(tx) {
    return {
        from: tx.from,
        to: tx.to,
        data: tx.data,
        gas: bnToHex(tx.gasLimit),
        gasPrice: bnToHex(tx.gasPrice),
        value: bnToHex(tx.value),
    }
}

module.exports = {
    bnToHex,
    toHex,
    getTxArgs,
}
