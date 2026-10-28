import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

// Approved UI fingerprints from main at 310debf. Metadata declarations are
// excluded so search-only edits cannot require approving new rendered copy.
// Managed documents stay editable; homepage/footer checks are maintained separately.
// The two gallery fingerprints include the intentional project-modal preview.
const approved = {
  "src/app/services/ServicesClient.tsx": "bcae844f38b87f87f4d9d02c32a6938f4fe19a5b564c1ad9df33ec1e39abb80c",
  "src/app/gallery/GalleryClient.tsx": "f26b1326ae4b121b5ee205b0878f9a005ff0b0f79b765792c6573ff6060a1fd9",
  "src/app/gallery/GalleryCard.tsx": "f069ee942a28bb6e5152d813622692fffb1f35601f89f183e52b48f35ca35387",
  "src/app/team/TeamClient.tsx": "9755ddab2d8def7a1314dc0aecafcfad6497d887bd0b8d40cb2b4f03a9933ff4",
  "src/app/shipping-returns/page.tsx": "ae2b8972fb99b409ed03226824734cdfb50edbbec62448b7b0032c2475f842b2",
  "src/app/quote/page.tsx": "5c3f65d5d1be9e95b3d9a20382c1be2a9a73e57448c91862e3592f86c02eeed8",
  "src/app/HeroTransformation.tsx": "88e445a7c99d76ea0cacc408e593ee70201e11943a544389bf6f50b2aaceb3a2",
  "src/lib/animations.ts": "2600a9aa71cce5ef8c996e6b2cb81c2af81ca26355a8c4460eb77989d2f7086c",
  "src/components/ManualIntake.tsx": "2c36abd1ac4820cc49a008a124b01f515ab0e1de7e2f10dffc97d5e765051e54",
};

test("SEO changes retain approved page copy, gallery controls and quote overlay", () => {
  for (const [path, hash] of Object.entries(approved)) {
    const source = readFileSync(path, "utf8").replace(/\r\n/g, "\n")
      .replace(/\nexport const metadata: Metadata = createPageMetadata\([\s\S]*?\n\);\n/, "\n");
    assert.equal(createHash("sha256").update(source).digest("hex"), hash, path);
  }
});
