import type { Project, Scenario, ScenarioPayload, Summary } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  projects: () => request<Project[]>("/api/projects"),
  project: (id: string) => request<Project>(`/api/projects/${id}`),
  filteredProjects: (params: URLSearchParams) =>
    request<Project[]>(`/api/projects/filter?${params.toString()}`),
  summary: () => request<Summary>("/api/dashboard/summary"),
  scenarios: (projectId: string) =>
    request<Scenario[]>(`/api/scenarios/${projectId}`),
  createScenario: (payload: ScenarioPayload) =>
    request<Scenario>("/api/scenarios", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
