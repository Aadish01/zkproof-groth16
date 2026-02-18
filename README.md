# Groth16 Setup (Draft) - `ZkProof`

This folder contains a minimal Groth16 pipeline you can run end-to-end.

It proves a simple statement:

- Given `prevBalances[4]` and `nextBalances[4]`
- `expectedDelta = sum(nextBalances) - sum(prevBalances)`

The circuit here is intentionally small to validate the workflow (`compile -> trusted setup -> prove -> verify`) before plugging in beacon SSZ logic.

## Prerequisites

- Node.js 18+
- `circom` installed and available on PATH
  - Check with: `circom --version`
- Foundry (`forge`) installed and available on PATH
  - Check with: `forge --version`

## Install

```bash
cd ZkProof
npm install
```

## 1) Compile circuit

```bash
npm run compile
```

Outputs in `build/`:
- `ValidatorDelta.r1cs`
- `ValidatorDelta_js/ValidatorDelta.wasm`
- `ValidatorDelta.sym`

## 2) Powers of Tau (Phase 1 + prepare phase 2)

```bash
npm run powersoftau
```

Outputs:
- `build/pot12_final.ptau`

## 3) Groth16 setup (Phase 2) and verification key

```bash
npm run setup
```

Outputs:
- `build/ValidatorDelta_final.zkey`
- `build/verification_key.json`

## 4) Generate proof with sample input

```bash
npm run prove
```

Inputs from:
- `inputs/sample-input.json`

Outputs:
- `build/proof.json`
- `build/public.json`

## 5) Verify proof

```bash
npm run verify
```

If valid, snarkjs prints:
- `OK!`

## 6) (Optional) Export Solidity verifier

```bash
npm run export:verifier
```

Output:
- `src/Verifier.sol`

> `src/Verifier.sol` is the contract Forge deploys.  
> If you regenerate proving keys (`.zkey`), run `npm run export:verifier` again before deploy.

## 7) Build verifier contract with Forge

```bash
npm run forge:build
```

## 8) Deploy verifier contract (Forge)

Set env vars:

```bash
export RPC_URL="https://<your-rpc>"
export PRIVATE_KEY="0x<deployer-private-key>"
```

Deploy:

```bash
npm run deploy:verifier
```

This deploys:
- `src/Verifier.sol:Groth16Verifier`

## 9) Verify deployed contract on block explorer (Forge)

Set:

```bash
export CHAIN_ID="<chain-id>"
export ETHERSCAN_API_KEY="<explorer-api-key>"
export VERIFIER_ADDRESS="0x<deployed-address>"
```

Run:

```bash
npm run verify:verifier
```

Example chain IDs:
- Ethereum mainnet: `1`
- Holesky: `17000`
- Sepolia: `11155111`

---
