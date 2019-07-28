const web3 = require("web3");
const airdrop = artifacts.require("../contracts/Airdrop.sol");

var Web3 = new web3();

function buildTree(addresses) {
    const tree = {};
    tree[0] = {};

    for (let i = 0; i < addresses.length; i++) {
        tree[0][i] = addresses[i];
    }

    let i = 0;

    while (Object.keys(tree[i]).length > 1) {
        tree[i + 1] = {};
        let k = 0;
        for (let j = 0; j < Object.keys(tree[i]).length; j += 2) {
            tree[i + 1][k] = Web3.utils.soliditySha3(tree[i][j], tree[i][j + 1]);
            k++;
        }
        i++;
    }

    console.log(tree);

    return tree;
}

contract("Airdrop", function([owner, first, second, third, fourth, fifth, sixth, seventh, eighth, ninth]) {
    before(async function() {
        this.airdrop = await airdrop.new({ from: owner });
        this.tree = buildTree([first, second, third, fourth, fifth, sixth, seventh, eighth]);
        this.airdrop.setAmountAndHash(
            Web3.utils.toWei("1", "ether"),
            this.tree[Object.keys(this.tree).length - 1][0],
            { from: owner }
        );
        this.airdrop.sendTransaction({ from: owner, value: Web3.utils.toWei("1", "ether") });
    });

    it("Should allow claiming of tokens", async function() {
        const neighbor = this.tree[0][5];
        const requiredHashes = [this.tree[1][3], this.tree[2][0]];
        const placements = [true, false];

        await this.airdrop.claimTokens(neighbor, requiredHashes, placements, { from: fifth });

        assert.equal(await this.airdrop.claimed(fifth), true);
    });

    it("Should revert when non-airdrop address claims tokens", async function() {
        try {
            const neighbor = this.tree[0][5];
            const requiredHashes = [this.tree[1][3], this.tree[2][0]];
            const placements = [true, false];

            await this.airdrop.claimTokens(neighbor, requiredHashes, placements, { from: ninth });

            assert.fail("Expected revert");
        } catch (error) {
            const revert = error.message.search("revert") >= 0;
            assert(revert);
        }
    });
});
