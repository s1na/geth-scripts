const { ethers } = require('ethers')
const fs = require('fs/promises')

async function main() {
    const provider = new ethers.providers.JsonRpcProvider()
    const blocknum = parseInt(process.argv[2])
    const block = await provider.getBlock(blocknum)
    const traces = []
    for (const txHash of block.transactions) {
        console.log(txHash)
        let res = await provider.send('debug_traceTransaction', [txHash, { disableStorage: true, disableStack: true }])
        delete res.structLogs
        traces.push(res)
    }
    await fs.writeFile(`${block.number}.trace`, JSON.stringify(traces, null, 2))
}

main().then(() => console.log('done')).catch((err) => console.log(err))
