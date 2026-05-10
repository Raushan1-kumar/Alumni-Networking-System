const { execSync } = require("child_process");
const path = require("path");

const seeds = [
  "seedUsers.js",
  "seedJobs.js",
  "seedEvents.js",
  "seedPosts.js",
  "seedStories.js",
  "seedDonations.js",
  "seedSurveys.js",
];

console.log("🌱 Starting full database seed...\n");

for (const seed of seeds) {
  const filePath = path.join(__dirname, seed);
  console.log(`Running ${seed}...`);
  try {
    execSync(`node ${filePath}`, { stdio: "inherit" });
  } catch {
    console.error(`Failed: ${seed}`);
    process.exit(1);
  }
}

console.log("\n✅ All seed files completed.");