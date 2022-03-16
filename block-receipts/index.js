const { ethers } = require('ethers')

// Download all receipts for latest block
async function main() {
    const from = parseInt(process.argv[2])
    const to = parseInt(process.argv[3])

    await serial(from, to)
    await batch(from, to)
    await serial(from, to)
}

async function serial(from, to) {
    const provider = new ethers.providers.JsonRpcProvider()
    const receipts = []
    const start = process.hrtime.bigint()
    for (let i = from; i < to; i++) {
        const block = await provider.getBlock(i)
        for (const txHash of block.transactions) {
            const r = await provider.getTransactionReceipt(txHash)
            receipts.push(r)
        }
    }
    const end = process.hrtime.bigint()
    console.log(`Serial requests took ${(end-start)/1000000n}ms`)
}

async function batch(from, to) {
    const provider = new ethers.providers.JsonRpcBatchProvider()
    const start = process.hrtime.bigint()
    const txhashes = await batchGetTxHashes(provider, from, to)
    const receipts = await batchGetReceipts(provider, txhashes)
    const end = process.hrtime.bigint()
    console.log(`Batch requests took ${(end-start)/1000000n}ms`)
    return receipts
}

function batchGetTxHashes(provider, from, to) {
    return new Promise((resolve, reject) => {
        const promises = []
        for (let i = from; i < to; i++) {
            promises.push(provider.getBlock(i))
        }
        Promise.all(promises).then((results) => {
            return resolve([].concat(...results.map((res) => res.transactions)))
        }).catch((err) => reject(err))
    })
}

function batchGetReceipts(provider, txhashes) {
    return new Promise((resolve, reject) => {
        const promises = []
        for (const tx of txhashes) {
            promises.push(provider.getTransactionReceipt(tx))
        }
        Promise.all(promises).then((results) => {
            return resolve(results)
        }).catch((err) => reject(err))
    })
}

main().then(() => console.log('done')).catch((err) => {throw err})
