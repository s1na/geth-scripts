import ethers from 'ethers'

const endpoint = 'http://127.0.0.1:8545'

async function main() {
    const from = parseInt(process.argv[2])
    const to = parseInt(process.argv[3])

    await seq(from, to)
    await batch(from, to)
    await seq(from, to)
}

async function seq(from, to) {
    const provider = new ethers.providers.JsonRpcProvider()
    const since = process.hrtime.bigint()
    for (let i = from; i < to; i++) {
        await provider.getBlock(i)
    }
    const till = process.hrtime.bigint()
    console.log(`sequential block fetching took ${(till-since)/1000000n}ms`)
}

function batch(from, to) {
    return new Promise((resolve, reject) => {
        const provider = new ethers.providers.JsonRpcBatchProvider()
        const since = process.hrtime.bigint()
        const promises = []
        for (let i = from; i < to; i++) {
            promises.push(provider.getBlock(i))
        }
        Promise.all(promises).then((vals) => {
            const till = process.hrtime.bigint()
            console.log(`batch block fetching took ${(till-since)/1000000n}ms`)
            resolve()
        }).catch((err) => {
            console.log(err)
            reject(err)
        })
    })
}

main().then(() => console.log('done')).catch((err) => console.log(err))
