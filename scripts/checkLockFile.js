#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const lockFile = "pnpm-lock.yaml";
console.log(`Checking if ${lockFile} is up to date...`);

if (!existsSync(lockFile)) {
  console.log(`${lockFile} not found. Updating...`);
  updateAndStageLockFile();
} else {
  try {
    execSync("pnpm install --frozen-lockfile");
    console.log(`${lockFile} is up to date`);
  } catch {
    console.log(`${lockFile} is out of sync. Updating...`);
    updateAndStageLockFile();
  }
}

function updateAndStageLockFile() {
  try {
    execSync("pnpm install");
    execSync(`git add ${lockFile}`);
    console.log(`${lockFile} updated and staged for commit`);
  } catch (error) {
    console.error(`Failed to update ${lockFile}: ${error.message}`);
    process.exit(1);
  }
}
