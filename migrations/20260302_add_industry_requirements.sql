-- Migration to add requirements 54 and 55 to Industry category
UPDATE requirements 
SET stage1 = stage1 || '[
  {"label": "54. Valid OSH-related Certifications / Accreditations / Awards (e.g. ISO 45001, 14001)", "category": "Requirement"},
  {"label": "55. Industry-specific compliances with guidelines set by authorities having jurisdiction as specified in the IRR of R.A. No. 11058", "category": "Requirement"}
]'::jsonb 
WHERE category_id = 'cat_industry';
