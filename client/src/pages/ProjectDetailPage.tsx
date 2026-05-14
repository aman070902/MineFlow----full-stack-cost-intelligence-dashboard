import { ArrowLeft, Calculator } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/Card";
import { EmptyState, ErrorState, LoadingState } from "../components/State";
import { api } from "../services/api";
import type { Project, Scenario } from "../types";
import { formatCurrency, formatPercent, riskClass } from "../utils";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([api.project(id), api.scenarios(id)])
      .then(([projectData, scenarioData]) => {
        setProject(projectData);
        setScenarios(scenarioData);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState label="Loading project economics..." />;
  if (error) return <ErrorState error={error} />;
  if (!project) return <EmptyState label="Project not found." />;

  const costBreakdown = [
    { name: "Labor", value: project.labor_cost },
    { name: "Equipment", value: project.equipment_cost },
    { name: "Fuel", value: project.fuel_cost },
    { name: "Transport", value: project.transport_cost },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/projects" className="mb-3 inline-flex items-center gap-2 text-sm text-steel hover:text-white">
            <ArrowLeft size={16} /> Back to projects
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold text-white">{project.name}</h2>
            <span className={`rounded-full border px-2.5 py-1 text-xs ${riskClass(project.risk_level)}`}>{project.risk_level}</span>
          </div>
          <p className="mt-2 text-steel">{project.industry} · {project.region} · {project.resource_type}</p>
        </div>
        <Link
          to="/scenarios"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-copper px-4 py-2 font-semibold text-ink hover:bg-orange-300"
        >
          <Calculator size={18} /> Run scenario
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Capital cost" value={formatCurrency(project.capital_cost)} />
        <Card title="Operating cost" value={formatCurrency(project.operating_cost)} />
        <Card title="Margin" value={formatPercent(project.margin)} tone="good" />
        <Card title="Recovery rate" value={formatPercent(project.recovery_rate)} />
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-lg border border-line bg-panel p-5 shadow-soft xl:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-white">Cost breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={costBreakdown}>
                <CartesianGrid stroke="#223247" strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(Number(value))} width={72} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ background: "#111b2a", border: "1px solid #223247", borderRadius: "8px" }} />
                <Bar dataKey="value" fill="#d1844b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-panel p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-white">Project metrics</h3>
          <dl className="mt-4 space-y-4 text-sm">
            {[
              ["Stage", project.project_stage],
              ["Mine type", project.mine_type],
              ["Production volume", project.production_volume.toLocaleString()],
              ["Risk level", project.risk_level],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-line pb-3">
                <dt className="text-steel">{label}</dt>
                <dd className={label === "Risk level" ? `rounded border px-2 py-1 text-xs ${riskClass(String(value))}` : "text-right text-white"}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-panel p-5 shadow-soft">
        <h3 className="mb-4 text-lg font-semibold text-white">Saved scenarios</h3>
        {scenarios.length === 0 ? (
          <EmptyState label="No saved scenarios yet. Run a what-if model to create one." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {scenarios.map((scenario) => (
              <article key={scenario.id} className="rounded-md border border-line bg-panel2 p-4">
                <h4 className="font-semibold text-white">{scenario.scenario_name}</h4>
                <p className="mt-2 text-sm text-steel">New OPEX: {formatCurrency(scenario.new_operating_cost)}</p>
                <p className="text-sm text-steel">New margin: {formatPercent(scenario.new_margin)}</p>
                <p className="mt-3 text-sm text-copper">{scenario.risk_impact}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
