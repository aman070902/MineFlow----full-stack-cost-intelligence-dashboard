import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { EmptyState, ErrorState, LoadingState } from "../components/State";
import { api } from "../services/api";
import type { Project } from "../types";
import { chartColors, formatCurrency, formatPercent, riskClass } from "../utils";

export default function ComparePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.projects()
      .then((data) => {
        setProjects(data);
        setSelected(data.slice(0, 3).map((project) => project.id));
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const compared = projects.filter((project) => selected.includes(project.id));
  const costData = compared.map((project) => ({
    name: project.name.split(" ").slice(0, 2).join(" "),
    CAPEX: project.capital_cost,
    OPEX: project.operating_cost,
  }));
  const scatterData = compared.map((project) => ({
    name: project.name,
    margin: project.margin,
    risk: project.risk_level === "High" ? 3 : project.risk_level === "Medium" ? 2 : 1,
    production: project.production_volume,
  }));

  const slots = useMemo(() => [0, 1, 2], []);

  if (loading) return <LoadingState label="Loading comparison set..." />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-panel p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">Comparison Workspace</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Compare projects</h2>
        <p className="mt-2 text-sm text-steel">Select two or three assets to compare cost structure, scale, risk, and margin.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {slots.map((slot) => (
            <select
              key={slot}
              value={selected[slot] ?? ""}
              onChange={(event) =>
                setSelected((current) => {
                  const next = [...current];
                  next[slot] = event.target.value;
                  return Array.from(new Set(next.filter(Boolean))).slice(0, 3);
                })
              }
              className="rounded-md border border-line bg-ink px-3 py-2 text-white outline-none focus:border-copper"
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          ))}
        </div>
      </section>

      {compared.length < 2 ? (
        <EmptyState label="Select at least two projects to build a comparison." />
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-3">
            {compared.map((project, index) => (
              <article key={project.id} className="rounded-lg border border-line bg-panel p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-copper/45">
                <div className="mb-4 h-1 rounded" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                <p className="mt-1 text-sm text-steel">{project.region} · {project.resource_type}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-steel">CAPEX</p><p className="text-white">{formatCurrency(project.capital_cost)}</p></div>
                  <div><p className="text-steel">OPEX</p><p className="text-white">{formatCurrency(project.operating_cost)}</p></div>
                  <div><p className="text-steel">Margin</p><p className="text-mint">{formatPercent(project.margin)}</p></div>
                  <div><span className={`rounded-full border px-2.5 py-1 text-xs ${riskClass(project.risk_level)}`}>{project.risk_level}</span></div>
                </div>
              </article>
            ))}
          </section>

          <section className="overflow-hidden rounded-lg border border-line bg-panel shadow-soft">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-panel2 text-left text-xs uppercase text-steel">
                <tr><th className="px-4 py-3">Project</th><th className="px-4 py-3">Labor</th><th className="px-4 py-3">Equipment</th><th className="px-4 py-3">Fuel</th><th className="px-4 py-3">Transport</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {compared.map((project) => (
                  <tr key={project.id}>
                    <td className="px-4 py-4 font-medium text-white">{project.name}</td>
                    <td className="px-4 py-4 text-steel">{formatCurrency(project.labor_cost)}</td>
                    <td className="px-4 py-4 text-steel">{formatCurrency(project.equipment_cost)}</td>
                    <td className="px-4 py-4 text-steel">{formatCurrency(project.fuel_cost)}</td>
                    <td className="px-4 py-4 text-steel">{formatCurrency(project.transport_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-lg border border-line bg-panel p-5 shadow-soft">
              <h3 className="mb-4 text-lg font-semibold text-white">CAPEX vs OPEX</h3>
              <div className="h-80">
                <ResponsiveContainer>
                  <BarChart data={costData}>
                    <CartesianGrid stroke="#223247" strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(Number(value))} width={72} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ background: "#111b2a", border: "1px solid #223247", borderRadius: "8px" }} />
                    <Bar dataKey="CAPEX" fill="#d1844b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="OPEX" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-lg border border-line bg-panel p-5 shadow-soft">
              <h3 className="mb-4 text-lg font-semibold text-white">Risk vs margin</h3>
              <div className="h-80">
                <ResponsiveContainer>
                  <ScatterChart>
                    <CartesianGrid stroke="#223247" strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="margin" name="Margin" unit="%" />
                    <YAxis type="number" dataKey="risk" name="Risk" ticks={[1, 2, 3]} tickFormatter={(value) => ["", "Low", "Med", "High"][Number(value)]} />
                    <ZAxis type="number" dataKey="production" range={[120, 360]} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#111b2a", border: "1px solid #223247" }} />
                    <Scatter data={scatterData} fill="#4ade80" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
