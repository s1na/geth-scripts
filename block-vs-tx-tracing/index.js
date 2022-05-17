const { ethers } = require('ethers')

async function main() {
    const provider = new ethers.providers.WebSocketProvider()
    const blocknum = parseInt(process.argv[2])
    await perBlock(provider, blocknum)
    await perTx(provider, blocknum)
}

async function perBlock(provider, num) {
    let since = process.hrtime.bigint()
    await provider.send('debug_traceBlockByNumber', [`0x${num.toString(16)}`, {timeout: '10m'}])
    let till = process.hrtime.bigint()
    console.log(`debug_traceBlockByNumber took ${(till-since)/1000000n}ms`)
}

async function perTx(provider, num) {
    let since = process.hrtime.bigint()
    const block = await provider.getBlock(num)
    for (const txHash of block.transactions) {
        await provider.send('debug_traceTransaction', [txHash, {timeout: '60s'}])
    }
    let till = process.hrtime.bigint()
    console.log(`debug_traceTransaction requests took ${(till-since)/1000000n}ms`)
}

main().then().catch((err) => console.log(err))
