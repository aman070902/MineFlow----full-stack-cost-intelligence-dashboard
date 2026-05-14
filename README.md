# MineFlow

MineFlow is a B2B cost intelligence dashboard for resource-heavy industries like mining, construction, energy, and logistics. It lets analysts compare industrial projects, filter complex cost data, and run what-if scenarios across labor, fuel, equipment, transport, production, and recovery assumptions.

## Why This Project Was Built

This project demonstrates a practical, data-heavy SaaS architecture: a React analytics dashboard, a Node.js backend-for-frontend, a PostgreSQL cost database, and a Python FastAPI analytics service. The product domain is intentionally specific so the UI, data model, and calculations feel like a real mining and industrial cost intelligence workflow.

## Tech Stack

- Frontend: React, TypeScript, React Router, Tailwind CSS, Recharts
- Backend-for-Frontend: Node.js, Express, TypeScript
- Analytics Service: Python, FastAPI, Pydantic
- Database: PostgreSQL
- Local orchestration: Docker Compose

## Architecture

```text
React + TypeScript Client (5173)
  |
  | REST API calls
  v
Node.js Express BFF (5000 internal, 5001 host)
  |                      |
  | SQL queries          | Scenario calculation request
  v                      v
PostgreSQL (5432 internal, 5433 host)     Python FastAPI Analytics Service (8000)
```

## Features

- Executive dashboard with portfolio summary cards and Recharts visualizations
- Project table with search and filters for industry, region, risk, stage, and mine type
- Project detail views with cost breakdowns and saved scenarios
- Side-by-side comparison for 2-3 projects with CAPEX/OPEX and risk/margin charts
- Scenario builder with sliders and inputs for cost, production, and recovery changes
- End-to-end scenario persistence through Express, FastAPI, and PostgreSQL
- Responsive dark SaaS UI with polished empty, loading, and error states

## Run Locally With Docker

From the project root:

```bash
cd mineflow
docker compose down
docker compose up --build
```

Then open:

- Client: http://localhost:5173
- Node API: http://localhost:5001
- Projects API: http://localhost:5001/api/projects
- FastAPI: http://localhost:8000/docs
- PostgreSQL: localhost:5433

Inside Docker, services still connect to PostgreSQL through the Compose service name on the internal container port: `postgres:5432`.

## Run Services Separately

Database:

```bash
createdb mineflow
psql mineflow -f database/01-schema.sql
psql mineflow -f database/02-seed.sql
```

Analytics service:

```bash
cd analytics-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Server:

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Client:

```bash
cd client
npm install
npm run dev
```

## API Endpoints

### Projects

- `GET /api/projects` returns all projects
- `GET /api/projects/:id` returns one project
- `GET /api/projects/filter` supports:
  - `industry`
  - `region`
  - `resource_type`
  - `project_stage`
  - `mine_type`
  - `risk_level`
  - `min_margin`
  - `max_capital_cost`
  - `max_operating_cost`

### Dashboard

- `GET /api/dashboard/summary` returns portfolio totals, averages, highest-margin project, highest-risk project, and total production volume

### Scenarios

- `POST /api/scenarios` runs and saves a scenario
- `GET /api/scenarios/:projectId` returns saved scenarios for a project

### Analytics Service

- `POST /calculate-scenario` calculates new operating cost, margin, profit change, risk impact, and cost breakdown

## Database Setup

Database files live in `database/`:

- `01-schema.sql` creates `projects` and `scenarios`
- `02-seed.sql` inserts realistic mock data for mining, construction, energy, and logistics projects

Seeded projects include:

- Silver Ridge Copper Mine
- NorthPeak Lithium Project
- RedStone Gold Operation
- IronVale Open Pit
- Aurora Construction Corridor
- Prairie Wind Energy Site
- DeepCore Nickel Mine
- Atlas Logistics Hub
- Granite Basin Quarry
- CopperTrail Expansion

## Interview Pitch

“MineFlow is a B2B cost intelligence dashboard for resource-heavy industries like mining, construction, energy, and logistics. It lets analysts compare projects, filter by cost/risk/region, and run scenario models to see how labor, fuel, equipment, transport, production, and recovery changes affect project economics. I built it with React, TypeScript, React Router, Node.js as a backend-for-frontend, PostgreSQL, and a Python FastAPI analytics service to mirror the kind of data-heavy, domain-specific product work expected in modern B2B SaaS teams.”

## Interview Talking Points

- The Node server acts as a backend-for-frontend, shaping database and analytics-service responses for the React UI.
- FastAPI is separated because scenario calculations are an analytics concern and can evolve independently.
- PostgreSQL stores project fundamentals and scenario history so analysts can revisit prior what-if runs.
- React Router separates the dashboard, portfolio table, detail pages, comparison workflow, and scenario builder.
- Recharts turns the seeded operating data into portfolio-level visuals, making the app demo-ready.
# MineFlow----full-stack-cost-intelligence-dashboard
