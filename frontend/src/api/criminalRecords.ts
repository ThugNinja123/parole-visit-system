import { apiClient } from "@/api/client";
import type { Crime, InventoryItem, Paginated } from "@/types";

export async function fetchCrimes(offenderId: number): Promise<Crime[]> {
  const { data } = await apiClient.get<Paginated<Crime> | Crime[]>("/crimes/", {
    params: { offender: offenderId, page_size: 200 },
  });
  return Array.isArray(data) ? data : data.results;
}

export type CrimePayload = Omit<Crime, "id" | "added_by" | "added_by_name" | "created_at">;

export async function createCrime(payload: CrimePayload): Promise<Crime> {
  const { data } = await apiClient.post<Crime>("/crimes/", payload);
  return data;
}

export async function updateCrime(id: number, payload: Partial<CrimePayload>): Promise<Crime> {
  const { data } = await apiClient.patch<Crime>(`/crimes/${id}/`, payload);
  return data;
}

export async function deleteCrime(id: number): Promise<void> {
  await apiClient.delete(`/crimes/${id}/`);
}

export async function fetchInventoryItems(offenderId: number): Promise<InventoryItem[]> {
  const { data } = await apiClient.get<Paginated<InventoryItem> | InventoryItem[]>("/inventory-items/", {
    params: { offender: offenderId, page_size: 200 },
  });
  return Array.isArray(data) ? data : data.results;
}

export type InventoryItemPayload = Omit<InventoryItem, "id" | "added_by" | "added_by_name" | "created_at">;

export async function createInventoryItem(payload: InventoryItemPayload): Promise<InventoryItem> {
  const { data } = await apiClient.post<InventoryItem>("/inventory-items/", payload);
  return data;
}

export async function updateInventoryItem(
  id: number,
  payload: Partial<InventoryItemPayload>,
): Promise<InventoryItem> {
  const { data } = await apiClient.patch<InventoryItem>(`/inventory-items/${id}/`, payload);
  return data;
}

export async function deleteInventoryItem(id: number): Promise<void> {
  await apiClient.delete(`/inventory-items/${id}/`);
}
