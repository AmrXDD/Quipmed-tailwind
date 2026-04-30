// Master list of subcategories per department.
// The Products sidebar merges this list with subcategories discovered
// on real products, so users can browse the full taxonomy even before
// every product is tagged in the admin portal.
//
// Keys are matched against department.slug AND department.name (case-
// insensitive substring), so renaming a department doesn't break this.

export type SubcategoryMap = Record<string, string[]>;

export const SUBCATEGORIES_BY_DEPARTMENT: SubcategoryMap = {
  "medical-imaging": [
    "MRI",
    "CT",
    "PET-CT",
    "DSA / Angiography",
    "Fluoroscopy",
    "X-Ray",
    "Mobile X-Ray",
    "Mobile C-Arm",
    "Mammography",
    "Mammography Tomosynthesis",
    "Ultrasound",
  ],
  "medical-furniture-physiotherapy": [
    "Hospital Furniture",
    "Cold Storage",
    "Shockwave Therapy",
    "Electromedical Physiotherapy",
    "Magnetotherapy",
    "Pressotherapy",
    "Therapeutic Ultrasound",
    "VR Therapy",
  ],
  "sterilization-infection-control": [
    "CSSD / Autoclave",
    "Steam Sterilizer",
    "H₂O₂ Plasma Sterilizer",
    "Washer-Disinfector",
    "Room Disinfection",
    "Surface Disinfection",
    "Hygiene & Cleaning",
    "Dental Sterilization",
  ],
  "surgical-solutions": [
    "Endoscopy",
    "Surgical Motor",
    "Liposuction",
    "Dermatome",
    "Piezosurgery",
    "Surgical Laser",
    "Electrosurgery",
    "OR Tables",
    "OR Lights",
    "ENT",
    "Microscope",
    "Sedation",
    "Sutures",
    "Biopsy",
  ],
  "patient-care": [
    "CGM",
    "Orthopedics",
    "Wound Care",
    "Mobility Aids",
    "Home Care",
  ],
  "life-support": [
    "Patient Monitoring",
    "ECG",
    "Pulmonary / PFT",
    "Spirometry",
    "Defibrillators",
    "Ventilators",
  ],
};

export function expectedSubcategoriesFor(slug: string, name: string): string[] {
  const key = `${slug} ${name}`.toLowerCase();

  if (key.includes("imag") || key.includes("diagnostic"))
    return SUBCATEGORIES_BY_DEPARTMENT["medical-imaging"];
  if (key.includes("furniture") || key.includes("physio"))
    return SUBCATEGORIES_BY_DEPARTMENT["medical-furniture-physiotherapy"];
  if (key.includes("steril") || key.includes("infection") || key.includes("dental"))
    return SUBCATEGORIES_BY_DEPARTMENT["sterilization-infection-control"];
  if (key.includes("surg"))
    return SUBCATEGORIES_BY_DEPARTMENT["surgical-solutions"];
  if (key.includes("patient care") || (key.includes("care") && !key.includes("life")))
    return SUBCATEGORIES_BY_DEPARTMENT["patient-care"];
  if (key.includes("life") || key.includes("support") || key.includes("monitor"))
    return SUBCATEGORIES_BY_DEPARTMENT["life-support"];

  return [];
}
