require('dotenv').config()
const path = require('path')
const HDWalletProvider = require('@truffle/hdwallet-provider')

module.exports = {
    plugins: [
        'truffle-plugin-verify',
        'truffle-contract-size'
    ],
    api_keys: {
        bscscan: ''
    },
    contracts_build_directory: path.join(__dirname, "bin"),
    networks: {
        bsc_testnet: {
            provider: () => new HDWalletProvider({
                privateKeys: [process.env.WALLET_PRIVATE_KEY],
                providerOrUrl: process.env.BSC_TESTNET_RPC,
                pollingInterval: 8000
            }),
            from: process.env.WALLET_ADDRESS,
            gas: 6000000,
            network_id: process.env.BSC_TESTNET_ID,
            confirmations: 4,
            timeoutBlocks: 10000
        },
        bsc: {
            provider: () => new HDWalletProvider({
                privateKeys: [process.env.WALLET_PRIVATE_KEY],
                providerOrUrl: process.env.BSC_RPC,
                pollingInterval: 8000
            }),
            from: process.env.WALLET_ADDRESS,
            gas: 6000000,
            network_id: process.env.BSC_ID,
            confirmations: 4,
            timeoutBlocks: 10000
        }
    },
    compilers: {
        solc: {
            version: "0.8.17",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    }
}