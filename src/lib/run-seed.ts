import { runSeed } from "./seed";

runSeed()
  .then(() => {
    console.log("Database initialized and seeded.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });

