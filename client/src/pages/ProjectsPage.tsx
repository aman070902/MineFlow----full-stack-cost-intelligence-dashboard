import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "../components/State";
import { api } from "../services/api";
import type { Project } from "../types";
import { formatCurrency, formatPercent, riskClass } from "../utils";

const filterFields = [
  ["industry", "Industry"],
  ["region", "Region"],
  ["risk_level", "Risk"],
  ["project_stage", "Stage"],
  ["mine_type", "Mine type"],
] as const;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.projects()
      .then(setProjects)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const options = useMemo(() => {
    const result: Record<string, string[]> = {};
    filterFields.forEach(([key]) => {
      result[key] = Array.from(new Set(projects.map((project) => String(project[key])))).sort();
    });
    return result;
  }, [projects]);

  const filtered = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilters = Object.entries(filters).every(
      ([key, value]) => !value || String(project[key as keyof Project]) === value,
    );
    return matchesSearch && matchesFilters;
  });

  if (loading) return <LoadingState label="Loading project portfolio..." />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-panel p-5 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">Portfolio Explorer</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Project portfolio</h2>
            <p className="mt-2 text-sm text-steel">Search and filter industrial assets by region, risk, stage, and operating profile.</p>
          </div>
          <div className="relative w-full xl:w-80">
            <Search className="absolute left-3 top-2.5 text-steel" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects"
              className="w-full rounded-md border border-line bg-ink py-2 pl-10 pr-3 text-sm text-white outline-none focus:border-copper"
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {filterFields.map(([key, label]) => (
            <label key={key} className="text-sm text-steel">
              {label}
              <select
                value={filters[key] ?? ""}
                onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}
                className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 text-white outline-none focus:border-copper"
              >
                <option value="">All</option>
                {options[key]?.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-line bg-panel shadow-soft">
        {filtered.length === 0 ? (
          <EmptyState label="No projects match the current filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line text-left text-sm">
              <thead className="sticky top-16 z-[1] bg-panel2 text-xs uppercase text-steel">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">CAPEX</th>
                  <th className="px-4 py-3">OPEX</th>
                  <th className="px-4 py-3">Margin</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="cursor-pointer transition hover:bg-panel2"
                  >
                    <td className="px-4 py-4 font-medium text-white">{project.name}</td>
                    <td className="px-4 py-4 text-steel">{project.industry}</td>
                    <td className="px-4 py-4 text-steel">{project.region}</td>
                    <td className="px-4 py-4 text-steel">{project.resource_type}</td>
                    <td className="px-4 py-4 text-white">{formatCurrency(project.capital_cost)}</td>
                    <td className="px-4 py-4 text-white">{formatCurrency(project.operating_cost)}</td>
                    <td className="px-4 py-4 text-mint">{formatPercent(project.margin)}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${riskClass(project.risk_level)}`}>{project.risk_level}</span>
                    </td>
                    <td className="px-4 py-4 text-copper">View Details</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
