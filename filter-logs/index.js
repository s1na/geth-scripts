const { ethers } = require('ethers')
const fs = require('fs/promises')

const fromBlock = 4000000
const toBlock = 13102756
const reqs = 1
const blocksInReq = 2000

const filters = [
    {
        name: 'USDC Transfer',
        addr: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
        fromBlock,
        toBlock,
    },
    {
        name: 'OpenSea AtomicMatch',
        addr: '0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b',
        topics: ['0xc4109843e0b7d514e4c093114b863f8e7d8d9a458c372cd51bfe526b588006c9'],
        fromBlock,
        toBlock,
    },
    {
        name: 'Uniswap V3: Router Swap',
        addr: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        topics: ['0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67'],
        fromBlock,
        toBlock,
    },
    {
        name: 'Shiba Inu Token Transfer',
        // Deployed in 10569013
        addr: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
        topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
        fromBlock,
        toBlock,
    },
]

async function main() {
    const provider = new ethers.providers.JsonRpcProvider()
    let from = fromBlock
    for (let i = 0; i < reqs; i++) {
        const out = []
        to = from + blocksInReq
        console.log(`Requesting logs for block range [${from}, ${to}]`)
        const start = process.hrtime.bigint()
        for (const filter of filters) {
            const res = await provider.getLogs({
                fromBlock: from,
                toBlock: to,
                address: filter.addr,
                topics: filter.topics,
            })
            out.push(res)
            //console.log(`Got ${res.length} logs for ${filter.name}`)
        }
        const end = process.hrtime.bigint()
        console.log(`Filtering logs took ${(end-start)/1000000n}`)
        const outStr = JSON.stringify(out, null, 2)
        await fs.writeFile(`logs-${from}-${to}`, outStr)
        from = to
    }
}
main().then(() => console.log('done')).catch((err) => {throw err})
