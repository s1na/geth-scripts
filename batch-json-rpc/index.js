import fetch from 'node-fetch'

const endpoint = 'http://127.0.0.1:8545'

async function main() {
    const from = parseInt(process.argv[2])
    const to = parseInt(process.argv[3])
    let start, end

    const reqs = []
    for (let i = from; i < to; i++) {
        reqs.push({
            method: 'eth_getBlockByNumber',
            params: [`0x${i.toString(16)}`, false],
            id: i-from,
            jsonrpc: '2.0',
        })
    }

    await seq(reqs)
    await batch(reqs)
    await seq(reqs)
}

async function seq(reqs) {
    const start = process.hrtime.bigint()
    for (let req of reqs) {
        const res = await fetch(endpoint, {method: 'POST', body: JSON.stringify(req), headers: {'Content-Type': 'application/json'}})
        const data = await res.json()
    }
    const end = process.hrtime.bigint()
    console.log(`Sequential requests took ${(end-start)/1000000n}ms`)
}

async function batch(reqs) {
    const start = process.hrtime.bigint()
    const res = await fetch(endpoint, {method: 'POST', body: JSON.stringify(reqs), headers: {'Content-Type': 'application/json'}})
    const data = await res.json()
    const end = process.hrtime.bigint()
    console.log(`Batched requests took ${(end-start)/1000000n}ms`)
}

main().then(() => console.log('done')).catch((err) => console.log(err))
