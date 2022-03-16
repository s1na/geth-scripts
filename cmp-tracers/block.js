const { ethers } = require('ethers')
const { forTx } = require('./tx')

async function main() {
    const provider = new ethers.providers.WebSocketProvider()
    const blocknum = parseInt(process.argv[2])
    const block = await provider.getBlock(blocknum)
    for (const txHash of block.transactions) {
        console.log(txHash)
        await forTx(provider, txHash)
    }
}

main().then().catch((err) => console.log(err))
