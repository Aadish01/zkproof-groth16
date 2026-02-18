# ZkProof (Groth16)

This folder is a small end-to-end demo of Groth16 on Ethereum:
1) write a circuit in Circom
2) generate a proof off-chain
3) verify it on-chain via a Solidity verifier
4) submit proofs via a transaction and record the result in an event

End goal: you should be able to send two transactions:
- a valid proof tx that emits ProofSubmitted.ok=true
- an invalid proof tx that emits ProofSubmitted.ok=false

How ZK fits together (plain English):
- The circuit is the “rules” (constraints). Here it’s `circuits/ValidatorDelta.circom`.
- Compiling the circuit produces R1CS + a WASM program that can build a witness.
- The witness is the private data that satisfies the rules. It never goes on-chain.
- Groth16 setup uses a Powers of Tau “ceremony” file (`.ptau`) + the circuit to produce keys.
- Proving produces `build/proof.json` (the proof) and `build/public.json` (public inputs).
- `src/Verifier.sol` is a generated Solidity contract that can check the proof on-chain.
- `src/VerifierRunner.sol` is a small wrapper so verification happens inside a transaction and emits an event.

Prereqs: Node.js, circom, Foundry.

## Steps

### 1) Proof (local)

```bash
npm install # install snarkjs + ethers for scripts

npm run compile     # circom -> R1CS + WASM witness generator
npm run powersoftau # create ptau ceremony file for Groth16
npm run setup       # generate Groth16 proving + verification keys
npm run prove       # produce build/proof.json + build/public.json
npm run verify      # sanity check locally (should print OK!)
```

### 2) Deploy (Sepolia)

```bash
export RPC_URL="<rpc-url>"
export PRIVATE_KEY="0x<deployer-private-key>"

npm run export:verifier # generate src/Verifier.sol from the .zkey
npm run forge:build     # compile Solidity contracts with Forge
npm run deploy:verifier # deploy Groth16Verifier on Sepolia (--broadcast)
```

Copy the printed deployed address into `VERIFIER_ADDRESS`, then:

```bash
export VERIFIER_ADDRESS="0x<deployed-groth16-verifier>"
npm run deploy:runner # deploy VerifierRunner(verifierAddress) on Sepolia
```

### 3) Send transactions

```bash
export RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
export PRIVATE_KEY="0x<tx-sender-private-key>"
export RUNNER_ADDRESS="0x<deployed-runner>"

npm run tx:valid   # sends a tx; expects ProofSubmitted.ok=true
npm run tx:invalid # sends a tx; expects ProofSubmitted.ok=false
```

## Verify contracts on Etherscan (optional)

```bash
export CHAIN_ID="11155111"
export ETHERSCAN_API_KEY="<etherscan-api-key>"

export VERIFIER_ADDRESS="0x<deployed-groth16-verifier>"
npm run verify:verifier

export RUNNER_ADDRESS="0x<deployed-runner>"
npm run verify:runner
```
