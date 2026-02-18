const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const snarkjs = require("snarkjs");

const ABI = [
  "function submitProof(uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[1] input) returns (bool ok)",
  "event ProofSubmitted(address indexed sender, bool ok)"
];

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function loadProofAndPublicSignals({ proofPath, publicSignalsPath }) {
  if (!fs.existsSync(proofPath)) throw new Error(`Missing proof: ${proofPath}`);
  if (!fs.existsSync(publicSignalsPath)) throw new Error(`Missing public signals: ${publicSignalsPath}`);
  return {
    proof: JSON.parse(fs.readFileSync(proofPath, "utf8")),
    publicSignals: JSON.parse(fs.readFileSync(publicSignalsPath, "utf8"))
  };
}

async function toGroth16Calldata({ proof, publicSignals }) {
  const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
  const [a, b, c, input] = JSON.parse(`[${calldata}]`);
  return { a, b, c, input };
}

function gasLimitWithBuffer(estimate) {
  const multiplierBps = BigInt(process.env.GAS_MULTIPLIER_BPS || "12000"); // 120%
  const buffer = BigInt(process.env.GAS_BUFFER || "25000");
  return (estimate * multiplierBps) / 10000n + buffer;
}

function parseProofSubmittedOk(receipt) {
  const iface = new ethers.Interface(ABI);
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "ProofSubmitted") return parsed.args.ok;
    } catch {
      // ignore unrelated logs
    }
  }
  return null;
}

function defaultPaths() {
  const repoRoot = path.resolve(__dirname, "..");
  return {
    proofPath: process.env.PROOF_PATH || path.join(repoRoot, "build", "proof.json"),
    publicSignalsPath: process.env.PUBLIC_PATH || path.join(repoRoot, "build", "public.json")
  };
}

async function getRunnerSigner() {
  const rpcUrl = requireEnv("RPC_URL");
  const privateKey = requireEnv("PRIVATE_KEY");
  const runnerAddress = requireEnv("RUNNER_ADDRESS");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const runner = new ethers.Contract(runnerAddress, ABI, signer);

  return { rpcUrl, runnerAddress, signer, runner };
}

async function submitProofTx({ label, a, b, c, input }) {
  const { runner, runnerAddress, signer } = await getRunnerSigner();

  const estimate = await runner.submitProof.estimateGas(a, b, c, input);
  const gasLimit = gasLimitWithBuffer(estimate);
  const tx = await runner.submitProof(a, b, c, input, { gasLimit });

  console.log(`[${label}] runner=${runnerAddress}`);
  console.log(`[${label}] from=${await signer.getAddress()}`);
  console.log(`[${label}] gasEstimate=${estimate.toString()} gasLimit=${gasLimit.toString()}`);
  console.log(`[${label}] txHash=${tx.hash}`);

  const receipt = await tx.wait();
  const ok = parseProofSubmittedOk(receipt);

  console.log(`[${label}] blockNumber=${receipt.blockNumber}`);
  console.log(`[${label}] ProofSubmitted.ok=${ok}`);
}

module.exports = {
  defaultPaths,
  loadProofAndPublicSignals,
  toGroth16Calldata,
  submitProofTx
};

