/** Bulk-upload CSV conventions — keep date examples aligned with backend bulk_upload_rules.py */
export const BULK_UPLOAD_DATE_FORMAT = "DD/MM/YYYY";

export const BULK_UPLOAD_DATE_FIELDS = [
  "date_of_birth",
  "date_of_last_arrest",
  "parole_granted_date",
  "parole_end_date",
] as const;

export const TEMPLATE_COLUMNS = [
  "name",
  "aliases",
  "date_of_birth",
  "mobile_no",
  "present_address",
  "date_of_last_arrest",
  "district",
  "police_station",
  "latitude",
  "longitude",
  "parole_status",
  "case_number",
  // "gps_monitor_enabled",
  "height",
  "weight",
  "eye_color",
  "employer_name",
  "conviction_summary",
  "sentence_years",
  "years_served",
  "parole_granted_date",
  "parole_end_date",
];

export const TEMPLATE_EXAMPLE_ROW = [
  "John Doe",
  "Johnny",
  "12/04/1985",
  "+1-555-0100",
  "123 Main St, Springfield",
  "15/01/2024",
  "Springfield District",
  "Springfield Central",
  "39.7817",
  "-89.6501",
  "active",
  "P-10234",
  // "false",
  `5' 10"`,
  "180 lbs",
  "brown",
  "Acme Corp",
  "Aggravated Assault (Felony Class B)",
  "5",
  "2",
  "01/02/2024",
  "01/02/2029",
];
