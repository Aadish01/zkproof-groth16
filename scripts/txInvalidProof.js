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

  // Intentionally corrupt the public signal so the verifier returns false.
  const corruptedInput = [...input];
  corruptedInput[0] = (BigInt(corruptedInput[0]) + 1n).toString();

  await submitProofTx({ label: "INVALID", a, b, c, input: corruptedInput });
}

main().catch((err) => {
  console.error("[INVALID] failed:", err);
  process.exit(1);
});

