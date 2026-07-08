import { apiClient } from "@/api/client";
import type { Paginated, VisitRecord, VisitSchedule, VisitScheduleStatus, VisitType } from "@/types";

export interface VisitScheduleFilters {
  offender?: number;
  assigned_officer?: number;
  status?: VisitScheduleStatus;
  scheduled_date?: string;
}

export async function fetchVisitSchedules(
  filters: VisitScheduleFilters = {},
): Promise<Paginated<VisitSchedule>> {
  const { data } = await apiClient.get<Paginated<VisitSchedule>>("/visit-schedules/", { params: filters });
  return data;
}

export async function fetchMySchedules(): Promise<Paginated<VisitSchedule>> {
  const { data } = await apiClient.get<Paginated<VisitSchedule>>("/visit-schedules/mine/");
  return data;
}

export type VisitScheduleInput = {
  offender: number;
  assigned_officer: number;
  scheduled_date: string;
  notes?: string;
};

export async function createVisitSchedule(payload: VisitScheduleInput): Promise<VisitSchedule> {
  const { data } = await apiClient.post<VisitSchedule>("/visit-schedules/", payload);
  return data;
}

export async function updateVisitSchedule(
  id: number,
  payload: Partial<VisitScheduleInput & { status: VisitScheduleStatus }>,
): Promise<VisitSchedule> {
  const { data } = await apiClient.patch<VisitSchedule>(`/visit-schedules/${id}/`, payload);
  return data;
}

export async function deleteVisitSchedule(id: number): Promise<void> {
  await apiClient.delete(`/visit-schedules/${id}/`);
}

export async function fetchFlaggedVisits(): Promise<Paginated<VisitRecord>> {
  const { data } = await apiClient.get<Paginated<VisitRecord>>("/visit-records/flagged/");
  return data;
}

export async function fetchVisitRecords(offenderId?: number): Promise<Paginated<VisitRecord>> {
  const { data } = await apiClient.get<Paginated<VisitRecord>>("/visit-records/", {
    params: { offender: offenderId },
  });
  return data;
}

export interface SubmitVisitRecordInput {
  schedule?: number;
  offender: number;
  visit_type?: VisitType;
  officer_latitude: number;
  officer_longitude: number;
  remarks: string;
  visit_photo?: File | null;
}

export async function submitVisitRecord(input: SubmitVisitRecordInput): Promise<VisitRecord> {
  const formData = new FormData();
  if (input.schedule) formData.append("schedule", String(input.schedule));
  formData.append("offender", String(input.offender));
  if (input.visit_type) formData.append("visit_type", input.visit_type);
  formData.append("officer_latitude", String(input.officer_latitude));
  formData.append("officer_longitude", String(input.officer_longitude));
  formData.append("remarks", input.remarks);
  if (input.visit_photo) formData.append("visit_photo", input.visit_photo);

  const { data } = await apiClient.post<VisitRecord>("/visit-records/", formData);
  return data;
}

export async function reviewVisitRecord(id: number, notes?: string): Promise<VisitRecord> {
  const { data } = await apiClient.post<VisitRecord>(`/visit-records/${id}/review/`, { notes });
  return data;
}
