import { Router } from "express";
import { pool } from "../db/pool.js";

export const projectsRouter = Router();

const numericFields = new Set([
  "capital_cost",
  "operating_cost",
  "labor_cost",
  "equipment_cost",
  "fuel_cost",
  "transport_cost",
  "production_volume",
  "recovery_rate",
  "margin",
]);

function normalizeRows<T extends Record<string, unknown>>(rows: T[]): T[] {
  return rows.map((row) => {
    const normalized: Record<string, unknown> = { ...row };
    for (const field of numericFields) {
      if (field in normalized && normalized[field] !== null) {
        normalized[field] = Number(normalized[field]);
      }
    }
    return normalized as T;
  });
}

projectsRouter.get("/filter", async (req, res, next) => {
  try {
    const filters = [
      "industry",
      "region",
      "resource_type",
      "project_stage",
      "mine_type",
      "risk_level",
    ];
    const where: string[] = [];
    const values: unknown[] = [];

    for (const filter of filters) {
      if (req.query[filter]) {
        values.push(req.query[filter]);
        where.push(`${filter} = $${values.length}`);
      }
    }

    if (req.query.min_margin) {
      values.push(Number(req.query.min_margin));
      where.push(`margin >= $${values.length}`);
    }

    if (req.query.max_capital_cost) {
      values.push(Number(req.query.max_capital_cost));
      where.push(`capital_cost <= $${values.length}`);
    }

    if (req.query.max_operating_cost) {
      values.push(Number(req.query.max_operating_cost));
      where.push(`operating_cost <= $${values.length}`);
    }

    const query = `
      SELECT * FROM projects
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY name ASC
    `;
    const { rows } = await pool.query(query, values);
    res.json(normalizeRows(rows));
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/", async (_req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM projects ORDER BY name ASC");
    res.json(normalizeRows(rows));
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM projects WHERE id = $1", [
      req.params.id,
    ]);
    if (!rows[0]) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(normalizeRows(rows)[0]);
  } catch (error) {
    next(error);
  }
});
