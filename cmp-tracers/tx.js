const { ethers } = require('ethers')
const fs = require('fs/promises')

const tracers = ['prestateTracer']

async function main() {
    const provider = new ethers.providers.WebSocketProvider()
    const bnToHex = (bn) => {
        const h = bn.toHexString().replace(/^0x0+/, '0x')
        return h == '0x' ? '0x0' : h
    }

    const txHash = process.argv[2]
    await forTx(provider, txHash)
}

const sortObject = o => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {})

async function forTx(provider, txHash) {
    const tx = await provider.getTransaction(txHash)
    const from = tx.from.toLowerCase()

    let start = process.hrtime()
    let resJs = await provider.send('debug_traceTransaction', [txHash, {tracer: 'prestateTracer', timeout: '60s'}])
    let end = process.hrtime(start)
    console.log(`Js tracer took ${end[0]}s ${end[1]/1000000}ms`)

    start = process.hrtime()
    let resNative = await provider.send('debug_traceTransaction', [txHash, {tracer: 'nativePrestateTracer', timeout: '60s'}])
    end = process.hrtime(start)
    console.log(`Native tracer took ${end[0]}s ${end[1]/1000000}ms`)

    // sort js result for easier comparison
    resJs = sortObject(resJs)
    for (const k in resJs) {
        resJs[k].storage = sortObject(resJs[k].storage)
    }

    // Ignore sender balance difference
    delete resJs[from].balance
    delete resNative[from].balance
    let resJsStr = JSON.stringify(resJs, null, 2)
    let resNativeStr = JSON.stringify(resNative, null, 2)
    if (resJsStr !== resNativeStr) {
        console.log(`mismatch in ${txHash}`)
        await fs.writeFile(`${txHash}-js.trace`, resJsStr)
        await fs.writeFile(`${txHash}-native.trace`, resNativeStr)
    }
}

if (require.main == module) {
    main().then(() => console.log('done')).catch((err) => {throw err})
}

module.exports = {
    forTx: forTx,
}
