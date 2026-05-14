import { RotateCcw, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../components/Card";
import { EmptyState, ErrorState, LoadingState } from "../components/State";
import { api } from "../services/api";
import type { Project } from "../types";
import {
  chartColors,
  formatCompactNumber,
  formatCurrency,
  formatPercent,
  riskClass,
} from "../utils";

type Option = "All" | string;

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [industry, setIndustry] = useState<Option>("All");
  const [risk, setRisk] = useState<Option>("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.projects()
      .then(setProjects)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const industries = useMemo(
    () => Array.from(new Set(projects.map((project) => project.industry))).sort(),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesIndustry = industry === "All" || project.industry === industry;
      const matchesRisk = risk === "All" || project.risk_level === risk;
      const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
      return matchesIndustry && matchesRisk && matchesSearch;
    });
  }, [industry, projects, risk, search]);

  const summary = useMemo(() => {
    const count = filteredProjects.length;
    const operatingTotal = filteredProjects.reduce((sum, project) => sum + project.operating_cost, 0);
    const marginTotal = filteredProjects.reduce((sum, project) => sum + project.margin, 0);
    const productionTotal = filteredProjects.reduce((sum, project) => sum + project.production_volume, 0);
    const highestMargin = [...filteredProjects].sort((a, b) => b.margin - a.margin)[0];
    const highestRisk = [...filteredProjects].sort((a, b) => {
      const score = { Low: 1, Medium: 2, High: 3 };
      return score[b.risk_level] - score[a.risk_level] || b.operating_cost - a.operating_cost;
    })[0];

    return {
      count,
      averageOperatingCost: count ? operatingTotal / count : 0,
      averageMargin: count ? marginTotal / count : 0,
      productionTotal,
      highestMargin,
      highestRisk,
    };
  }, [filteredProjects]);

  const industryDistribution = useMemo(() => {
    const grouped = new Map<string, number>();
    filteredProjects.forEach((project) =>
      grouped.set(project.industry, (grouped.get(project.industry) ?? 0) + 1),
    );
    return Array.from(grouped, ([name, value]) => ({ name, value }));
  }, [filteredProjects]);

  const averageCostByIndustry = useMemo(() => {
    const grouped = new Map<string, { cost: number; count: number }>();
    filteredProjects.forEach((project) => {
      const current = grouped.get(project.industry) ?? { cost: 0, count: 0 };
      grouped.set(project.industry, {
        cost: current.cost + project.operating_cost,
        count: current.count + 1,
      });
    });
    return Array.from(grouped, ([name, value]) => ({
      name,
      avgOpex: Math.round(value.cost / value.count),
    }));
  }, [filteredProjects]);

  const marginByProject = [...filteredProjects]
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 10)
    .map((project) => ({
      name: project.name,
      margin: project.margin,
    }));

  const topProjects = [...filteredProjects]
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 5);

  function resetFilters() {
    setIndustry("All");
    setRisk("All");
    setSearch("");
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-lg border border-line bg-panel p-5 shadow-soft xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">MineFlow dashboard</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Operations Cost Intelligence</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">
            Compare projects, monitor cost drivers, and model profitability scenarios.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/scenarios"
              className="inline-flex h-10 items-center justify-center rounded-md bg-copper px-4 text-sm font-semibold text-ink transition hover:bg-orange-300"
            >
              Run Scenario
            </Link>
            <Link
              to="/projects"
              className="inline-flex h-10 items-center justify-center rounded-md border border-line px-4 text-sm font-semibold text-white transition hover:border-copper hover:bg-panel2"
            >
              View Projects
            </Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:w-[680px] xl:grid-cols-[1fr_1fr_1.2fr_auto]">
          <SelectFilter label="Industry" value={industry} options={industries} onChange={setIndustry} />
          <SelectFilter label="Risk" value={risk} options={["Low", "Medium", "High"]} onChange={setRisk} />
          <label className="text-sm text-steel">
            Search
            <div className="relative mt-1">
              <Search className="absolute left-3 top-2.5 text-steel" size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Project name"
                className="w-full rounded-md border border-line bg-ink py-2 pl-9 pr-3 text-sm text-white outline-none transition focus:border-copper"
              />
            </div>
          </label>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line px-3 text-sm text-steel transition hover:border-copper hover:text-white"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Total Projects" value={String(summary.count)} subtitle="Filtered project count" />
        <Card title="Average Operating Cost" value={formatCurrency(summary.averageOperatingCost)} subtitle="Annualized operating baseline" />
        <Card title="Average Margin" value={formatPercent(summary.averageMargin)} subtitle="Mean portfolio margin" tone="good" />
        <Card title="Highest Margin Project" value={summary.highestMargin?.name ?? "No matches"} subtitle={summary.highestMargin ? formatPercent(summary.highestMargin.margin) : "Adjust filters"} />
        <Card title="Highest Risk Project" value={summary.highestRisk?.name ?? "No matches"} subtitle={summary.highestRisk ? `${summary.highestRisk.risk_level} risk` : "Adjust filters"} tone="warn" />
        <Card title="Total Production" value={formatCompactNumber(summary.productionTotal)} subtitle="Combined filtered output" />
      </section>

      {filteredProjects.length === 0 ? (
        <EmptyState label="No projects match the current dashboard filters." />
      ) : (
        <>
          <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <ChartCard title="Industry Distribution">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                  <Pie data={industryDistribution} dataKey="value" nameKey="name" innerRadius={72} outerRadius={104} paddingAngle={3}>
                    {industryDistribution.map((_, index) => (
                      <Cell key={index} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Average Cost by Industry">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={averageCostByIndustry} margin={{ top: 12, right: 18, bottom: 18, left: 22 }}>
                  <CartesianGrid stroke="#223247" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(value) => formatCurrency(Number(value))} tickLine={false} axisLine={false} width={72} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
                  <Bar dataKey="avgOpex" fill="#d1844b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>

          <ChartCard title="Margin by Project">
            <ResponsiveContainer width="100%" height={Math.max(420, marginByProject.length * 42)}>
              <BarChart
                data={marginByProject}
                layout="vertical"
                margin={{ top: 12, right: 36, bottom: 12, left: 150 }}
              >
                <CartesianGrid stroke="#223247" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={145} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatPercent(Number(value))} contentStyle={tooltipStyle} />
                <Bar dataKey="margin" fill="#4ade80" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <section className="overflow-hidden rounded-lg border border-line bg-panel shadow-soft">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Top Projects</h3>
                <p className="text-sm text-steel">Highest margin assets in the current filter set.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left text-sm">
                <thead className="bg-panel2 text-xs uppercase text-steel">
                  <tr>
                    <th className="px-5 py-3">Project</th>
                    <th className="px-5 py-3">Industry</th>
                    <th className="px-5 py-3">Operating Cost</th>
                    <th className="px-5 py-3">Margin</th>
                    <th className="px-5 py-3">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {topProjects.map((project) => (
                    <tr
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="cursor-pointer transition hover:bg-panel2"
                    >
                      <td className="px-5 py-4 font-medium text-white">{project.name}</td>
                      <td className="px-5 py-4 text-steel">{project.industry}</td>
                      <td className="px-5 py-4 text-white">{formatCurrency(project.operating_cost)}</td>
                      <td className="px-5 py-4 text-mint">{formatPercent(project.margin)}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full border px-2.5 py-1 text-xs ${riskClass(project.risk_level)}`}>{project.risk_level}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm text-steel">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-white outline-none transition focus:border-copper"
      >
        <option value="All">All</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-panel p-5 shadow-soft">
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

const tooltipStyle = {
  background: "#111b2a",
  border: "1px solid #223247",
  borderRadius: "8px",
  color: "#cbd5e1",
};
