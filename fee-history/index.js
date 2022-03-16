const { request, gql } = require('graphql-request')
const ethers = require('ethers')
const assert = require('assert')
const { writeFile } = require('fs/promises')

const endpoint = 'http://localhost:8545/graphql'

async function main() {
    const count = parseInt(process.argv[2])
    // Latest & pending are not supported
    const lastBlock = parseInt(process.argv[3])
    if (isNaN(lastBlock)) {
        throw new Error("Last block should be a number")
    }
    let percentiles = []
    if (process.argv[4] !== undefined) {
        percentiles = process.argv[4].split(',').map((p) => parseInt(p.replace(/\s/g, '')))
    }
    // Sanity-check percentiles
    for (let i = 0; i < percentiles.length; i++) {
        const p = percentiles[i]
        if (p < 0 || p > 100) {
            throw new Error("Invalid percentile: " + p)
        }
        if (i > 0 && p < percentiles[i-1]) {
            throw new Error("Percentiles need to be sorted")
        }
    }

    const jr = await timeAsync('json-rpc requests', () => jsonrpc(count, lastBlock, percentiles))
    const gr = await timeAsync('graphql request', () => graphql(count, lastBlock, percentiles))
    assert.deepStrictEqual(gr, jr)
}

async function jsonrpc(count, lastBlock, percentiles) {
    const provider = new ethers.providers.JsonRpcProvider()
    lastBlock = '0x' + lastBlock.toString(16)
    return provider.send('eth_feeHistory', [count, lastBlock, percentiles])
}

async function graphql(count, lastBlock, percentiles) {
    const getTip = percentiles.length == 0 ? '' : 'transactions { effectiveTip gasUsed gasPrice }'
    const q = gql`
    query feeHistory($from: Long!, $to: Long!) {
        blocks (from: $from, to: $to) {
            number
            baseFeePerGas
            nextBaseFeePerGas
            gasUsed
            gasLimit
            ${getTip}
        }
    }
    `
    const from = (lastBlock - count) + 1
    const res = await request(endpoint, q, { from: from.toString(), to: lastBlock.toString() })
    const baseFees = []
    const ratios = []
    const rewards = []
    for (let block of res.blocks) {
        console.log(block.baseFeePerGas, block.nextBaseFeePerGas)
        if (block.baseFeePerGas === null) {
            // GraphQL endpoint returns null for pre-london blocks
            block.baseFeePerGas = '0x0'
        }
        baseFees.push(block.baseFeePerGas)
        ratios.push(block.gasUsed / block.gasLimit)
        if (percentiles.length === 0) {
            continue
        }
        const blockRewards = []
        // Return an all zero row if there are no transactions to gather data from
        if (block.transactions.length === 0) {
            rewards.push(new Array(percentiles.length).fill('0x0'))
            continue
        }
        const tips = []
        for (let tx of block.transactions) {
            let tip
            if (tx.effectiveTip === null) {
                tip = tx.gasPrice - parseInt(block.baseFeePerGas.slice(2), 16)
            } else {
                tip = parseInt(tx.effectiveTip.slice(2), 16)
            }
            tips.push({tip: tip, gasUsed: tx.gasUsed})
        }
        tips.sort((a, b) => a.tip - b.tip)

        let txIndex = 0
        let sumGasUsed = tips[0].gasUsed
        for (let i = 0; i < percentiles.length; i++) {
            const p = percentiles[i]
            const thresholdGasUsed = block.gasUsed * p / 100
            while (sumGasUsed < thresholdGasUsed && txIndex < block.transactions.length-1) {
                txIndex++
                sumGasUsed += tips[txIndex].gasUsed                
            }
            blockRewards[i] = '0x' + tips[txIndex].tip.toString(16)
        }
        rewards.push(blockRewards)
    }
    const last = res.blocks[res.blocks.length-1]
    if (last.nextBaseFeePerGas === null) {
        last.nextBaseFeePerGas = '0x0'
    }
    baseFees.push(last.nextBaseFeePerGas)
    const result = {
        oldestBlock: '0x' + res.blocks[0].number.toString(16),
        baseFeePerGas: baseFees,
        gasUsedRatio: ratios,
    }
    if (percentiles.length > 0) {
        result.reward = rewards
    }
    return result
}

async function timeAsync(msg, f) {
    const start = process.hrtime.bigint()
    const r = await f()
    const till = process.hrtime.bigint()
    console.log(`${msg} took ${(till-start)/1000000n}ms`)
    return r
}

main().then().catch((err) => console.log(err))
