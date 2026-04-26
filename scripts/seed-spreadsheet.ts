/**
 * QuipMed · Spreadsheet seeder (v2)
 * ─────────────────────────────────────────────────────────────
 * Imports the catalog from the supplied Google Sheet and aligns
 * Supabase to the desired shape:
 *
 *   Departments kept (7):
 *     Medical Imaging, Medical Furniture & Physiotherapy,
 *     Sterilization, Infection Control & Dental, Dental,
 *     Surgical Solutions, Life Care Solutions,
 *     Consumables & Disposables
 *
 *   Sheets → department mapping:
 *     1218380868 → Medical Imaging                    (no per-category split)
 *     1205300113 → Medical Furniture & Physiotherapy
 *     1550190332 → Sterilization, Infection Control & Dental
 *     879728650  → Surgical Solutions
 *     1029985600 → Life Care Solutions
 *     507856398  → Consumables & Disposables
 *
 *   Cleanup pass (idempotent):
 *     - Removes any department not in the keep list
 *     - Removes any brand that ends up with zero products
 *
 * Re-runnable. Products are matched on (lowercased name, brand).
 * Existing image_url is preserved when the new fetch fails.
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPA_URL || !SUPA_KEY) {
  console.error("✖  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPA_URL, SUPA_KEY, {
  auth: { persistSession: false },
});

// ── Departments we keep ─────────────────────────────────────
const KEEP_DEPARTMENTS = [
  "Medical Imaging",
  "Medical Furniture & Physiotherapy",
  "Sterilization, Infection Control & Dental",
  "Dental",
  "Surgical Solutions",
  "Life Care Solutions",
  "Consumables & Disposables",
] as const;

// ── Source rows (transcribed from the Google Sheet) ─────────
type Row = {
  department: (typeof KEEP_DEPARTMENTS)[number];
  category: string;
  name: string;
  brand: string;
  country: string;
  source_url: string;
};

const ROWS: Row[] = [
  // ── Sheet: Medical Imaging ─────────────────────────────────
  { department: "Medical Imaging", category: "MRI",                     name: "NeuMR Universal",                                  brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/mr/NeuMR-Universal" },
  { department: "Medical Imaging", category: "MRI",                     name: "NeuMR Rena",                                       brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/mr/NeuMR-Rena" },
  { department: "Medical Imaging", category: "MRI",                     name: "NeuMR 1.5T",                                       brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/mr/NeuMR-1.5T" },
  { department: "Medical Imaging", category: "PET-CT",                  name: "NeuEras",                                          brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/petct/NeuEra%20Series-PETCT" },
  { department: "Medical Imaging", category: "PET-CT",                  name: "NeuWin",                                           brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/petct/NeuWin-PETCT" },
  { department: "Medical Imaging", category: "CT Scan",                 name: "NeuViz Epoch+",                                    brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/ct/NeuViz-Epoch+-CT" },
  { department: "Medical Imaging", category: "CT Scan",                 name: "NeuViz Glory+",                                    brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/ct/NeuViz-Glory+-CT" },
  { department: "Medical Imaging", category: "CT Scan",                 name: "NeuViz ACE 128",                                   brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/ct/NeuViz-ACE-128-CT" },
  { department: "Medical Imaging", category: "CT Scan",                 name: "NeuViz ACE 64e",                                   brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/ct/NeuViz-ACE-64e-CT" },
  { department: "Medical Imaging", category: "CT Scan",                 name: "NeuViz ACE 32 (SP)",                               brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/ct/NeuViz-ACE-(SP)-CT" },
  { department: "Medical Imaging", category: "CT Scan",                 name: "Mobile CT Unit",                                   brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/ct/Mobile-CT-Unit" },
  { department: "Medical Imaging", category: "DSA Angiography",         name: "NeuAngio Ceiling Series",                          brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/dsa/NeuAngio-Ceiling-Series" },
  { department: "Medical Imaging", category: "DSA Angiography",         name: "NeuAngio Floor Series",                            brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/dsa/NeuAngio-Floor-Series" },
  { department: "Medical Imaging", category: "X-Ray",                   name: "NeuCare Mammo DR HD",                              brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/xray/NeuCare-Mammo-DR-HD" },
  { department: "Medical Imaging", category: "X-Ray",                   name: "NeuVision 850",                                    brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/xray/NeuVision-850" },
  { department: "Medical Imaging", category: "Workflow & Connectivity", name: "PACS & HIS System",                                brand: "Neusoft Medical Systems", country: "China",       source_url: "https://www.neusoftmedical.com/en/products-solutions/mdaas.html" },
  { department: "Medical Imaging", category: "Radiography",             name: "Digital Radiography",                              brand: "Allengers",               country: "India",       source_url: "https://www.allengers.com/p/digix-fdx" },
  { department: "Medical Imaging", category: "Angiography",             name: "DSA System / C-Arm",                               brand: "Allengers",               country: "India",       source_url: "https://www.allengers.com/p/digital-subtraction-angiography-system" },
  { department: "Medical Imaging", category: "Cath Lab",                name: "PHOTON F65",                                       brand: "Allengers",               country: "India",       source_url: "https://www.allengers.com/p/mobile-cath-lab" },
  { department: "Medical Imaging", category: "X-Ray",                   name: "HF X-RAY",                                         brand: "Allengers",               country: "India",       source_url: "https://www.allengers.com/p/fixed-x-ray-systems-rad" },
  { department: "Medical Imaging", category: "X-Ray",                   name: "LF X-RAY",                                         brand: "Allengers",               country: "India",       source_url: "https://www.allengers.com/p/x-ray-line-frequency-2-pulse" },
  { department: "Medical Imaging", category: "Mammography",             name: "FAIRY DR 3D / FAIRY DR 3D+",                       brand: "Allengers",               country: "India",       source_url: "https://www.allengers.com/p/3d-mammography" },
  { department: "Medical Imaging", category: "Fluoroscopy",             name: "Remote Controlled RF Table - ANGIOTAB 9030 DRF",   brand: "Allengers",               country: "India",       source_url: "https://www.allengers.com/p/angio-tab-drf" },
  { department: "Medical Imaging", category: "Ultrasound",              name: "Cart-Based Color Doppler",                         brand: "EDAN",                    country: "China",       source_url: "https://www.edan.com/product/h/LX9.html" },
  { department: "Medical Imaging", category: "Ultrasound",              name: "Portable Color Doppler",                           brand: "EDAN",                    country: "China",       source_url: "https://www.edan.com/product/h/Acclarix_AX9.html" },
  { department: "Medical Imaging", category: "Ultrasound",              name: "Handheld Ultrasound",                              brand: "EDAN",                    country: "China",       source_url: "https://www.edan.com/product/h/Nano_L12_EXP.html" },

  // ── Sheet: Medical Furniture & Physiotherapy ───────────────
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "Hospital Beds",                       brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/17_hospital-beds" },
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "Care Patient Bed",                    brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/55_care-patient-bed" },
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "Stretchers",                          brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/53_strechers" },
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "Patient Transport Chairs",            brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/28_patient-transport-chairs" },
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "Examination Tables",                  brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/52_examination-tables" },
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "Gynaecological Examination Tables",   brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/24_gynaecological-examination-tables" },
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "Blood Donor Chair",                   brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/30_blood-donor-chair" },
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "Dialysis and Chemotherapy Chairs",    brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/58_dialysis-and-chemoterrapy-chairs" },
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "ENT Chairs",                          brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/47_ent-chairs" },
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "Physical Therapy and Rehabilitation", brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/29_physical-therapy-and-rehabilitation" },
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "Medicine and Treatment Carts",        brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/25_medicine-and-treatment-carts" },
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "Bedside Cabinet and Over Bed Table",  brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/62_bedside-cabinet-and-over-bed-table" },
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "Baby Cots",                           brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/26_baby-cots" },
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "Medical Cart",                        brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/65_medical-cart" },
  { department: "Medical Furniture & Physiotherapy", category: "Hospital & Medical Furniture", name: "Sleepers & Recliners",                brand: "Nitrocare",   country: "Turkey",      source_url: "https://www.nitrocare.com.tr/urunler/en/68_sleepers-recliners--" },
  { department: "Medical Furniture & Physiotherapy", category: "Medical Refrigeration",        name: "Hospital Refrigerators & Freezer",    brand: "Gram BioLine", country: "Denmark",    source_url: "https://gram-bioline.com/" },
  { department: "Medical Furniture & Physiotherapy", category: "Medical Refrigeration",        name: "ATEX",                                brand: "Gram BioLine", country: "Denmark",    source_url: "https://gram-bioline.com/application/atex/" },
  { department: "Medical Furniture & Physiotherapy", category: "Medical Refrigeration",        name: "Medicine",                            brand: "Gram BioLine", country: "Denmark",    source_url: "https://gram-bioline.com/application/medicine/" },
  { department: "Medical Furniture & Physiotherapy", category: "Medical Refrigeration",        name: "GMP",                                 brand: "Gram BioLine", country: "Denmark",    source_url: "https://gram-bioline.com/application/gmp/" },
  { department: "Medical Furniture & Physiotherapy", category: "Medical Refrigeration",        name: "GLP",                                 brand: "Gram BioLine", country: "Denmark",    source_url: "https://gram-bioline.com/application/glp/" },
  { department: "Medical Furniture & Physiotherapy", category: "Medical Refrigeration",        name: "LAB",                                 brand: "Gram BioLine", country: "Denmark",    source_url: "https://gram-bioline.com/application/lab/" },
  { department: "Medical Furniture & Physiotherapy", category: "Medical Refrigeration",        name: "Tissue",                              brand: "Gram BioLine", country: "Denmark",    source_url: "https://gram-bioline.com/application/tissue/" },
  { department: "Medical Furniture & Physiotherapy", category: "Medical Refrigeration",        name: "Blood",                               brand: "Gram BioLine", country: "Denmark",    source_url: "https://gram-bioline.com/application/blood/" },
  { department: "Medical Furniture & Physiotherapy", category: "Shock Wave Devices",           name: "DolorClast® Radial Shock Waves",      brand: "EMS",         country: "Switzerland", source_url: "https://www.ems-dolorclast.com/products/dolorclastr-radial-shock-waves" },
  { department: "Medical Furniture & Physiotherapy", category: "Shock Wave Devices",           name: "DolorClast® Focused Shock Waves",     brand: "EMS",         country: "Switzerland", source_url: "https://www.ems-dolorclast.com/products/dolorclastr-focused-shock-waves" },
  { department: "Medical Furniture & Physiotherapy", category: "Shock Wave Devices",           name: "DolorClast® High Power Laser",        brand: "EMS",         country: "Switzerland", source_url: "https://www.ems-dolorclast.com/products/dolorclastr-high-power-laser" },
  { department: "Medical Furniture & Physiotherapy", category: "Tecar Therapy",                name: "Therma - Tecar",                      brand: "LED Spa",     country: "Italy",       source_url: "https://www.led.it/en/portfolio_page/therma/" },
  { department: "Medical Furniture & Physiotherapy", category: "Electrotherapy",               name: "Electra - Electrotherapy",            brand: "LED Spa",     country: "Italy",       source_url: "https://www.led.it/en/portfolio_page/electra/" },
  { department: "Medical Furniture & Physiotherapy", category: "Therapeutic Ultrasound",       name: "Sonora - Ultrasound",                 brand: "LED Spa",     country: "Italy",       source_url: "https://www.led.it/en/portfolio_page/sonora/" },
  { department: "Medical Furniture & Physiotherapy", category: "Pressotherapy",                name: "Pressa - Pressotherapy",              brand: "LED Spa",     country: "Italy",       source_url: "https://www.led.it/en/portfolio_page/pressa/" },
  { department: "Medical Furniture & Physiotherapy", category: "Magnetotherapy",               name: "Tesla - Magnetotherapy",              brand: "LED Spa",     country: "Italy",       source_url: "https://www.led.it/en/portfolio_page/tesla-pulse/" },
  { department: "Medical Furniture & Physiotherapy", category: "VR Therapy",                   name: "CUREO VR Therapy Platform",           brand: "CUREosity",   country: "Germany",     source_url: "https://www.cureosity.com/" },

  // ── Sheet: Sterilization, Infection Control & Dental ──────
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Hospital Autoclaves",                   brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/medical-autoclaves" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Tabletop Autoclaves",                   brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/medical-autoclaves/medical-clinics-or/tabletop-autoclaves" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Washer-Disinfectors",                   brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/medical/washer-disinfectors" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Plasma Sterilizer",                     brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/medical-autoclaves/low-temperature-sterilizer" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Drying Cabinets",                       brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/medical/drying-warming-cabinets" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "T-Lab Eco",                             brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/laboratory-autoclaves/laboratory-research/vertical-autoclaves/t-lab-eco" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Vertical Autoclaves",                   brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/laboratory-autoclaves/laboratory-research/vertical-autoclaves" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Benchtop Autoclaves",                   brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/laboratory-autoclaves/laboratory-research/benchtop-autoclaves" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Horizontal Autoclaves",                 brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/laboratory-autoclaves/laboratory-research/large-laboratory-autoclaves" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Glassware Washers",                     brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/laboratory/laboratory-research/washer-disinfectors" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Biological Indicators",                 brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/consumables/process-control/biological-indicators" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Incubators for Biological Indicators",  brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/accessories/incubators" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Chemical Indicators",                   brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/consumables/chemical-indicators" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Cleaning Indicators",                   brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/consumables/cleaning-indicators" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Cleaning Materials",                    brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/consumables/cleaning-materials" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "H2O2 Sterilizing Agent",                brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/consumables/h2o2-sterilizing-agent" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Bowie & Dick / Helix Test Kits",        brand: "Tuttnauer",       country: "Hungary",     source_url: "https://tuttnauer.com/consumables/bowie-dick-helix-test-kits" },
  { department: "Sterilization, Infection Control & Dental", category: "Sterilization & CSSD",       name: "Pouches & Rolls for Sterilization Packaging", brand: "Tuttnauer", country: "Hungary",     source_url: "https://tuttnauer.com/consumables/pouches-and-rolls-for-sterilization-packaging" },
  { department: "Sterilization, Infection Control & Dental", category: "Disinfectant Solution",      name: "Huwa-San Fogger 3D",                    brand: "Roam Technology", country: "Belgium",     source_url: "https://www.roamtechnology.com/products/huwa-san-fogger-3d/" },
  { department: "Sterilization, Infection Control & Dental", category: "Disinfectant Solution",      name: "Huwa-San 12,5 MD",                      brand: "Roam Technology", country: "Belgium",     source_url: "https://www.roamtechnology.com/products/huwa-san-125-md/" },
  { department: "Sterilization, Infection Control & Dental", category: "Disinfectant Solution",      name: "Huwa-San 7,9 MD",                       brand: "Roam Technology", country: "Belgium",     source_url: "https://www.roamtechnology.com/products/huwa-san-79-md/" },
  { department: "Sterilization, Infection Control & Dental", category: "Disinfectant Solution",      name: "Huwa-San 5 MD",                         brand: "Roam Technology", country: "Belgium",     source_url: "https://www.roamtechnology.com/products/huwa-san-5-md/" },
  { department: "Sterilization, Infection Control & Dental", category: "Disinfectant Solution",      name: "Huwa-San 3 MD",                         brand: "Roam Technology", country: "Belgium",     source_url: "https://www.roamtechnology.com/products/huwa-san-3-md/" },
  { department: "Sterilization, Infection Control & Dental", category: "Disinfection & Cleaning",    name: "Hand Disinfection",                     brand: "Becht",           country: "Germany",     source_url: "https://www.alfredbecht.de/en/products/pro-medix/disinfection-and-cleaning/hand-disinfection.html" },
  { department: "Sterilization, Infection Control & Dental", category: "Disinfection & Cleaning",    name: "Surface Disinfection",                  brand: "Becht",           country: "Germany",     source_url: "https://www.alfredbecht.de/en/products/pro-medix/disinfection-and-cleaning/surface-disinfection.html" },
  { department: "Sterilization, Infection Control & Dental", category: "Disinfection & Cleaning",    name: "Instrument Disinfection",               brand: "Becht",           country: "Germany",     source_url: "https://www.alfredbecht.de/en/products/pro-medix/disinfection-and-cleaning/instrument-disinfection.html" },
  { department: "Sterilization, Infection Control & Dental", category: "Disinfection & Cleaning",    name: "Disinfection of Suction Systems",       brand: "Becht",           country: "Germany",     source_url: "https://www.alfredbecht.de/en/products/pro-medix/disinfection-and-cleaning/disinfection-of-suction-systems.html" },
  { department: "Sterilization, Infection Control & Dental", category: "Disinfection & Cleaning",    name: "Floor Disinfection",                    brand: "Becht",           country: "Germany",     source_url: "https://www.alfredbecht.de/en/products/pro-medix/disinfection-and-cleaning/floor-disinfection.html" },
  { department: "Sterilization, Infection Control & Dental", category: "Milling Machine",            name: "A7 & A7L",                              brand: "ARUM Dentistry",  country: "South Korea", source_url: "https://arumdentistry.com/eng/solution/aseries.php" },
  { department: "Sterilization, Infection Control & Dental", category: "Milling Machine",            name: "A5 Pro",                                brand: "ARUM Dentistry",  country: "South Korea", source_url: "https://arumdentistry.com/eng/solution/aseries.php" },
  { department: "Sterilization, Infection Control & Dental", category: "Milling Machine",            name: "A3 Pro & A3 & A3L",                     brand: "ARUM Dentistry",  country: "South Korea", source_url: "https://arumdentistry.com/eng/solution/aseries.php" },
  { department: "Sterilization, Infection Control & Dental", category: "Milling Machine",            name: "A1CS",                                  brand: "ARUM Dentistry",  country: "South Korea", source_url: "https://arumdentistry.com/eng/solution/aseries.php" },
  { department: "Sterilization, Infection Control & Dental", category: "CAM Software",               name: "ApexMill",                              brand: "ARUM Dentistry",  country: "South Korea", source_url: "https://arumdentistry.com/eng/solution/apex.php" },
  { department: "Sterilization, Infection Control & Dental", category: "Dental Prosthesis Components", name: "Master Fix",                          brand: "ARUM Dentistry",  country: "South Korea", source_url: "https://arumdentistry.com/eng/solution/master.php" },
  { department: "Sterilization, Infection Control & Dental", category: "Dental Prosthesis Components", name: "CF Scanbody",                         brand: "ARUM Dentistry",  country: "South Korea", source_url: "https://arumdentistry.com/eng/solution/CF_Scanbody.php" },
  { department: "Sterilization, Infection Control & Dental", category: "Dental Prosthesis Components", name: "Intraoral Scanbody",                  brand: "ARUM Dentistry",  country: "South Korea", source_url: "https://arumdentistry.com/eng/solution/consumables1.php" },
  { department: "Sterilization, Infection Control & Dental", category: "Dental Prosthesis Components", name: "Pre-milled Blank",                    brand: "ARUM Dentistry",  country: "South Korea", source_url: "https://arumdentistry.com/eng/solution/consumables2.php" },
  { department: "Sterilization, Infection Control & Dental", category: "Dental Prosthesis Components", name: "Ti-Base",                             brand: "ARUM Dentistry",  country: "South Korea", source_url: "https://arumdentistry.com/eng/solution/consumables3.php" },
  { department: "Sterilization, Infection Control & Dental", category: "Dental Prosthesis Components", name: "Model Scanbody",                      brand: "ARUM Dentistry",  country: "South Korea", source_url: "https://arumdentistry.com/eng/solution/consumables4.php" },
  { department: "Sterilization, Infection Control & Dental", category: "Dental CAD/CAM Milling",     name: "Analog",                               brand: "ARUM Dentistry",  country: "South Korea", source_url: "https://arumdentistry.com/eng/solution/consumables5.php" },
  { department: "Sterilization, Infection Control & Dental", category: "Dental Prosthesis Components", name: "Screw",                               brand: "ARUM Dentistry",  country: "South Korea", source_url: "https://arumdentistry.com/eng/solution/consumables6.php" },
  { department: "Sterilization, Infection Control & Dental", category: "Dental Prosthesis Components", name: "Driver [Lab/Clinical]",               brand: "ARUM Dentistry",  country: "South Korea", source_url: "https://arumdentistry.com/eng/solution/consumables7.php" },

  // ── Sheet: Surgical Solutions ─────────────────────────────
  { department: "Surgical Solutions", category: "Endoscopy System",       name: "AQ-300",                              brand: "AOHUA",                            country: "China",   source_url: "https://www.aohua.com/en/productDetail?id=1" },
  { department: "Surgical Solutions", category: "Endoscopy System",       name: "AQ-150",                              brand: "AOHUA",                            country: "China",   source_url: "https://www.aohua.com/en/productDetail?id=44" },
  { department: "Surgical Solutions", category: "Video Endoscope",        name: "UHD & VGT/VCC-60 Series",             brand: "AOHUA",                            country: "China",   source_url: "https://www.aohua.com/en/product?value=dznj" },
  { department: "Surgical Solutions", category: "Peripherals Devices",    name: "Endoscopic CO₂ Insufflation Pump",    brand: "AOHUA",                            country: "China",   source_url: "https://www.aohua.com/en/productDetail?id=51" },
  { department: "Surgical Solutions", category: "Peripherals Devices",    name: "Endoscopic Water Irrigation Pump",    brand: "AOHUA",                            country: "China",   source_url: "https://www.aohua.com/en/productDetail?id=52" },
  { department: "Surgical Solutions", category: "Ultrasonic Bone Surgery", name: "Spine surgery",                      brand: "mectron medical",                  country: "Italy",   source_url: "https://medical.mectron.com/clinical-applications/spine-surgery/" },
  { department: "Surgical Solutions", category: "Ultrasonic Bone Surgery", name: "Neuro surgery",                      brand: "mectron medical",                  country: "Italy",   source_url: "https://medical.mectron.com/clinical-applications/neurosurgery/" },
  { department: "Surgical Solutions", category: "Ultrasonic Bone Surgery", name: "ENT surgery",                        brand: "mectron medical",                  country: "Italy",   source_url: "https://medical.mectron.com/clinical-applications/ent-surgery/" },
  { department: "Surgical Solutions", category: "Ultrasonic Bone Surgery", name: "CranioFacial surgery",               brand: "mectron medical",                  country: "Italy",   source_url: "https://medical.mectron.com/clinical-applications/craniofacial-surgery/" },
  { department: "Surgical Solutions", category: "Ultrasonic Bone Surgery", name: "Facial Bone surgery",                brand: "mectron medical",                  country: "Italy",   source_url: "https://medical.mectron.com/clinical-applications/facial-bone/" },
  { department: "Surgical Solutions", category: "Ultrasonic Bone Surgery", name: "Extremities surgery",                brand: "mectron medical",                  country: "Italy",   source_url: "https://medical.mectron.com/clinical-applications/extremities-surgery/" },
  { department: "Surgical Solutions", category: "Medical Laser Systems",  name: "Dermatology & Aesthetics",            brand: "Limmer Laser",                     country: "Germany", source_url: "https://www.limmerlaser.de/en/applications/laser-in-dermatology-aesthetics" },
  { department: "Surgical Solutions", category: "Medical Laser Systems",  name: "ENT (Ear Nose Throat)",               brand: "Limmer Laser",                     country: "Germany", source_url: "https://www.limmerlaser.de/en/applications/laser-in-ent-ear-nose-throat" },
  { department: "Surgical Solutions", category: "Medical Laser Systems",  name: "Dentistry",                           brand: "Limmer Laser",                     country: "Germany", source_url: "https://www.limmerlaser.de/en/applications/laser-in-dentistry" },
  { department: "Surgical Solutions", category: "Medical Laser Systems",  name: "General Surgery",                     brand: "Limmer Laser",                     country: "Germany", source_url: "https://www.limmerlaser.de/en/applications/laser-in-general-surgery" },
  { department: "Surgical Solutions", category: "Medical Laser Systems",  name: "Gynecology",                          brand: "Limmer Laser",                     country: "Germany", source_url: "https://www.limmerlaser.de/en/applications/laser-in-gynecology" },
  { department: "Surgical Solutions", category: "Medical Laser Systems",  name: "Proctology",                          brand: "Limmer Laser",                     country: "Germany", source_url: "https://www.limmerlaser.de/en/applications/laser-in-proctology" },
  { department: "Surgical Solutions", category: "Medical Laser Systems",  name: "Urology",                             brand: "Limmer Laser",                     country: "Germany", source_url: "https://www.limmerlaser.de/en/applications/laser-in-urology" },
  { department: "Surgical Solutions", category: "Medical Laser Systems",  name: "Thoracic Surgery / Pneumology",       brand: "Limmer Laser",                     country: "Germany", source_url: "https://www.limmerlaser.de/en/applications/laser-in-thoracic-surgery-pneumology" },
  { department: "Surgical Solutions", category: "Operating Room",         name: "Surgical Tables",                     brand: "IG Medical",                       country: "Germany", source_url: "https://www.ig-medical.com/en/products/surgical-tables" },
  { department: "Surgical Solutions", category: "Operating Room",         name: "Surgical Light",                      brand: "IG Medical",                       country: "Germany", source_url: "https://www.ig-medical.com/en/products/surgical-lights" },
  { department: "Surgical Solutions", category: "Operating Room",         name: "Electrosurgical units",               brand: "IG Medical",                       country: "Germany", source_url: "https://www.ig-medical.com/en/products/electrosurgical-units" },
  { department: "Surgical Solutions", category: "Operating Room",         name: "Patient monitors",                    brand: "IG Medical",                       country: "Germany", source_url: "https://www.ig-medical.com/en/products/patient-monitors" },
  { department: "Surgical Solutions", category: "Operating Room",         name: "Electrocardiographs",                 brand: "IG Medical",                       country: "Germany", source_url: "https://www.ig-medical.com/en/products/electrocardiographs" },
  { department: "Surgical Solutions", category: "ENT Unit",               name: "Otocompact Professional EVO",         brand: "Euroclinic",                       country: "Italy",   source_url: "https://medicaresolutions.it/en/ent/" },
  { department: "Surgical Solutions", category: "Surgical Microscope",    name: "Dental Microscope",                   brand: "MediWorks",                        country: "China",   source_url: "https://www.mediworks.biz/surgical-microscope/" },
  { department: "Surgical Solutions", category: "Surgical Microscope",    name: "ENT Microscope",                      brand: "MediWorks",                        country: "China",   source_url: "https://www.mediworks.biz/surgical-microscope/" },
  { department: "Surgical Solutions", category: "Surgical Microscope",    name: "Ophthalmic Microscope",               brand: "MediWorks",                        country: "China",   source_url: "https://www.mediworks.biz/ophthalmic-surgical-microscope/" },
  { department: "Surgical Solutions", category: "Nitrous Oxide Sedation", name: "Dental Sedation",                     brand: "Baldus Sedation",                  country: "Germany", source_url: "https://baldus-sedation.com/baldus-products/baldus-touch/" },
  { department: "Surgical Solutions", category: "Nitrous Oxide Sedation", name: "Medical Sedation - Clinic & Centers", brand: "Baldus Sedation",                  country: "Germany", source_url: "https://baldus-sedation.com/baldus-products/baldus-analog/" },
  { department: "Surgical Solutions", category: "Nitrous Oxide Sedation", name: "Medical Sedation - Hospital",         brand: "Baldus Sedation",                  country: "Germany", source_url: "https://baldus-sedation.com/baldus-touch-mobile/" },
  { department: "Surgical Solutions", category: "AMS Sutures products",   name: "Wound Care",                          brand: "Advanced MedTech Solutions (AMS)", country: "India",   source_url: "https://www.amsltd.com/products/wound-care" },
  { department: "Surgical Solutions", category: "AMS Sutures products",   name: "Endo Surgery",                        brand: "Advanced MedTech Solutions (AMS)", country: "India",   source_url: "https://www.amsltd.com/products/endo-surgery" },
  { department: "Surgical Solutions", category: "AMS Sutures products",   name: "Hernia Solutions",                    brand: "Advanced MedTech Solutions (AMS)", country: "India",   source_url: "https://www.amsltd.com/products/hernia-solutions" },
  { department: "Surgical Solutions", category: "AMS Sutures products",   name: "Cardiac Surgery",                     brand: "Advanced MedTech Solutions (AMS)", country: "India",   source_url: "https://www.amsltd.com/products/cardiac-surgery" },
  { department: "Surgical Solutions", category: "AMS Sutures products",   name: "Interventional Cardiology",           brand: "Advanced MedTech Solutions (AMS)", country: "India",   source_url: "https://www.amsltd.com/products/interventional-cardiology" },
  { department: "Surgical Solutions", category: "AMS Sutures products",   name: "OEM Solutions",                       brand: "Advanced MedTech Solutions (AMS)", country: "India",   source_url: "https://www.amsltd.com/products/oem" },
  { department: "Surgical Solutions", category: "AMS Sutures products",   name: "Advanced Needle Technologies",        brand: "Advanced MedTech Solutions (AMS)", country: "India",   source_url: "https://www.amsltd.com/r-and-d/suture-needle-technology" },

  // ── Sheet: Life Care Solutions ────────────────────────────
  { department: "Life Care Solutions", category: "Diabetes Management",            name: "CGM All-In-One",        brand: "IntelliGO",       country: "Netherlands",  source_url: "https://www.intelligofree.com/index.html" },
  { department: "Life Care Solutions", category: "Respiratory",                    name: "Spirometers",           brand: "CHEST M.I., Inc.", country: "Japan",        source_url: "https://www.chest-mi.co.jp/en/product/spirometers" },
  { department: "Life Care Solutions", category: "Respiratory",                    name: "PFT Systems",           brand: "CHEST M.I., Inc.", country: "Japan",        source_url: "https://www.chest-mi.co.jp/en/product/pft_systems" },
  { department: "Life Care Solutions", category: "Respiratory",                    name: "Asthma & COPD Diagnosis", brand: "CHEST M.I., Inc.", country: "Japan",      source_url: "https://www.chest-mi.co.jp/en/product/asthma-copd_diagnosis" },
  { department: "Life Care Solutions", category: "Respiratory",                    name: "Accessories & Disposables (Respiratory)", brand: "CHEST M.I., Inc.", country: "Japan", source_url: "https://www.chest-mi.co.jp/en/product/accessories_disposables" },
  { department: "Life Care Solutions", category: "Orthopedic - Splints & Orthoses", name: "FINGER SPLINTS",        brand: "Chrisofix",       country: "Switzerland",  source_url: "https://chrisofix.com/finger-splints-metacarpal-region/" },
  { department: "Life Care Solutions", category: "Orthopedic - Splints & Orthoses", name: "SADDLE JOINT",          brand: "Chrisofix",       country: "Switzerland",  source_url: "https://chrisofix.com/saddle-joint-orthoses-for-osteoarthritis-rhizarthrosis/" },
  { department: "Life Care Solutions", category: "Orthopedic - Splints & Orthoses", name: "CARPAL TUNNEL SYNDROME", brand: "Chrisofix",      country: "Switzerland",  source_url: "https://chrisofix.com/wrist-orthoses-for-carpal-tunnel-syndrome/" },
  { department: "Life Care Solutions", category: "Orthopedic - Splints & Orthoses", name: "WRIST ORTHOSES",        brand: "Chrisofix",       country: "Switzerland",  source_url: "https://chrisofix.com/additional-wrist-orthoses/" },
  { department: "Life Care Solutions", category: "Orthopedic - Splints & Orthoses", name: "ELBOW ORTHOSES",        brand: "Chrisofix",       country: "Switzerland",  source_url: "https://chrisofix.com/elbow-orthoses/" },
  { department: "Life Care Solutions", category: "Orthopedic - Splints & Orthoses", name: "RIB SPLINT",            brand: "Chrisofix",       country: "Switzerland",  source_url: "https://chrisofix.com/rib-splint/" },
  { department: "Life Care Solutions", category: "Medical & Wound Care",           name: "ADHESIVE BANDAGES",     brand: "OVIK Health",     country: "United States", source_url: "https://ovikhealth.com/our-products/?e-filter-1f16084-product_tag=adhesives" },
  { department: "Life Care Solutions", category: "Medical & Wound Care",           name: "BURN DRESSING",         brand: "OVIK Health",     country: "United States", source_url: "https://ovikhealth.com/our-products/?e-filter-1f16084-product_tag=burn-dressings" },
  { department: "Life Care Solutions", category: "Medical & Wound Care",           name: "COHESIVE BANDAGES",     brand: "OVIK Health",     country: "United States", source_url: "https://ovikhealth.com/our-products/?e-filter-1f16084-product_tag=cohesives" },
  { department: "Life Care Solutions", category: "Medical & Wound Care",           name: "COMPRESSION",           brand: "OVIK Health",     country: "United States", source_url: "https://ovikhealth.com/our-products/?e-filter-1f16084-product_tag=compression" },
  { department: "Life Care Solutions", category: "Medical & Wound Care",           name: "TAPES",                 brand: "OVIK Health",     country: "United States", source_url: "https://ovikhealth.com/our-products/?e-filter-1f16084-product_tag=tapes" },
  { department: "Life Care Solutions", category: "Medical & Wound Care",           name: "WOUND CARE",            brand: "OVIK Health",     country: "United States", source_url: "https://ovikhealth.com/our-products/?e-filter-1f16084-product_tag=wound-care" },

  // ── Sheet: Consumables & Disposables ──────────────────────
  { department: "Consumables & Disposables", category: "General Consumables", name: "Clinical & Laboratory Consumables",        brand: "Medmay", country: "China", source_url: "https://www.med-may.com/" },
  { department: "Consumables & Disposables", category: "General Consumables", name: "Respiration / Anesthesia / First Aid",     brand: "Medmay", country: "China", source_url: "https://www.med-may.com/" },
  { department: "Consumables & Disposables", category: "General Consumables", name: "Monitoring & Measurement",                 brand: "Medmay", country: "China", source_url: "https://www.med-may.com/" },
  { department: "Consumables & Disposables", category: "General Consumables", name: "Surgical Equipment & Consumables",         brand: "Medmay", country: "China", source_url: "https://www.med-may.com/" },
  { department: "Consumables & Disposables", category: "General Consumables", name: "Infusion / Injection / Blood Purification", brand: "Medmay", country: "China", source_url: "https://www.med-may.com/" },
  { department: "Consumables & Disposables", category: "General Consumables", name: "Catheter & Tube",                          brand: "Medmay", country: "China", source_url: "https://www.med-may.com/" },
  { department: "Consumables & Disposables", category: "General Consumables", name: "Medical Dressings",                        brand: "Medmay", country: "China", source_url: "https://www.med-may.com/" },
  { department: "Consumables & Disposables", category: "General Consumables", name: "Sterilization & Infection Control (Consumables)", brand: "Medmay", country: "China", source_url: "https://www.med-may.com/" },
  { department: "Consumables & Disposables", category: "General Consumables", name: "Gynecology Examination & Treatment",       brand: "Medmay", country: "China", source_url: "https://www.med-may.com/" },
  { department: "Consumables & Disposables", category: "General Consumables", name: "Ward Care & Rehabilitation",               brand: "Medmay", country: "China", source_url: "https://www.med-may.com/" },
  { department: "Consumables & Disposables", category: "General Consumables", name: "Personal Protection",                      brand: "Medmay", country: "China", source_url: "https://www.med-may.com/" },
  { department: "Consumables & Disposables", category: "General Consumables", name: "Orthopedics (Consumables)",                brand: "Medmay", country: "China", source_url: "https://www.med-may.com/" },
];

// Manual image fallbacks for sites that block scraping or whose
// pages don't expose an og:image.
const IMAGE_OVERRIDES: Record<string, string> = {
  "https://www.edan.com/product/h/LX9.html":
    "https://edanusa.com/wp-content/uploads/sites/12/2023/04/LX92.png",
  "https://www.edan.com/product/h/Acclarix_AX9.html":
    "https://image.rehabmart.com/include-mt/img-resize.asp?output=webp&path=/imagesfromrd/ax8_(1).jpg&newwidth=740&quality=80",
  "https://www.edan.com/product/h/Nano_L12_EXP.html":
    "https://techxlab.org/wp-content/uploads/2025/06/Screenshot-2025-06-23-at-10.16.41%20a.m.png",
};

// Brand-level image fallback for sites that block scraping or
// don't expose an og:image. Used only when fetchOgImage() fails.
const BRAND_IMAGE_FALLBACK: Record<string, string> = {
  "Tuttnauer":
    "https://www.tuttnauer.com/sites/default/files/styles/product_category_large/public/2024-03/t-top--tabletop-autoclave--tuttnauer-fv1.png.webp?itok=e-uXM24C",
  "AOHUA":
    "https://mma.prnewswire.com/media/2375021/aohua_endoscopy_aq_300_is_recognized_as_endoscopy_product_innovation_award_by_the_healthcare_asia_me.jpg",
  "Gram BioLine":
    "https://gram-bioline.com/images/bioline-identity-logo-large.svg",
};

// Brand websites (root domain pulled from product URLs)
const BRAND_SITES: Record<string, string> = {
  "Neusoft Medical Systems": "https://www.neusoftmedical.com/en/",
  "Allengers": "https://www.allengers.com/",
  "EDAN": "https://www.edan.com/",
  "Nitrocare": "https://www.nitrocare.com.tr/",
  "Gram BioLine": "https://gram-bioline.com/",
  "EMS": "https://www.ems-dolorclast.com/",
  "LED Spa": "https://www.led.it/",
  "CUREosity": "https://www.cureosity.com/",
  "Tuttnauer": "https://tuttnauer.com/",
  "Roam Technology": "https://www.roamtechnology.com/",
  "Becht": "https://www.alfredbecht.de/",
  "ARUM Dentistry": "https://arumdentistry.com/",
  "AOHUA": "https://www.aohua.com/",
  "mectron medical": "https://medical.mectron.com/",
  "Limmer Laser": "https://www.limmerlaser.de/",
  "IG Medical": "https://www.ig-medical.com/",
  "Euroclinic": "https://medicaresolutions.it/en/",
  "MediWorks": "https://www.mediworks.biz/",
  "Baldus Sedation": "https://baldus-sedation.com/",
  "Advanced MedTech Solutions (AMS)": "https://www.amsltd.com/",
  "IntelliGO": "https://www.intelligofree.com/",
  "CHEST M.I., Inc.": "https://www.chest-mi.co.jp/",
  "Chrisofix": "https://chrisofix.com/",
  "OVIK Health": "https://ovikhealth.com/",
  "Medmay": "https://www.med-may.com/",
};

// ── Helpers ─────────────────────────────────────────────────
const norm = (s: string) => s.trim().toLowerCase();
const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = await res.text();

    const og = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    );
    if (og?.[1]) return absolutize(og[1], url);

    const ogAlt = html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    );
    if (ogAlt?.[1]) return absolutize(ogAlt[1], url);

    const tw = html.match(
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    );
    if (tw?.[1]) return absolutize(tw[1], url);

    const img = html.match(
      /<img[^>]+src=["']([^"']+\.(?:jpe?g|png|webp))["']/i,
    );
    if (img?.[1]) return absolutize(img[1], url);

    return null;
  } catch {
    return null;
  }
}

function absolutize(src: string, base: string): string {
  try {
    return new URL(src, base).toString();
  } catch {
    return src;
  }
}

async function safeUpsert(
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string,
) {
  let payload = rows;
  for (let attempt = 0; attempt < 8; attempt++) {
    const { error } = await supabase
      .from(table)
      .upsert(payload, { onConflict });
    if (!error) return;
    if (error.code !== "PGRST204") throw error;
    const m = error.message.match(/'([^']+)' column/);
    if (!m) throw error;
    const bad = m[1];
    payload = payload.map(({ [bad]: _drop, ...rest }) => rest);
  }
  throw new Error(`safeUpsert(${table}) gave up`);
}

// ── Pipeline ────────────────────────────────────────────────
async function ensureDepartments(): Promise<Map<string, string>> {
  console.log(`→ Departments (${KEEP_DEPARTMENTS.length})`);

  const rows = KEEP_DEPARTMENTS.map((name, i) => ({
    slug: slugify(name),
    name,
    sort_order: 100 + i,
  }));
  await safeUpsert("departments", rows as Record<string, unknown>[], "slug");

  const { data, error } = await supabase.from("departments").select("id,name");
  if (error) throw error;

  const idByName = new Map<string, string>();
  for (const d of data ?? []) idByName.set(norm(d.name), d.id);
  console.log(`✔  ${(data ?? []).length} departments in DB`);
  return idByName;
}

async function ensureBrands(): Promise<Map<string, string>> {
  const names = Array.from(new Set(ROWS.map((r) => r.brand)));
  console.log(`→ Brands (${names.length})`);

  const rows = names.map((name, i) => ({
    slug: slugify(name),
    name,
    sort_order: 100 + i,
    website_link: BRAND_SITES[name] ?? null,
    country: ROWS.find((r) => r.brand === name)?.country ?? null,
    website: BRAND_SITES[name] ?? null,
  }));
  await safeUpsert("brands", rows as Record<string, unknown>[], "slug");

  const { data, error } = await supabase.from("brands").select("id,name");
  if (error) throw error;
  const idByName = new Map<string, string>();
  for (const b of data ?? []) idByName.set(norm(b.name), b.id);
  console.log(`✔  ${(data ?? []).length} brands in DB`);
  return idByName;
}

async function upsertProducts(
  brandIds: Map<string, string>,
  deptIds: Map<string, string>,
) {
  console.log(`→ Products (${ROWS.length}) — fetching images …`);

  const { data: existing, error: readErr } = await supabase
    .from("products")
    .select("id,name,brand,image_url");
  if (readErr) throw readErr;

  const keyOf = (n: string, b: string) => `${norm(n)}|${norm(b)}`;
  const existingByKey = new Map<
    string,
    { id: string; image_url: string | null }
  >();
  for (const r of existing ?? []) {
    if (r.name && r.brand)
      existingByKey.set(keyOf(r.name, r.brand), {
        id: r.id,
        image_url: r.image_url ?? null,
      });
  }

  // Fetch images in concurrency-limited batches.
  const concurrency = 6;
  const images = new Array<string | null>(ROWS.length).fill(null);

  for (let i = 0; i < ROWS.length; i += concurrency) {
    const slice = ROWS.slice(i, i + concurrency);
    const results = await Promise.all(
      slice.map(async (r) => {
        if (IMAGE_OVERRIDES[r.source_url]) return IMAGE_OVERRIDES[r.source_url];
        const og = await fetchOgImage(r.source_url);
        return og ?? BRAND_IMAGE_FALLBACK[r.brand] ?? null;
      }),
    );
    for (let k = 0; k < results.length; k++) {
      images[i + k] = results[k];
      const r = slice[k];
      console.log(
        `   [${i + k + 1}/${ROWS.length}] ${r.name} → ${results[k] ? "image ✓" : "image ✗"}`,
      );
    }
  }

  let inserted = 0;
  let updated = 0;

  for (let i = 0; i < ROWS.length; i++) {
    const r = ROWS[i];
    const dept = deptIds.get(norm(r.department));
    const brand = brandIds.get(norm(r.brand));
    const newImg = images[i];

    const existingRow = existingByKey.get(keyOf(r.name, r.brand));
    const image_url = newImg ?? existingRow?.image_url ?? null;

    const payload: Record<string, unknown> = {
      name: r.name,
      category: r.category,
      brand: r.brand,
      brand_id: brand ?? null,
      department_id: dept ?? null,
      image_url,
      is_quotable: true,
    };

    if (existingRow) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", existingRow.id);
      if (error) await stripAndRetry("update", existingRow.id, payload, error);
      updated++;
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) await stripAndRetry("insert", null, payload, error);
      inserted++;
    }
  }

  console.log(`✔  products: ${inserted} inserted, ${updated} updated`);
}

async function stripAndRetry(
  op: "insert" | "update",
  id: string | null,
  payload: Record<string, unknown>,
  firstErr: { code?: string; message: string },
) {
  let p = { ...payload };
  let err: any = firstErr;
  for (let i = 0; i < 8; i++) {
    if (err.code !== "PGRST204" && err.code !== "42703") throw err;
    const m = err.message.match(/'([^']+)' column|column "([^"]+)"/);
    const bad = m?.[1] ?? m?.[2];
    if (!bad) throw err;
    delete p[bad];
    const r =
      op === "insert"
        ? await supabase.from("products").insert(p)
        : await supabase.from("products").update(p).eq("id", id!);
    if (!r.error) return;
    err = r.error;
  }
  throw err;
}

async function pruneDepartments() {
  const keepSlugs = new Set(KEEP_DEPARTMENTS.map(slugify));
  const { data, error } = await supabase
    .from("departments")
    .select("id,slug,name");
  if (error) throw error;
  const drop = (data ?? []).filter((d) => !keepSlugs.has(d.slug));
  if (drop.length === 0) {
    console.log("→ Departments prune: nothing to remove");
    return;
  }
  console.log(`→ Pruning ${drop.length} unused departments`);
  for (const d of drop) {
    // ON DELETE SET NULL on products.department_id keeps products safe.
    const { error: delErr } = await supabase
      .from("departments")
      .delete()
      .eq("id", d.id);
    if (delErr) console.warn(`  ⚠  could not delete '${d.name}': ${delErr.message}`);
  }
}

async function pruneBrands() {
  // Distinct brand names actually in use.
  const { data: used, error: useErr } = await supabase
    .from("products")
    .select("brand");
  if (useErr) throw useErr;
  const inUse = new Set(
    (used ?? [])
      .map((r) => (typeof r.brand === "string" ? norm(r.brand) : null))
      .filter(Boolean) as string[],
  );

  const { data: brands, error } = await supabase.from("brands").select("id,name");
  if (error) throw error;
  const drop = (brands ?? []).filter((b) => !inUse.has(norm(b.name)));
  if (drop.length === 0) {
    console.log("→ Brands prune: nothing to remove");
    return;
  }
  console.log(`→ Pruning ${drop.length} unused brands`);
  for (const b of drop) {
    const { error: delErr } = await supabase
      .from("brands")
      .delete()
      .eq("id", b.id);
    if (delErr) console.warn(`  ⚠  could not delete brand '${b.name}': ${delErr.message}`);
  }
}

(async () => {
  try {
    const deptIds = await ensureDepartments();
    const brandIds = await ensureBrands();
    await upsertProducts(brandIds, deptIds);
    await pruneDepartments();
    await pruneBrands();
    console.log("\n✅  Spreadsheet seed complete.");
  } catch (err) {
    console.error("✖  Seed failed:", err);
    process.exit(1);
  }
})();
