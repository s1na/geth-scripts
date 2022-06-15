const ethers = require('ethers')
const util = require('../util')

async function main() {
    const from = parseInt(process.argv[2])
    const to = parseInt(process.argv[3])
    const provider = new ethers.providers.JsonRpcProvider()
    //await aclTxes(provider, from, to)
    await createAcl(provider, from, to)
}

async function aclTxes(provider, from, to) {
    let num = 0
    let total = 0
    for (let i = from; i < to; i++) {
        const block = await provider.getBlock(i)
        for (let th of block.transactions) {
            total++
            const tx = await provider.getTransaction(th)
            if (tx.accesslist !== undefined && tx.accessList.length > 0) {
                num++
            }
        }
    }
    console.log(`Txes with accessList: ${num} / ${total}`)
}

async function createAcl(provider, from, to) {
    for (let i = from; i < to; i++) {
        const txhash  = (await provider.getBlock(i)).transactions[0]
        const tx = await provider.getTransaction(txhash)
        const txArgs = util.getTxArgs(tx)

        const start = process.hrtime.bigint()
        const acl = await provider.send('eth_createAccessList', [txArgs, util.toHex(i-1)])
        const end = process.hrtime.bigint()
        console.log(acl)
        console.log(`Created access list for block ${i} tx 0: ${(end-start)/1000000n}ms`)
    }
}

main().then(() => console.log('done')).catch((err) => console.error(err))
