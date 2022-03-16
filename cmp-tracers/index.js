const { ethers } = require('ethers')
const fs = require('fs/promises')

const tracers = ['prestateTracer']

async function main() {
    const provider = new ethers.providers.WebSocketProvider()
    const bnToHex = (bn) => {
        const h = bn.toHexString().replace(/^0x0+/, '0x')
        return h == '0x' ? '0x0' : h
    }
    let i = 0
    provider.on('block', (blockNum) => {
        i++
        console.log('new block', blockNum)
        if (i%10 === 0) {
            forBlock(provider, blockNum).then(() => { console.log('processed', blockNum) }).catch((err) => {throw err})
        }
    })
}

async function forBlock(provider, blockNum) {
    const block = await provider.getBlock(blockNum)
    const hexNum = '0x' + blockNum.toString(16)
    for (let t of tracers) {
        const resDuk = await provider.send('debug_traceBlockByNumber', [hexNum, {tracer: t, timeout: '60s'}])
        const resGoja = await provider.send('debug_traceBlockByNumber', [hexNum, {tracer: `${t}Goja`, timeout: '60s'}])
        const resDukStr = JSON.stringify(resDuk, null, 2)
        const resGojaStr = JSON.stringify(resGoja, null, 2)
        if (resDukStr !== resGojaStr) {
            console.log(`mismatch in ${blockNum} for ${t}`)
            await fs.writeFile(`${blockNum}-${t}-duktape.trace`, resDukStr)
            await fs.writeFile(`${blockNum}-${t}-goja.trace`, resGojaStr)
        }
    }
}

main().then(() => console.log('done')).catch((err) => {throw err})
