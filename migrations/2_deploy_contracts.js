const Airdrop = artifacts.require("../contracts/Airdrop.sol");

module.exports = function(deployer) {
    deployer.then(async function() {
        await deployer.deploy(Airdrop);
    });
};
