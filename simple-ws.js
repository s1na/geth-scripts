const { ethers } = require('ethers')

async function main() {
    const provider = new ethers.providers.WebSocketProvider()
    console.log('latest', await provider.getBlockNumber())
}

main().then(() => console.log('done')).catch((err) => {throw err})
