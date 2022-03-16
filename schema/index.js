const { buildClientSchema, printSchema } = require('graphql')
const { request } = require('graphql-request')

const endpoint = 'http://localhost:8545/graphql'

// Taken with modifications from:
// https://github.com/graphql/graphql-js/blob/bba149cbdd122dc7278693c91e4aa90703ca7894/src/utilities/getIntrospectionQuery.ts#L66
// Notable changes:
// - Deleted directives
// - Excluded deprecated fields and args
// - Excluded subscription type (none exists in the spec)
// - Excluded interfaces, enumValues, and possibleTypes from FullType (no instance in current spec)
const q = `query introspectionQuery {
    __schema {
        queryType { name }
        mutationType { name }
        types {
            ...FullType
        }
    }
}
fragment FullType on __Type {
    kind
    name
    description
    fields {
        name
        description
        args {
            ...InputValue
        }
        type {
            ...TypeRef
        }
    }
    inputFields {
        ...InputValue
    }
}
fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
}
fragment TypeRef on __Type {
    kind
    name
    ofType {
        kind
        name
        ofType {
            kind
            name
            ofType {
                kind
                name
                ofType {
                    kind
                    name
                    ofType {
                        kind
                        name
                        ofType {
                            kind
                            name
                            ofType {
                                kind
                                name
                            }
                        }
                    }
                }
            }
        }
    }
}`

async function main() {
    const res = await request(endpoint, q)
    const types = []
    const scalarTypes = {'Int': true, 'Float': true, 'String': true, 'Boolean': true, 'ID': true}
    for (const type of res.__schema.types) {
        // Exclude introspection-related types
        if (type.name.startsWith('__')) {
            continue
        }
        // Exclude built-in scalar types
        if (scalarTypes[type.name]) {
            continue
        }
        types.push(type)
    }
    res.__schema.types = types
    console.log(printSchema(buildClientSchema(res)))
    //console.log(JSON.stringify(res, null, 2))
}

main().then().catch((err) => console.log(err))
