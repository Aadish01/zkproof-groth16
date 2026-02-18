const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const buildDir = path.join(root, "build");
const inputPath = path.join(root, "inputs", "sample-input.json");

if (!fs.existsSync(path.join(buildDir, "ValidatorDelta_js", "ValidatorDelta.wasm"))) {
  throw new Error("Missing wasm. Run: npm run compile");
}

if (!fs.existsSync(path.join(buildDir, "ValidatorDelta_final.zkey"))) {
  throw new Error("Missing final zkey. Run: npm run setup");
}

if (!fs.existsSync(inputPath)) {
  throw new Error("Missing input file: inputs/sample-input.json");
}

execSync(
  `npx snarkjs wtns calculate "${path.join(
    buildDir,
    "ValidatorDelta_js",
    "ValidatorDelta.wasm"
  )}" "${inputPath}" "${path.join(buildDir, "witness.wtns")}"`,
  { stdio: "inherit" }
);

execSync(
  `npx snarkjs groth16 prove "${path.join(
    buildDir,
    "ValidatorDelta_final.zkey"
  )}" "${path.join(buildDir, "witness.wtns")}" "${path.join(
    buildDir,
    "proof.json"
  )}" "${path.join(buildDir, "public.json")}"`,
  { stdio: "inherit" }
);

console.log("Proof generated:");
console.log(`- ${path.join(buildDir, "proof.json")}`);
console.log(`- ${path.join(buildDir, "public.json")}`);
