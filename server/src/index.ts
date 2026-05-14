import "dotenv/config";
import cors from "cors";
import express from "express";
import { dashboardRouter } from "./routes/dashboard.js";
import { projectsRouter } from "./routes/projects.js";
import { scenariosRouter } from "./routes/scenarios.js";

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/projects", projectsRouter);
app.use("/api/scenarios", scenariosRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  },
);

app.listen(port, () => {
  console.log(`MineFlow server listening on port ${port}`);
});
