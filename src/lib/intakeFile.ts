export const MAX_DESIGN_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const DESIGN_FILE_EXTENSIONS = [".stl", ".step", ".stp", ".3mf"] as const;

export function validateDesignFile(file: { name: string; size: number }): string | null {
  const name = file.name.toLowerCase();
  if (!DESIGN_FILE_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return "Please upload an STL, STEP, STP, or 3MF file.";
  }
  if (file.size === 0) {
    return "The selected design file is empty.";
  }
  if (file.size > MAX_DESIGN_FILE_SIZE_BYTES) {
    return "The design file must be 25 MB or smaller.";
  }
  return null;
}
