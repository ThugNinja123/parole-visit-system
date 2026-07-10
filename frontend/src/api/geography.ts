import { apiClient } from "@/api/client";
import type { District, Paginated, PoliceStation } from "@/types";

export async function fetchDistricts(): Promise<District[]> {
  const { data } = await apiClient.get<Paginated<District> | District[]>("/districts/", {
    params: { page_size: 200 },
  });
  return Array.isArray(data) ? data : data.results;
}

export async function fetchPoliceStations(districtId?: number): Promise<PoliceStation[]> {
  const { data } = await apiClient.get<Paginated<PoliceStation> | PoliceStation[]>("/police-stations/", {
    params: { page_size: 500, district: districtId },
  });
  return Array.isArray(data) ? data : data.results;
}

export interface DistrictPayload {
  name: string;
  code?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export async function createDistrict(payload: DistrictPayload): Promise<District> {
  const { data } = await apiClient.post<District>("/districts/", payload);
  return data;
}

export async function updateDistrict(id: number, payload: Partial<DistrictPayload>): Promise<District> {
  const { data } = await apiClient.patch<District>(`/districts/${id}/`, payload);
  return data;
}

export async function deleteDistrict(id: number): Promise<void> {
  await apiClient.delete(`/districts/${id}/`);
}

export interface PoliceStationPayload {
  district: number;
  name: string;
  code?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export async function createPoliceStation(payload: PoliceStationPayload): Promise<PoliceStation> {
  const { data } = await apiClient.post<PoliceStation>("/police-stations/", payload);
  return data;
}

export async function updatePoliceStation(
  id: number,
  payload: Partial<PoliceStationPayload>,
): Promise<PoliceStation> {
  const { data } = await apiClient.patch<PoliceStation>(`/police-stations/${id}/`, payload);
  return data;
}

export async function deletePoliceStation(id: number): Promise<void> {
  await apiClient.delete(`/police-stations/${id}/`);
}
