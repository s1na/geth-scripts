const { request, gql } = require('graphql-request')

const endpoint = 'http://localhost:8545/graphql'

async function main () {
    const query = gql`
    query blockInfo($number: Long) {
        block (number: $number) { hash stateRoot }
    }
    `
    const res = await request(endpoint, query, { number: '6004067' })
    console.log(res)
}

main().then().catch((err) => console.log(err))
