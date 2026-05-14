import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import type { Project, ScenarioCalculation } from "../types.js";

export const scenariosRouter = Router();

const scenarioSchema = z.object({
  project_id: z.string().uuid(),
  scenario_name: z.string().min(1),
  labor_change: z.coerce.number(),
  fuel_change: z.coerce.number(),
  equipment_change: z.coerce.number(),
  transport_change: z.coerce.number(),
  production_change: z.coerce.number(),
  recovery_change: z.coerce.number(),
});

const analyticsUrl =
  process.env.ANALYTICS_SERVICE_URL ?? "http://localhost:8000";

function numberProject(row: Record<string, unknown>): Project {
  return {
    ...(row as Project),
    capital_cost: Number(row.capital_cost),
    operating_cost: Number(row.operating_cost),
    labor_cost: Number(row.labor_cost),
    equipment_cost: Number(row.equipment_cost),
    fuel_cost: Number(row.fuel_cost),
    transport_cost: Number(row.transport_cost),
    production_volume: Number(row.production_volume),
    recovery_rate: Number(row.recovery_rate),
    margin: Number(row.margin),
  };
}

scenariosRouter.post("/", async (req, res, next) => {
  try {
    const input = scenarioSchema.parse(req.body);
    const projectResult = await pool.query("SELECT * FROM projects WHERE id = $1", [
      input.project_id,
    ]);

    if (!projectResult.rows[0]) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const project = numberProject(projectResult.rows[0]);
    const analyticsResponse = await fetch(`${analyticsUrl}/calculate-scenario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operating_cost: project.operating_cost,
        labor_cost: project.labor_cost,
        fuel_cost: project.fuel_cost,
        equipment_cost: project.equipment_cost,
        transport_cost: project.transport_cost,
        production_volume: project.production_volume,
        recovery_rate: project.recovery_rate,
        current_margin: project.margin,
        labor_change: input.labor_change,
        fuel_change: input.fuel_change,
        equipment_change: input.equipment_change,
        transport_change: input.transport_change,
        production_change: input.production_change,
        recovery_change: input.recovery_change,
      }),
    });

    if (!analyticsResponse.ok) {
      throw new Error(`Analytics service error: ${analyticsResponse.status}`);
    }

    const calculation = (await analyticsResponse.json()) as ScenarioCalculation;
    const insertResult = await pool.query(
      `
      INSERT INTO scenarios (
        project_id, scenario_name, labor_change, fuel_change, equipment_change,
        transport_change, production_change, recovery_change, new_operating_cost,
        new_margin, profit_change, risk_impact
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
      `,
      [
        input.project_id,
        input.scenario_name,
        input.labor_change,
        input.fuel_change,
        input.equipment_change,
        input.transport_change,
        input.production_change,
        input.recovery_change,
        calculation.new_operating_cost,
        calculation.new_margin,
        calculation.profit_change,
        calculation.risk_impact,
      ],
    );

    res.status(201).json({
      ...insertResult.rows[0],
      new_operating_cost: Number(insertResult.rows[0].new_operating_cost),
      new_margin: Number(insertResult.rows[0].new_margin),
      profit_change: Number(insertResult.rows[0].profit_change),
      breakdown: calculation.breakdown,
    });
  } catch (error) {
    next(error);
  }
});

scenariosRouter.get("/:projectId", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM scenarios WHERE project_id = $1 ORDER BY created_at DESC",
      [req.params.projectId],
    );
    res.json(
      rows.map((row) => ({
        ...row,
        labor_change: Number(row.labor_change),
        fuel_change: Number(row.fuel_change),
        equipment_change: Number(row.equipment_change),
        transport_change: Number(row.transport_change),
        production_change: Number(row.production_change),
        recovery_change: Number(row.recovery_change),
        new_operating_cost: Number(row.new_operating_cost),
        new_margin: Number(row.new_margin),
        profit_change: Number(row.profit_change),
      })),
    );
  } catch (error) {
    next(error);
  }
});
