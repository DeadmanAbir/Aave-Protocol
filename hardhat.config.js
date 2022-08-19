require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()
require("@nomiclabs/hardhat-ethers")


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: process.env.MAIN_FORK
      }
    },
    rinkeby: {
      chainId: 4,
      blockConfirmations: 6,
      url: process.env.RINKEBY_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
  },
  solidity: {
    compilers: [{version: "0.8.7"}, {version: "0.6.6"}, {version: "0.4.19"}, {version: "0.6.12"}],
  }, 
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    player: {
      default: 1,
    },
  },
  mocha: {
    timeout: "200000"//200sec
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API 
  }
 
};

// contract address= 0xebb4f79eAc3D7dc68e17C6E8fEd576Ebcf0b2d0b
