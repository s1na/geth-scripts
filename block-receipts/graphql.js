const { request, gql } = require('graphql-request')

const endpoint = 'http://localhost:8545/graphql'

async function main () {
    const from = process.argv[2]
    const to = process.argv[3]
    const query = gql`
  query blockReceipts($from: Long!, $to: Long!) {
    blocks (from: $from, to: $to) {
      hash number transactions {
        hash, from { address }, to { address }, status, gasUsed, logs { index, account {address }, topics, data }
      }
    }
  }`
    const start = process.hrtime.bigint()
    const res = await request(endpoint, query, { from, to })
    const end = process.hrtime.bigint()
    console.log(`Graphql request took ${(end-start)/1000000n}ms`)
}

main().then().catch((err) => console.log(err))
