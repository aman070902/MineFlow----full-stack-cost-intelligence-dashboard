import { Play } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ErrorState, LoadingState } from "../components/State";
import { api } from "../services/api";
import type { Project, Scenario, ScenarioPayload } from "../types";
import { formatCurrency, formatPercent } from "../utils";

const controls: Array<[keyof Omit<ScenarioPayload, "project_id" | "scenario_name">, string]> = [
  ["labor_change", "Labor cost %"],
  ["fuel_change", "Fuel cost %"],
  ["equipment_change", "Equipment cost %"],
  ["transport_change", "Transport cost %"],
  ["production_change", "Production volume %"],
  ["recovery_change", "Recovery / efficiency %"],
];

const initialInputs = {
  labor_change: 0,
  fuel_change: 0,
  equipment_change: 0,
  transport_change: 0,
  production_change: 0,
  recovery_change: 0,
};

export default function ScenarioBuilderPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [scenarioName, setScenarioName] = useState("Fuel sensitivity case");
  const [inputs, setInputs] = useState(initialInputs);
  const [result, setResult] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.projects()
      .then((data) => {
        setProjects(data);
        setSelectedProjectId(data[0]?.id ?? "");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId),
    [projects, selectedProjectId],
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selectedProjectId) return;
    setSubmitting(true);
    setError("");
    try {
      const scenario = await api.createScenario({
        project_id: selectedProjectId,
        scenario_name: scenarioName,
        ...inputs,
      });
      setResult(scenario);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scenario failed");
    } finally {
      setSubmitting(false);
    }
  }

  const beforeAfter = selectedProject && result
    ? [
        { name: "Operating cost", Before: selectedProject.operating_cost, After: result.new_operating_cost },
        { name: "Margin score", Before: selectedProject.margin * 10_000_000, After: result.new_margin * 10_000_000 },
      ]
    : [];

  if (loading) return <LoadingState label="Loading scenario model..." />;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <form onSubmit={submit} className="space-y-5 rounded-lg border border-line bg-panel p-5 shadow-soft">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">What-if Modeling</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Scenario builder</h2>
          <p className="mt-2 text-sm text-steel">Model cost, production, and recovery changes against a selected project.</p>
        </div>
        {error ? <ErrorState error={error} /> : null}
        <label className="block text-sm text-steel">
          Project
          <select
            value={selectedProjectId}
            onChange={(event) => {
              setSelectedProjectId(event.target.value);
              setResult(null);
            }}
            className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 text-white outline-none focus:border-copper"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-steel">
          Scenario name
          <input
            value={scenarioName}
            onChange={(event) => setScenarioName(event.target.value)}
            required
            className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 text-white outline-none focus:border-copper"
          />
        </label>
        <div className="space-y-4">
          {controls.map(([key, label]) => (
            <label key={key} className="block text-sm text-steel">
              <div className="mb-2 flex items-center justify-between">
                <span>{label}</span>
                <input
                  type="number"
                  value={inputs[key]}
                  onChange={(event) => setInputs((current) => ({ ...current, [key]: Number(event.target.value) }))}
                  className="w-20 rounded-md border border-line bg-ink px-2 py-1 text-right text-white outline-none focus:border-copper"
                />
              </div>
              <input
                type="range"
                min="-35"
                max="35"
                value={inputs[key]}
                onChange={(event) => setInputs((current) => ({ ...current, [key]: Number(event.target.value) }))}
                className="w-full accent-copper"
              />
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-copper px-4 py-3 font-semibold text-ink hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Play size={18} /> {submitting ? "Running scenario..." : "Run Scenario"}
        </button>
      </form>

      <section className="space-y-5">
        <div className="rounded-lg border border-line bg-panel p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-white">Baseline</h3>
          {selectedProject ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric label="Operating cost" value={formatCurrency(selectedProject.operating_cost)} />
              <Metric label="Current margin" value={formatPercent(selectedProject.margin)} />
              <Metric label="Production" value={selectedProject.production_volume.toLocaleString()} />
              <Metric label="Recovery" value={formatPercent(selectedProject.recovery_rate)} />
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-line bg-panel p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-white">Scenario result</h3>
          {result ? (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Metric label="New operating cost" value={formatCurrency(result.new_operating_cost)} />
                <Metric label="New margin" value={formatPercent(result.new_margin)} />
                <Metric label="Profit change" value={formatCurrency(result.profit_change)} />
                <Metric label="Risk impact" value={result.risk_impact} />
              </div>
              <div className="mt-6 h-80">
                <ResponsiveContainer>
                  <BarChart data={beforeAfter}>
                    <CartesianGrid stroke="#223247" strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(Number(value))} width={72} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ background: "#111b2a", border: "1px solid #223247", borderRadius: "8px" }} />
                    <Bar dataKey="Before" fill="#8fa3bb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="After" fill="#d1844b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-line p-6 text-center text-steel">
              Run a scenario to see modeled economics and risk impact.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel2 p-4">
      <p className="text-sm text-steel">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
