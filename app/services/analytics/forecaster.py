import numpy as np
from typing import List, Dict, Any, Optional, Union
from datetime import date, datetime, timedelta
from sklearn.linear_model import BayesianRidge


def forecast_biomarker_trajectory(
    dates: List[Union[date, str]],
    values: List[float],
    target_cutoff: Optional[float] = None,
    cutoff_direction: str = "BELOW"
) -> Dict[str, Any]:
    """
    Fits a Bayesian Ridge Regression model against elapsed days from baseline date to forecast
    future biomarker trajectories over 3 to 6 months with 95% confidence intervals.
    
    Calculates projected cutoff crossing dates (e.g., when eGFR will cross below 60 mL/min).
    """
    if len(dates) != len(values):
        raise ValueError("Dates and values arrays must have equal length.")

    if not dates or len(values) < 2:
        return {
            "sample_size": len(values),
            "forecast_available": False,
            "message": "Insufficient data points (minimum N >= 2 required for trajectory forecasting)."
        }

    # Parse dates
    parsed_dates: List[date] = []
    for d in dates:
        if isinstance(d, str):
            parsed_dates.append(date.fromisoformat(d))
        elif isinstance(d, datetime):
            parsed_dates.append(d.date())
        else:
            parsed_dates.append(d)

    # Sort chronologically
    pairs = sorted(zip(parsed_dates, values), key=lambda x: x[0])
    sorted_dates, sorted_values = zip(*pairs)

    baseline_date = sorted_dates[0]
    latest_date = sorted_dates[-1]

    # Convert dates to elapsed days from baseline
    elapsed_days = np.array([(d - baseline_date).days for d in sorted_dates], dtype=float)
    X = elapsed_days.reshape(-1, 1)
    y = np.array(sorted_values, dtype=float)

    # Fit Bayesian Ridge Regression
    model = BayesianRidge()
    model.fit(X, y)

    slope_per_day = float(model.coef_[0])
    intercept = float(model.intercept_)
    annual_slope = round(slope_per_day * 365.25, 4)

    # Generate 3-month and 6-month forecast intervals (30, 60, 90, 180 days past latest date)
    latest_elapsed = elapsed_days[-1]
    future_offsets = [30, 60, 90, 180]
    future_elapsed = np.array([latest_elapsed + days for days in future_offsets]).reshape(-1, 1)

    # Predict mean and standard error for 95% confidence intervals
    preds, stds = model.predict(future_elapsed, return_std=True)

    forecast_points: List[Dict[str, Any]] = []
    for offset, pred_val, std_val in zip(future_offsets, preds, stds):
        proj_date = latest_date + timedelta(days=offset)
        ci_lower = round(float(pred_val - 1.96 * std_val), 4)
        ci_upper = round(float(pred_val + 1.96 * std_val), 4)
        mean_val = round(float(pred_val), 4)

        forecast_points.append({
            "days_ahead": offset,
            "projected_date": str(proj_date),
            "projected_value": mean_val,
            "confidence_interval_95": {
                "lower_bound": ci_lower,
                "upper_bound": ci_upper
            }
        })

    # Cutoff Crossing Projection Analysis
    cutoff_projection: Optional[Dict[str, Any]] = None

    if target_cutoff is not None and abs(slope_per_day) > 1e-6:
        current_val = sorted_values[-1]
        
        # Check if trend is moving towards target cutoff
        is_moving_towards = False
        if cutoff_direction == "BELOW" and slope_per_day < 0 and current_val > target_cutoff:
            is_moving_towards = True
        elif cutoff_direction == "ABOVE" and slope_per_day > 0 and current_val < target_cutoff:
            is_moving_towards = True

        if is_moving_towards:
            # Days from baseline when y = target_cutoff
            days_from_baseline = (target_cutoff - intercept) / slope_per_day
            days_from_latest = days_from_baseline - latest_elapsed

            if days_from_latest > 0:
                crossing_date = latest_date + timedelta(days=int(days_from_latest))
                months_remaining = round(days_from_latest / 30.4375, 1)

                cutoff_projection = {
                    "target_cutoff": target_cutoff,
                    "cutoff_direction": cutoff_direction,
                    "is_moving_towards_cutoff": True,
                    "projected_crossing_date": str(crossing_date),
                    "days_remaining": int(days_from_latest),
                    "months_remaining": months_remaining,
                    "clinical_warning": f"Projected to cross {cutoff_direction.lower()} cutoff ({target_cutoff}) on {crossing_date} (~{months_remaining} months)."
                }
            else:
                cutoff_projection = {
                    "target_cutoff": target_cutoff,
                    "cutoff_direction": cutoff_direction,
                    "is_moving_towards_cutoff": False,
                    "already_breached": True,
                    "clinical_warning": f"Biomarker has already breached cutoff ({target_cutoff})."
                }
        else:
            cutoff_projection = {
                "target_cutoff": target_cutoff,
                "cutoff_direction": cutoff_direction,
                "is_moving_towards_cutoff": False,
                "clinical_warning": f"Trajectory is stable or moving away from cutoff ({target_cutoff})."
            }

    return {
        "sample_size": len(sorted_values),
        "forecast_available": True,
        "baseline_date": str(baseline_date),
        "latest_date": str(latest_date),
        "bayesian_annual_slope": annual_slope,
        "model_alpha_precision": float(model.alpha_),
        "forecast_points": forecast_points,
        "cutoff_projection": cutoff_projection
    }
