const { ethers } = require('ethers')

const block = 5416167

const filter = {
	name: 'Random goelri contract',
	addr: '0x07aaec0b237ccf56b03a7c43c1c7a783da560642',
	topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
}

async function main() {
	const provider = new ethers.providers.JsonRpcProvider()
	const res = await provider.getLogs({
		fromBlock: block,
		toBlock: block,
		address: filter.addr,
		topics: filter.topics,
	})
	console.log(`Got ${res.length} logs for ${filter.name}`)
	if (res.length > 0) {
		console.log(res[0])
	}
}
main().then(() => console.log('done')).catch((err) => {throw err})
