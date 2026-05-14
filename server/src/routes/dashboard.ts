import { Router } from "express";
import { pool } from "../db/pool.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      WITH aggregates AS (
        SELECT
          COUNT(*)::int AS total_projects,
          AVG(operating_cost)::float AS average_operating_cost,
          AVG(margin)::float AS average_margin,
          SUM(production_volume)::float AS total_production_volume
        FROM projects
      ),
      highest_margin AS (
        SELECT name, margin::float FROM projects ORDER BY margin DESC LIMIT 1
      ),
      highest_risk AS (
        SELECT name, risk_level, margin::float
        FROM projects
        ORDER BY
          CASE risk_level WHEN 'High' THEN 3 WHEN 'Medium' THEN 2 ELSE 1 END DESC,
          operating_cost DESC
        LIMIT 1
      )
      SELECT
        aggregates.*,
        json_build_object('name', highest_margin.name, 'margin', highest_margin.margin) AS highest_margin_project,
        json_build_object('name', highest_risk.name, 'risk_level', highest_risk.risk_level, 'margin', highest_risk.margin) AS highest_risk_project
      FROM aggregates, highest_margin, highest_risk
    `);
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});
