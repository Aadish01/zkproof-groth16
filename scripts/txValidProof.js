const {
  defaultPaths,
  loadProofAndPublicSignals,
  toGroth16Calldata,
  submitProofTx
} = require("./utils");

async function main() {
  const { proofPath, publicSignalsPath } = defaultPaths();
  const { proof, publicSignals } = loadProofAndPublicSignals({ proofPath, publicSignalsPath });
  const { a, b, c, input } = await toGroth16Calldata({ proof, publicSignals });
  await submitProofTx({ label: "VALID", a, b, c, input });
}

main().catch((err) => {
  console.error("[VALID] failed:", err);
  process.exit(1);
});

