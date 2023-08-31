const ethers = require('ethers')

async function main() {
    const provider = new ethers.providers.WebSocketProvider()
    provider.on('new head', (hash) => {
      console.log(hash)
      const block = await provider.getBlock(hash)
      console.log(block.number)
    })
    const res = await provider.send('eth_subscribe', ['newHead'])
    console.log(res)
}

main().then(console.log).catch(console.error)
