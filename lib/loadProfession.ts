import { brandConfig as legalBrand } from "./professions/legal/brandConfig";

export function loadProfession() {
  const profession = process.env.PROFESSION || "legal";
  if (profession === "legal") {
    return {
      brand: legalBrand,
      profession: "legal",
    };
  }
  throw new Error(`Unknown profession: ${profession}`);
}
