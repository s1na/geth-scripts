const WebSocket = require('ws')

async function main() {
    const ws = new WebSocket('ws://127.0.0.1:8546', { maxPayload: 1000 * 1024 * 1024 })
    ws.on('message', (ev) => {
        console.log(ev)
    })
    ws.on('error', (err) => {
        console.log('ws.error', err)
    })

    await new Promise(resolve => ws.once('open', resolve));

    const payload = JSON.stringify({
        method: 'eth_blockNumber',
        params: [],
        id: 63,
        jsonrpc: '2.0',
    })
    const payload2 = JSON.stringify({
        method: 'eth_syncing',
        params: [],
        id: 64,
        jsonrpc: '2.0',
    })
    ws.send(`[${payload}, ${payload2}]`)
}
main().then().catch((err) => { throw err })
