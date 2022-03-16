var zero = "0x0000000000000000000000000000000000000000"
for (var i = 0; i < 100000; i++) { setTimeout(function() { eth.sendTransaction({from: eth.accounts[0], to: zero, value: web3.toWei(0.001, "ether")})}, i * 100) }
