const { buildClientSchema, printSchema, getIntrospectionQuery } = require('graphql')
const { request } = require('graphql-request')

const endpoint = 'http://localhost:8545/graphql'

async function main() {
    const q = getIntrospectionQuery()
    const res = await request(endpoint, q)
    const types = []
    console.log(JSON.stringify(res, null, 2))
}

main().then().catch((err) => console.log(err))
