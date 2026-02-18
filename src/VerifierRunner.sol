// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IGroth16Verifier {
    function verifyProof(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[1] calldata _pubSignals
    ) external view returns (bool);
}

contract VerifierRunner {
    IGroth16Verifier public immutable verifier;

    event ProofSubmitted(address indexed sender, bool ok);

    constructor(address verifier_) {
        require(verifier_ != address(0), "zero verifier");
        verifier = IGroth16Verifier(verifier_);
    }

    function submitProof(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[1] calldata _pubSignals
    ) external returns (bool ok) {
        ok = verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        emit ProofSubmitted(msg.sender, ok);
    }
}
