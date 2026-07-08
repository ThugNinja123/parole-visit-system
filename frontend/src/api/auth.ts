import { apiClient } from "@/api/client";
import type { CurrentUser } from "@/types";

export interface LoginResponse {
  access: string;
  refresh: string;
  user: CurrentUser;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login/", { username, password });
  return data;
}

export async function fetchMe(): Promise<CurrentUser> {
  const { data } = await apiClient.get<CurrentUser>("/auth/me/");
  return data;
}
