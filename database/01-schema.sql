CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS scenarios;
DROP TABLE IF EXISTS projects;

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  region TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  project_stage TEXT NOT NULL,
  mine_type TEXT NOT NULL,
  capital_cost NUMERIC(14, 2) NOT NULL,
  operating_cost NUMERIC(14, 2) NOT NULL,
  labor_cost NUMERIC(14, 2) NOT NULL,
  equipment_cost NUMERIC(14, 2) NOT NULL,
  fuel_cost NUMERIC(14, 2) NOT NULL,
  transport_cost NUMERIC(14, 2) NOT NULL,
  production_volume NUMERIC(14, 2) NOT NULL,
  recovery_rate NUMERIC(6, 2) NOT NULL,
  margin NUMERIC(6, 2) NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scenario_name TEXT NOT NULL,
  labor_change NUMERIC(7, 2) NOT NULL,
  fuel_change NUMERIC(7, 2) NOT NULL,
  equipment_change NUMERIC(7, 2) NOT NULL,
  transport_change NUMERIC(7, 2) NOT NULL,
  production_change NUMERIC(7, 2) NOT NULL,
  recovery_change NUMERIC(7, 2) NOT NULL,
  new_operating_cost NUMERIC(14, 2) NOT NULL,
  new_margin NUMERIC(7, 2) NOT NULL,
  profit_change NUMERIC(14, 2) NOT NULL,
  risk_impact TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_industry ON projects(industry);
CREATE INDEX idx_projects_region ON projects(region);
CREATE INDEX idx_projects_risk_level ON projects(risk_level);
CREATE INDEX idx_scenarios_project_id ON scenarios(project_id);
