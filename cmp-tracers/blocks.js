const { ethers } = require('ethers')
const { stringify } = require('csv-stringify/sync')
const fs = require('fs/promises')

async function main() {
  const provider = new ethers.providers.WebSocketProvider()
  const start = parseInt(process.argv[2])
  const end = parseInt(process.argv[3])
  const times = [['block', 'js', 'native']]
  for (let i = start; i < end; i++) {
    let since = process.hrtime.bigint()
    await provider.send('debug_traceBlockByNumber', [`0x${i.toString(16)}`, {tracer: 'prestateTracer', timeout: '60s'}])
    let till = process.hrtime.bigint()
    const jsElapsed = till - since
    
    since = process.hrtime.bigint()
    await provider.send('debug_traceBlockByNumber', [`0x${i.toString(16)}`, {tracer: 'nativePrestateTracer', timeout: '60s'}])
    till = process.hrtime.bigint()
    times.push([i, jsElapsed, till-since])
  }
  const out = stringify(times)
  await fs.writeFile(`blocks-${start}-${end}.csv`, out)
  console.log('done')
}

main().then().catch((err) => console.log(err))
