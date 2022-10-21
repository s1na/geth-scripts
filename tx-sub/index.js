const ethers = require('ethers')

async function main() {
    const provider = new ethers.providers.WebSocketProvider()
    /*provider.on('pending', (txhash) => {
        console.log(txhash)
    })*/
    const res = await provider.send('eth_subscribe', ['newPendingTransactions', true])
    console.log(res)
}

main().then(console.log).catch(console.error)
