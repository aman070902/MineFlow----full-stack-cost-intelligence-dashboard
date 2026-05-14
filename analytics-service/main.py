from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(title="MineFlow Analytics Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScenarioInput(BaseModel):
    operating_cost: float = Field(gt=0)
    labor_cost: float = Field(ge=0)
    fuel_cost: float = Field(ge=0)
    equipment_cost: float = Field(ge=0)
    transport_cost: float = Field(ge=0)
    production_volume: float = Field(gt=0)
    recovery_rate: float = Field(gt=0)
    current_margin: float
    labor_change: float = 0
    fuel_change: float = 0
    equipment_change: float = 0
    transport_change: float = 0
    production_change: float = 0
    recovery_change: float = 0


class CostBreakdown(BaseModel):
    labor_cost: float
    fuel_cost: float
    equipment_cost: float
    transport_cost: float
    adjusted_production: float
    adjusted_recovery: float
    margin_delta: float


class ScenarioResult(BaseModel):
    new_operating_cost: float
    new_margin: float
    profit_change: float
    risk_impact: str
    breakdown: CostBreakdown


def apply_percent(value: float, percent: float) -> float:
    return value * (1 + percent / 100)


def risk_impact(cost_delta_percent: float, margin_delta: float) -> str:
    if cost_delta_percent > 8 and margin_delta < -2:
        return "Risk increases materially"
    if cost_delta_percent > 3 or margin_delta < -1:
        return "Risk increases slightly"
    if cost_delta_percent < -5 or margin_delta > 2:
        return "Risk decreases"
    return "Risk broadly unchanged"


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/calculate-scenario", response_model=ScenarioResult)
def calculate_scenario(payload: ScenarioInput) -> ScenarioResult:
    new_labor_cost = apply_percent(payload.labor_cost, payload.labor_change)
    new_fuel_cost = apply_percent(payload.fuel_cost, payload.fuel_change)
    new_equipment_cost = apply_percent(payload.equipment_cost, payload.equipment_change)
    new_transport_cost = apply_percent(payload.transport_cost, payload.transport_change)

    new_operating_cost = (
        new_labor_cost + new_fuel_cost + new_equipment_cost + new_transport_cost
    )
    adjusted_production = apply_percent(
        payload.production_volume, payload.production_change
    )
    adjusted_recovery = apply_percent(payload.recovery_rate, payload.recovery_change)

    cost_margin_effect = (
        (payload.operating_cost - new_operating_cost) / payload.operating_cost * 20
    )
    recovery_margin_effect = (adjusted_recovery - payload.recovery_rate) * 0.25
    production_margin_effect = payload.production_change * 0.08
    margin_delta = (
        cost_margin_effect + recovery_margin_effect + production_margin_effect
    )
    new_margin = max(-50, min(75, payload.current_margin + margin_delta))

    base_profit = payload.production_volume * payload.current_margin
    scenario_profit = adjusted_production * new_margin
    profit_change = scenario_profit - base_profit

    cost_delta_percent = (
        (new_operating_cost - payload.operating_cost) / payload.operating_cost * 100
    )

    return ScenarioResult(
        new_operating_cost=round(new_operating_cost, 2),
        new_margin=round(new_margin, 2),
        profit_change=round(profit_change, 2),
        risk_impact=risk_impact(cost_delta_percent, new_margin - payload.current_margin),
        breakdown=CostBreakdown(
            labor_cost=round(new_labor_cost, 2),
            fuel_cost=round(new_fuel_cost, 2),
            equipment_cost=round(new_equipment_cost, 2),
            transport_cost=round(new_transport_cost, 2),
            adjusted_production=round(adjusted_production, 2),
            adjusted_recovery=round(adjusted_recovery, 2),
            margin_delta=round(margin_delta, 2),
        ),
    )
