const Web3 = require("web3")

module.exports = () => {
    const web3 = new Web3(process.env.BSC_RPC)
    const { address, privateKey } = web3.eth.accounts.create()
    return {
        address,
        privateKey
    }
}