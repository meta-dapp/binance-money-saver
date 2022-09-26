require('dotenv').config()
const Binance = require('binance-api-node').default

const client = Binance({
    apiKey: process.env.BINANCE_APIKEY,
    apiSecret: process.env.BINANCE_SECRET_KEY,
    getTime: () => Date.now(),
})

const sleep = (timeMs) => new Promise(resolve => setTimeout(resolve, timeMs))

const init = async () => {
    while (true) {
        console.clear()
        console.log('Futures checking...')
        try {
            // Trasfer futures busd & usdt to spot
            const usdtFuturesBalance = await getBalance('USDT', true)
            const busdFuturesBalance = await getBalance('BUSD', true)

            if (usdtFuturesBalance > 0)
                await client.universalTransfer({
                    type: 'UMFUTURE_MAIN',
                    asset: 'USDT',
                    amount: usdtFuturesBalance
                })

            await sleep(process.env.BINANCE_REQ_PAUSE_TIME)

            if (busdFuturesBalance > 0)
                await client.universalTransfer({
                    type: 'UMFUTURE_MAIN',
                    asset: 'BUSD',
                    amount: busdFuturesBalance
                })
        } catch (err) { }

        console.log('Small asset checking...')
        await sleep(process.env.BINANCE_REQ_PAUSE_TIME)

        try {
            // Check small asset & convert
            const assets = await getAssets()
            await convertSmallAssets(assets)
        } catch (err) { }

        const usdtBalance = await getBalance('USDT')
        const bnbBalance = await getBalance('BNB')

        console.log('-----------------------')
        console.log('BNB Balance: ' + bnbBalance)
        console.log('USDT Balance: ' + usdtBalance)
        console.log('-----------------------')

        if (usdtBalance >= process.env.BINANCE_MIN_USDT_TO_TRADE) {
            console.log('Trading USDT->BNB...')
            // Trade to BNB
            await client.order({
                symbol: 'BNBUSDT',
                side: 'BUY',
                quoteOrderQty: usdtBalance,
                type: 'MARKET',
            })
        }

        if (bnbBalance >= process.env.BINANCE_MIN_BNB_TO_SAVE) {
            console.log('Processing withdraw...')
            // Send to MoneySaving Contract
            await client.withdraw({
                coin: 'BNB',
                network: 'BSC',
                address: process.env.SAVING_CONTRACT,
                amount: bnbBalance,
            })
        }

        await sleep(process.env.BINANCE_WAIT_TIME)
    }
}

const convertSmallAssets = async (_assets) => {
    var assets = _assets.filter(asset => {
        return asset !== 'BNB'
    })

    var i = assets.length
    while (i--) {
        try {
            await client.dustTransfer({ asset: assets })
            return
        } catch (err) {
            assets.splice(i, 1)
            await sleep(process.env.BINANCE_REQ_PAUSE_TIME)
        }
    }
}

const getBalance = async (asset, futures) => {
    const { balances } = futures ?
        { balances: await client.futuresAccountBalance() }
        : await client.accountInfo()

    for (var i = 0; i < balances.length; i++) {
        const coin = balances[i]
        if (coin.asset === asset)
            return parseFloat(futures ? coin.balance : coin.free)
    }
}

const getAssets = async () => {
    const { balances } = await client.accountInfo()
    const assets = []

    for (var i = 0; i < balances.length; i++) {
        const coin = balances[i]
        if (parseFloat(coin.free) > 0)
            assets.push(coin.asset)
    }

    return assets
}

init()