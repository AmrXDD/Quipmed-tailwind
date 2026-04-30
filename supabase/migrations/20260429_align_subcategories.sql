-- ─────────────────────────────────────────────────────────────────
-- Align every product to its canonical subcategory.
-- Idempotent: matches on products.slug (unique). Re-runnable.
-- Run in Supabase SQL editor or `supabase db push`.
-- ─────────────────────────────────────────────────────────────────

-- Medical Imaging
update products set subcategory = 'MRI'                       where slug = 'neusoft-mri';
update products set subcategory = 'CT'                        where slug = 'neusoft-ct';
update products set subcategory = 'PET-CT'                    where slug = 'neusoft-petct';
update products set subcategory = 'DSA / Angiography'         where slug = 'neusoft-dsa';
update products set subcategory = 'X-Ray'                     where slug = 'neusoft-xray';
update products set subcategory = 'Mammography'               where slug = 'neucare-mammo';
update products set subcategory = 'Mobile C-Arm'              where slug = 'allengers-carm';
update products set subcategory = 'Mammography Tomosynthesis' where slug = 'allengers-3d-mammo';
update products set subcategory = 'Mobile X-Ray'              where slug = 'allengers-mobile-xray';
update products set subcategory = 'Ultrasound'                where slug = 'edan-ultrasound';

-- Medical Furniture & Physiotherapy
update products set subcategory = 'Hospital Furniture'           where slug = 'nitrocare-furniture';
update products set subcategory = 'Cold Storage'                 where slug = 'gram-biocompact';
update products set subcategory = 'Shockwave Therapy'            where slug = 'ems-dolorclast';
update products set subcategory = 'Electromedical Physiotherapy' where slug = 'led-physioled';
update products set subcategory = 'VR Therapy'                   where slug = 'cureosity-vr';

-- Sterilization & Infection Control
update products set subcategory = 'Room Disinfection'    where slug = 'roam-fogger-3d';
update products set subcategory = 'Surface Disinfection' where slug = 'roam-79md';
update products set subcategory = 'Hygiene & Cleaning'   where slug = 'becht-hygiene';
update products set subcategory = 'CSSD / Autoclave'     where slug = 'tuttnauer-cssd';

-- Surgical Solutions
update products set subcategory = 'Endoscopy'      where slug = 'aohua-4k-endoscopy';
update products set subcategory = 'Surgical Motor' where slug = 'nouvag-highsurg30';
update products set subcategory = 'Liposuction'    where slug = 'nouvag-liposuction';
update products set subcategory = 'Dermatome'      where slug = 'nouvag-tcm3000';
update products set subcategory = 'Piezosurgery'   where slug = 'mectron-piezosurgery';
update products set subcategory = 'Surgical Laser' where slug = 'limmer-laser';
update products set subcategory = 'Electrosurgery' where slug = 'led-electrosurgery';
update products set subcategory = 'OR Tables'      where slug = 'ig-surgical-tables';
update products set subcategory = 'OR Lights'      where slug = 'ig-surgical-lights';
update products set subcategory = 'ENT'            where slug = 'mnt-ent-unit';
update products set subcategory = 'Microscope'     where slug = 'mediworks-microscope';
update products set subcategory = 'Sedation'       where slug = 'baldus-n2o';
update products set subcategory = 'Sutures'        where slug = 'ams-sutures';
update products set subcategory = 'Biopsy'         where slug = 'wellgo-biopsy';

-- Patient Care
update products set subcategory = 'CGM'         where slug = 'intelligo-cgm';
update products set subcategory = 'Orthopedics' where slug = 'chrisofix-orthopedic';
update products set subcategory = 'Wound Care'  where slug = 'ovik-wound-care';

-- Life Support
update products set subcategory = 'Patient Monitoring' where slug = 'ig-patient-monitors';
update products set subcategory = 'Pulmonary / PFT'    where slug = 'chest-pft';

-- ─────────────────────────────────────────────────────────────────
-- General backfill: every product still missing a subcategory inherits
-- its `category` value (which the admin portal currently fills as the
-- effective sub-tag — e.g. "Ultrasound", "Mammography", "X-Ray").
-- Safe: only runs where subcategory IS NULL, never overwrites.
-- ─────────────────────────────────────────────────────────────────
update products
   set subcategory = category
 where subcategory is null
   and category is not null
   and category <> ''
   and category <> 'Uncategorized';

-- Best-effort name-pattern backfill for anything still NULL.
update products set subcategory = 'CT'          where subcategory is null and lower(name) ~ '\mct\M';
update products set subcategory = 'MRI'         where subcategory is null and lower(name) like '%mri%';
update products set subcategory = 'X-Ray'       where subcategory is null and (lower(name) like '%x-ray%' or lower(name) like '%xray%');
update products set subcategory = 'Ultrasound'  where subcategory is null and lower(name) like '%ultrasound%';
update products set subcategory = 'Mammography' where subcategory is null and lower(name) like '%mammo%';
update products set subcategory = 'PET-CT'      where subcategory is null and (lower(name) like '%pet/ct%' or lower(name) like '%pet ct%' or lower(name) like '%pet-ct%');
update products set subcategory = 'Endoscopy'   where subcategory is null and lower(name) like '%endoscop%';
update products set subcategory = 'CGM'         where subcategory is null and (lower(name) like '%cgm%' or lower(name) like '%glucose monitor%');
update products set subcategory = 'Wound Care'  where subcategory is null and lower(name) like '%wound%';
update products set subcategory = 'Fluoroscopy' where subcategory is null and lower(name) like '%fluorosc%';
