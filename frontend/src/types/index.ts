export interface District {
  id: number;
  name: string;
  code: string;
  latitude: number | null;
  longitude: number | null;
}

export interface PoliceStation {
  id: number;
  district: number;
  district_name: string;
  name: string;
  code: string;
  latitude: number | null;
  longitude: number | null;
}

export interface Permission {
  id: number;
  code: string;
  label: string;
  category: string;
}

export interface PermissionGroup {
  category: string;
  permissions: Permission[];
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  permissions: Permission[];
  permission_ids?: number[];
  user_count: number;
}

export interface AppUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  is_active: boolean;
  police_station: number | null;
  police_station_name: string | null;
  role_names: string[];
}

export interface CurrentUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_superuser: boolean;
  police_station: number | null;
  police_station_name: string | null;
  role_names: string[];
  permissions: string[];
}

export type ParoleStatus = "active" | "completed" | "absconded";
export type RiskLevel = "low" | "medium" | "high";
export type EyeColor = "brown" | "blue" | "green" | "hazel" | "gray" | "black" | "other" | "";

export interface LastVisitSummary {
  id: number;
  visited_at: string;
  remarks: string;
  visit_photo: string | null;
  location_status: "verified" | "flagged";
  checked_by: string;
}

export interface Offender {
  id: number;
  district: number;
  district_name: string;
  police_station: number;
  police_station_name: string;
  ps_arrested: number | null;
  ps_arrested_name: string | null;
  name: string;
  aliases: string;
  date_of_birth: string | null;
  age: number | null;
  mobile_no: string;
  present_address: string;
  date_of_last_arrest: string | null;
  latitude: number;
  longitude: number;
  offender_image: string | null;
  parole_status: ParoleStatus;
  risk_level: RiskLevel;
  case_number: string;
  // gps_monitor_enabled: boolean;
  height: string;
  weight: string;
  eye_color: EyeColor;
  employer_name: string;
  conviction_summary: string;
  sentence_years: number | null;
  years_served: number | null;
  parole_granted_date: string | null;
  parole_end_date: string | null;
  crime_count: number;
  last_visit: LastVisitSummary | null;
  created_at: string;
  updated_at: string;
}

export interface ParoleCondition {
  id: number;
  offender: number;
  title: string;
  description: string;
  is_violated: boolean;
  created_at: string;
  updated_at: string;
}

export type IncidentType = "missed_checkin" | "contraband" | "curfew_violation" | "other";
export type IncidentStatus = "pending" | "resolved" | "infraction";

export interface ParoleIncident {
  id: number;
  offender: number;
  incident_type: IncidentType;
  status: IncidentStatus;
  date: string;
  description: string;
  added_by: number | null;
  added_by_name: string | null;
  created_at: string;
}

export type CrimeType =
  | "theft"
  | "robbery"
  | "assault"
  | "homicide"
  | "drug_offense"
  | "weapons_offense"
  | "fraud"
  | "other";

export interface Crime {
  id: number;
  offender: number;
  crime_type: CrimeType;
  description: string;
  date_committed: string | null;
  case_number: string;
  added_by: number | null;
  added_by_name: string | null;
  created_at: string;
}

export type InventoryItemType = "weapon" | "substance" | "other";
export type InventoryItemStatus = "in_custody" | "released" | "destroyed";

export interface InventoryItem {
  id: number;
  offender: number;
  crime: number | null;
  item_type: InventoryItemType;
  description: string;
  quantity: string;
  storage_location: string;
  status: InventoryItemStatus;
  date_seized: string | null;
  added_by: number | null;
  added_by_name: string | null;
  created_at: string;
}

export type VisitScheduleStatus = "pending" | "completed" | "missed" | "cancelled";

export interface VisitSchedule {
  id: number;
  offender: number;
  offender_name: string;
  assigned_officer: number;
  assigned_officer_name: string;
  scheduled_date: string;
  status: VisitScheduleStatus;
  notes: string;
  has_record: boolean;
  created_at: string;
}

export type LocationStatus = "verified" | "flagged";
export type VisitType = "field_home" | "office_checkin" | "field_employer" | "other";

export interface VisitRecord {
  id: number;
  schedule: number | null;
  offender: number;
  offender_name: string;
  officer: number;
  officer_name: string;
  visit_type: VisitType;
  visited_at: string;
  officer_latitude: number;
  officer_longitude: number;
  distance_meters: number;
  location_status: LocationStatus;
  remarks: string;
  visit_photo: string | null;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BulkUploadRowError {
  row: number;
  errors: Record<string, string[]>;
}

export interface BulkUploadResult {
  created: number;
  total_rows: number;
  errors: BulkUploadRowError[];
}
