# ZkProof (Groth16)

## Quickstart

### 1) Generate a proof locally

```bash
cd ZkProof
npm install

npm run compile
npm run powersoftau
npm run setup
npm run prove
npm run verify
```

### 2) Deploy contracts (Sepolia example)

```bash
export RPC_URL="<rpc-url>"
export PRIVATE_KEY="0x<deployer-private-key>"

npm run export:verifier
npm run forge:build
npm run deploy:verifier
```

Deploy the runner (constructor arg is the verifier address you just deployed):

```bash
export VERIFIER_ADDRESS="0x<deployed-groth16-verifier>"
npm run deploy:runner
```

### 3) Verify on Etherscan

```bash
export CHAIN_ID="11155111"
export ETHERSCAN_API_KEY="<etherscan-api-key>"

export VERIFIER_ADDRESS="0x<deployed-groth16-verifier>"
npm run verify:verifier

export RUNNER_ADDRESS="0x<deployed-runner>"
npm run verify:runner
```

### 4) Send on-chain proof transactions

```bash
export RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
export PRIVATE_KEY="0x<tx-sender-private-key>"
export RUNNER_ADDRESS="0x<deployed-runner>"

npm run tx:valid   # expects ProofSubmitted.ok=true
npm run tx:invalid # expects ProofSubmitted.ok=false
```
