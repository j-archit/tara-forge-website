import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

// Approved UI fingerprints from main at 310debf. Metadata declarations are
// excluded so search-only edits cannot require approving new rendered copy.
// Managed documents stay editable; homepage/footer checks are maintained separately.
// The two gallery fingerprints include the intentional project-modal preview.
// Includes the approved business-order links and policy pointers.
const approved = {
  "src/app/services/ServicesClient.tsx": "6a4badbf2f300a5ce6628c92fb014edabf4d3dfd7d2144a63ef2e58e2f1bbf81",
  "src/app/gallery/GalleryClient.tsx": "de88461de6c7ecef217ec724b1cac8affd057827d441751e556bc93323af0559",
  "src/app/gallery/GalleryCard.tsx": "f069ee942a28bb6e5152d813622692fffb1f35601f89f183e52b48f35ca35387",
  "src/app/team/TeamClient.tsx": "9755ddab2d8def7a1314dc0aecafcfad6497d887bd0b8d40cb2b4f03a9933ff4",
  "src/app/shipping-returns/page.tsx": "1eac0c590e4681db34837b364ee653d67d6dee1ad024a764414123de3af7c065",
  "src/app/quote/page.tsx": "e85912950bb34b0323f83dfb2ed334b6ffa94262249e91e9528f889fee40dd45",
  "src/app/HeroTransformation.tsx": "88e445a7c99d76ea0cacc408e593ee70201e11943a544389bf6f50b2aaceb3a2",
  "src/lib/animations.ts": "2600a9aa71cce5ef8c996e6b2cb81c2af81ca26355a8c4460eb77989d2f7086c",
  "src/components/ManualIntake.tsx": "7649a1847d246905d7efb5bd02ced0fb53dd4e2c70523ea5c73e1861dca48bf3",
};

test("SEO changes retain approved page copy, gallery controls and quote overlay", () => {
  for (const [path, hash] of Object.entries(approved)) {
    const source = readFileSync(path, "utf8").replace(/\r\n/g, "\n")
      .replace(/\nexport const metadata: Metadata = createPageMetadata\([\s\S]*?\n\);\n/, "\n");
    assert.equal(createHash("sha256").update(source).digest("hex"), hash, path);
  }
});
