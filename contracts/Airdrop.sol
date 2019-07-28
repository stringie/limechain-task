pragma solidity 0.5.8;

contract Airdrop {

    address public owner;
    uint256 public tokenAmount;
    bytes32 private rootHash;

    event Test(bytes32 _hash);

    mapping (address => bool) public claimed;

    constructor() public {
        owner = msg.sender;
        tokenAmount = 20;
    }

    function setAmountAndHash(uint256 _amount, bytes32 _hash) public {
        require(msg.sender == owner, "Only owner");
        tokenAmount = _amount;
        rootHash = _hash;
    }

    function claimTokens(address _neighbor, bytes32[] memory nodes, bool[] memory placement) public returns(bytes32){
        require(!claimed[msg.sender], "Address has already claimed tokens");

        bytes32 tempHash = keccak256(abi.encodePacked(msg.sender, _neighbor));

        for (uint256 i = 0; i < nodes.length; i++) {
            if (placement[i]) {
                tempHash = keccak256(abi.encodePacked(tempHash, nodes[i]));
            } else {
                tempHash = keccak256(abi.encodePacked(nodes[i], tempHash));
            }
        }

        require(tempHash == rootHash, "Address not found in merkle tree hash");

        claimed[msg.sender] = true;

        msg.sender.transfer(tokenAmount);

        return tempHash;
    }

    function () external payable {}
}