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
