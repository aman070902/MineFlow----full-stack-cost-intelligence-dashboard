export type RiskLevel = "Low" | "Medium" | "High";

export type Project = {
  id: string;
  name: string;
  industry: string;
  region: string;
  resource_type: string;
  project_stage: string;
  mine_type: string;
  capital_cost: number;
  operating_cost: number;
  labor_cost: number;
  equipment_cost: number;
  fuel_cost: number;
  transport_cost: number;
  production_volume: number;
  recovery_rate: number;
  margin: number;
  risk_level: RiskLevel;
  created_at: string;
};

export type Scenario = {
  id: string;
  project_id: string;
  scenario_name: string;
  labor_change: number;
  fuel_change: number;
  equipment_change: number;
  transport_change: number;
  production_change: number;
  recovery_change: number;
  new_operating_cost: number;
  new_margin: number;
  profit_change: number;
  risk_impact: string;
  created_at: string;
  breakdown?: Record<string, number>;
};

export type Summary = {
  total_projects: number;
  average_operating_cost: number;
  average_margin: number;
  highest_margin_project: { name: string; margin: number };
  highest_risk_project: { name: string; risk_level: RiskLevel; margin: number };
  total_production_volume: number;
};

export type ScenarioPayload = {
  project_id: string;
  scenario_name: string;
  labor_change: number;
  fuel_change: number;
  equipment_change: number;
  transport_change: number;
  production_change: number;
  recovery_change: number;
};
