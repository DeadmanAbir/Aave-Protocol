const{getWeth, amount}=require("./getWeth");
const{getNamedAccounts, ethers}=require("hardhat");

async function main(){
    await getWeth();
    const{deployer}=await getNamedAccounts();

    const lendingPool=await getLendingPool(deployer);

    const wethTokenAddress="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    await approveErc20(wethTokenAddress, lendingPool.address, amount, deployer);
    console.log("Depositing");
    await lendingPool.deposit(wethTokenAddress, amount, deployer, 0);
    console.log("Deposited");

    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer);

    const daiPrice=await getDaiPrice();

    const daiTokenAddress="0x6B175474E89094C44Da98b954EedeAC495271d0F";


    const amountDaiBorrow=(availableBorrowsETH.toString()) * 0.95 * (1/daiPrice.toNumber());
    const daiBorrowed=await ethers.utils.parseEther(amountDaiBorrow.toString());
    console.log(`You can borrow ${daiBorrowed} DAI`);

    await borrowDai(daiTokenAddress, lendingPool, daiBorrowed, deployer);
    await getBorrowUserData(lendingPool, deployer);
    await repay(
        daiBorrowed,
        daiTokenAddress,
        lendingPool,
        deployer
    )
    await getBorrowUserData(lendingPool, deployer); 

    // Repaying the amount that we have borrowed
    async function repay(amount, daiAddress, lendingPool, account) {
        await approveErc20(daiAddress, lendingPool.address, amount, account)
        const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
        await repayTx.wait(1)
        console.log("Repaid!")
    }
    
    // Borrowing DAI tokens
    async function borrowDai(daiAddress, lendingPool, amountDaiToBorrow, account) {
        const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrow, 1, 0, account)
        await borrowTx.wait(1)
        console.log("You've borrowed!")
    }
    

    // Getting the real-time price of DAI token using the chailink Oracle priceFeed
    async function getDaiPrice(){
        const priceFeed=await ethers.getContractAt("AggregatorV3Interface", "0x773616E4d11A78F511299002da57A0a94577F1f4");
        const price= (await priceFeed.latestRoundData())[1];
        console.log(`The DAI/ETH price is :  ${price} `);
        return(price);
        
    }


    // Getting all the data of user 
    async function getBorrowUserData(lendingPool, account) {
        const {
            totalCollateralETH,
            totalDebtETH,
            availableBorrowsETH
        } = await lendingPool.getUserAccountData(account)
        console.log(`You have ${totalCollateralETH} worth of ETH deposited.`)
        console.log(`You have ${totalDebtETH} worth of ETH borrowed.`)
        console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`)
        return { availableBorrowsETH, totalDebtETH }
    }

    // Getting the instance of lendingPool contract
    async function getLendingPool(account){
        const lendingPoolAddressProvider=await ethers.getContractAt("contracts/interfaces/addressProvider.sol:ILendingPoolAddressesProvider", 
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5", account);

        const lendingPoolAddress=await lendingPoolAddressProvider.getLendingPool();
        const lendingPool=await ethers.getContractAt("ILendingPool", lendingPoolAddress, account);
        console.log(`LendingPool Address ${lendingPoolAddress}`);
        return lendingPool;
    }

    // Approving the amount of token that we want to deposit
    async function approveErc20(erc20address, spenderAddress, amountToSpend, account){
        const erc20token=await ethers.getContractAt("IERC20", erc20address, account);

        const approved=await erc20token.approve(spenderAddress, amountToSpend);
        await approved.wait(1);
        console.log("Approved");
    }
    

}

main()
.then(()=>{process.exit(0)})
.catch((error)=>{
    console.error(error)
    process.exit(1)
})