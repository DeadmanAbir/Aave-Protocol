
const{deployer, ethers}=require("hardhat");
const amount=ethers.utils.parseEther("0.01");

async function getWeth(){
    const {deployer}=await getNamedAccounts();
    const iWeth=await ethers.getContractAt("IWeth", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", deployer);
    const tx=await iWeth.deposit({value: amount})
    await tx.wait(1);

    const wethBalance = await iWeth.balanceOf(deployer);
    console.log(`Got ${wethBalance.toString()} Weth`);

}

module.exports={getWeth, amount}

