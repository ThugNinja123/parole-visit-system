import { apiClient } from "@/api/client";
import type { AppUser, Paginated, PermissionGroup, Role } from "@/types";

export async function fetchPermissionCatalog(): Promise<PermissionGroup[]> {
  const { data } = await apiClient.get<PermissionGroup[]>("/permissions/");
  return data;
}

export async function fetchRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<Paginated<Role> | Role[]>("/roles/", {
    params: { page_size: 100 },
  });
  return Array.isArray(data) ? data : data.results;
}

export interface RolePayload {
  name: string;
  description: string;
  permission_ids: number[];
}

export async function createRole(payload: RolePayload): Promise<Role> {
  const { data } = await apiClient.post<Role>("/roles/", payload);
  return data;
}

export async function updateRole(id: number, payload: Partial<RolePayload>): Promise<Role> {
  const { data } = await apiClient.patch<Role>(`/roles/${id}/`, payload);
  return data;
}

export async function deleteRole(id: number): Promise<void> {
  await apiClient.delete(`/roles/${id}/`);
}

export async function fetchUsers(): Promise<AppUser[]> {
  const { data } = await apiClient.get<Paginated<AppUser> | AppUser[]>("/users/", {
    params: { page_size: 200 },
  });
  return Array.isArray(data) ? data : data.results;
}

export interface UserPayload {
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  is_active?: boolean;
  police_station?: number | null;
  password?: string;
  role_ids?: number[];
}

export async function createUser(payload: UserPayload): Promise<AppUser> {
  const { data } = await apiClient.post<AppUser>("/users/", payload);
  return data;
}

export async function updateUser(id: number, payload: Partial<UserPayload>): Promise<AppUser> {
  const { data } = await apiClient.patch<AppUser>(`/users/${id}/`, payload);
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/users/${id}/`);
}
