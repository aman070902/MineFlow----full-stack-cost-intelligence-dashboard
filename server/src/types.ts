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
  risk_level: "Low" | "Medium" | "High";
  created_at: string;
};

export type ScenarioCalculation = {
  new_operating_cost: number;
  new_margin: number;
  profit_change: number;
  risk_impact: string;
  breakdown: Record<string, number>;
};
