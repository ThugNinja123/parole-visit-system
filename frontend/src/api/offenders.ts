import { apiClient } from "@/api/client";
import type {
  BulkUploadResult,
  IncidentStatus,
  IncidentType,
  Offender,
  Paginated,
  ParoleCondition,
  ParoleIncident,
  ParoleStatus,
  RiskLevel,
} from "@/types";

export interface OffenderFilters {
  search?: string;
  district?: number;
  police_station?: number;
  parole_status?: ParoleStatus;
  risk_level?: RiskLevel;
  page?: number;
}

export async function fetchOffenders(filters: OffenderFilters = {}): Promise<Paginated<Offender>> {
  const { data } = await apiClient.get<Paginated<Offender>>("/offenders/", { params: filters });
  return data;
}

export async function fetchOffender(id: number): Promise<Offender> {
  const { data } = await apiClient.get<Offender>(`/offenders/${id}/`);
  return data;
}

export type OffenderFormValues = Omit<
  Offender,
  | "id"
  | "district_name"
  | "police_station_name"
  | "ps_arrested_name"
  | "age"
  | "crime_count"
  | "last_visit"
  | "created_at"
  | "updated_at"
  | "offender_image"
> & { offender_image?: File | null };

function buildOffenderFormData(values: Partial<OffenderFormValues>): FormData {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "offender_image" && value instanceof File) {
      formData.append(key, value);
    } else if (key !== "offender_image") {
      formData.append(key, String(value));
    }
  });
  return formData;
}

export async function createOffender(values: OffenderFormValues): Promise<Offender> {
  const { data } = await apiClient.post<Offender>("/offenders/", buildOffenderFormData(values));
  return data;
}

export async function updateOffender(
  id: number,
  values: Partial<OffenderFormValues>,
): Promise<Offender> {
  const { data } = await apiClient.patch<Offender>(`/offenders/${id}/`, buildOffenderFormData(values));
  return data;
}

export async function deleteOffender(id: number): Promise<void> {
  await apiClient.delete(`/offenders/${id}/`);
}

export async function bulkUploadOffenders(file: File): Promise<BulkUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<BulkUploadResult>("/offenders/bulk-upload/", formData);
  return data;
}

export async function fetchParoleConditions(offenderId: number): Promise<ParoleCondition[]> {
  const { data } = await apiClient.get<Paginated<ParoleCondition> | ParoleCondition[]>(
    "/parole-conditions/",
    { params: { offender: offenderId } },
  );
  return Array.isArray(data) ? data : data.results;
}

export type ParoleConditionPayload = {
  offender: number;
  title: string;
  description: string;
  is_violated: boolean;
};

export async function createParoleCondition(payload: ParoleConditionPayload): Promise<ParoleCondition> {
  const { data } = await apiClient.post<ParoleCondition>("/parole-conditions/", payload);
  return data;
}

export async function updateParoleCondition(
  id: number,
  payload: Partial<ParoleConditionPayload>,
): Promise<ParoleCondition> {
  const { data } = await apiClient.patch<ParoleCondition>(`/parole-conditions/${id}/`, payload);
  return data;
}

export async function deleteParoleCondition(id: number): Promise<void> {
  await apiClient.delete(`/parole-conditions/${id}/`);
}

export async function fetchIncidents(offenderId: number): Promise<ParoleIncident[]> {
  const { data } = await apiClient.get<Paginated<ParoleIncident> | ParoleIncident[]>(
    "/parole-incidents/",
    { params: { offender: offenderId } },
  );
  return Array.isArray(data) ? data : data.results;
}

export type IncidentPayload = {
  offender: number;
  incident_type: IncidentType;
  status: IncidentStatus;
  date: string;
  description: string;
};

export async function createIncident(payload: IncidentPayload): Promise<ParoleIncident> {
  const { data } = await apiClient.post<ParoleIncident>("/parole-incidents/", payload);
  return data;
}

export async function updateIncident(
  id: number,
  payload: Partial<IncidentPayload>,
): Promise<ParoleIncident> {
  const { data } = await apiClient.patch<ParoleIncident>(`/parole-incidents/${id}/`, payload);
  return data;
}
