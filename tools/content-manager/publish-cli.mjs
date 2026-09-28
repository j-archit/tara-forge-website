import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { createStore } from "./storage.mjs";
import { createPublisher } from "./publish.mjs";

const command = process.argv[2];
if (!["review", "publish"].includes(command)) {
  console.error("Usage: npm run content:review [-- --diff] or npm run content:publish");
  process.exitCode = 2;
} else {
  try {
    const store = await createStore(fileURLToPath(new URL("../../", import.meta.url)));
    const publisher = createPublisher(store);
    const review = await publisher.review();
    console.log(`Branch: ${review.branch}\nDestination: ${review.destination}`);
    console.log(review.pending ? "Content commit waiting for push:" : "Managed files ready:");
    for (const file of review.files.length ? review.files : review.pending?.files || []) console.log(`  ${review.newAssets.includes(file) ? "[new photo] " : ""}${file}`);
    if (!review.canPublish) { console.log(review.reason); process.exitCode = command === "publish" ? 1 : 0; }
    else if (command === "review") {
      if (process.argv.includes("--diff")) console.log(`\n${review.diff || "No text changes."}`);
      else console.log("Use npm run content:review -- --diff to inspect the text diff.");
    } else {
      if (!process.stdin.isTTY) throw new Error("Publishing requires an interactive terminal confirmation.");
      const prompt = createInterface({ input: process.stdin, output: process.stdout });
      const answer = await prompt.question("After checking the website preview, type PUBLISH to commit and push to main: ");
      prompt.close();
      if (answer !== "PUBLISH") throw new Error("Publish cancelled; no Git changes made.");
      const result = await publisher.publish(review.reviewId);
      console.log(result.message);
      if (!result.pushed) process.exitCode = 1;
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
