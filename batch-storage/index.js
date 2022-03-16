import ethers from 'ethers'
import { request, gql } from 'graphql-request'
import fetch from 'node-fetch'

const endpoint = 'http://localhost:8545/graphql'
const slotsInQuery = 100

async function main() {
    const provider = new ethers.providers.WebSocketProvider()
    const number = parseInt(process.argv[2])
    const acl = await getACL(provider, number)

    let since = process.hrtime.bigint()
    for (let addr in acl) {
        for (let slot of acl[addr]) {
            const val = await provider.getStorageAt(addr, slot)
        }
    }
    let till = process.hrtime.bigint()
    console.log(`json-rpc requests took ${(till-since)/1000000n}ms`)

    await graphql(acl)

    await batch(acl)
}

async function graphql(acl) {
    let since, till
    const queries = buildGraphqlQueries(acl)
    since = process.hrtime.bigint()
    for (let q of queries) {
        const res = await request(endpoint, q)
    }
    till = process.hrtime.bigint()
    console.log(`${queries.length} graphql request took ${(till-since)/1000000n}ms`)

    const newQuery = buildNewGraphqlQueries(acl)
    since = process.hrtime.bigint()
    await request(endpoint, newQuery)
    till = process.hrtime.bigint()
    console.log(`New graphql request took ${(till-since)/1000000n}ms`)
}

function buildGraphqlQueries(acl) {
    const queries = []
    let slotQs = []
    let i = 0
    for (let addr in acl) {
        for (let slot of acl[addr]) {
            slotQs.push(
                `slot${i}: block { account(address: "${addr}") { storage (slot: "${slot}")} }`
            )
            i++
        }
        if (i >= slotsInQuery) {
            queries.push(gql`query slots {
            ${slotQs.join(',\n')}
            }`)
            slotQs = []
            i = 0
        }
    }
    if (i > 0) {
        queries.push(gql`query slots {
        ${slotQs.join(',\n')}
        }`)
    }
    return queries
}

function buildNewGraphqlQueries(acl) {
    let i = 0
    let accQs = []
    for (let addr in acl) {
        let slotQs = []
        let j = 0
        for (let slot of acl[addr]) {
            slotQs.push(`slot${j}: storage(slot: "${slot}")`)
            j++
        }
        accQs.push(`account${i}: account(address: "${addr}") { ${slotQs.join(',\n')} }`)
        i++
    }
    return gql`query slots { block { ${accQs.join(',\n')} } }`
}

async function getACL(provider, number) {
    let res = await provider.send('debug_traceBlockByNumber', [`0x${number.toString(16)}`, {tracer: 'prestateTracer', timeout: '60s'}])
    const map = {}
    for (let txRes of res) {
        const prestate = txRes.result
        for (let addr in prestate) {
            if (Object.keys(prestate[addr].storage).length === 0) {
                continue
            }
            if (map[addr] === undefined) {
                map[addr] = {}
            }
            for (let slot in prestate[addr].storage) {
                map[addr][slot] = true
            }
        }
    }
    const acl = {}
    let addrs = 0
    let slots = 0
    for (let addr in map) {
        const keys = Object.keys(map[addr])
        acl[addr] = keys
        addrs++
        slots += keys.length
    }
    console.log(`Access-list has ${addrs} accounts with ${slots} storage slots`)
    return acl
}

async function batch(acl) {
    const reqs = []
    let id = 1000
    for (let addr in acl) {
        for (let slot of acl[addr]) {
            reqs.push({
                method: 'eth_getStorageAt',
                params: [addr, slot, 'latest'],
                id: id++,
                jsonrpc: '2.0',
            })
        }
    }
    const start = process.hrtime.bigint()
    const res = await fetch('http://127.0.0.1:8545', {method: 'POST', body: JSON.stringify(reqs), headers: {'Content-Type': 'application/json'}})
    const data = await res.json()
    const end = process.hrtime.bigint()
    console.log(`Batch json-rpc req took ${(end-start)/1000000n}ms`)
    return data
}

main().then(() => console.log('done')).catch((err) => {throw err})
