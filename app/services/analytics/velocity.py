from typing import List, Dict, Any, Union
from datetime import date, datetime


def calculate_annualized_velocity(
    dates: List[Union[date, str]],
    values: List[float]
) -> Dict[str, Any]:
    """
    Computes time-normalized annualized rate of change (velocity) between non-equidistant clinical encounters.
    
    Formula:
        Velocity = (V_new - V_prev) / ((t_new - t_prev) / 365.25)   [units / year]
    """
    if len(dates) != len(values):
        raise ValueError("Dates and values arrays must have equal length.")

    if not dates or len(dates) < 2:
        return {
            "sample_size": len(values),
            "latest_velocity_per_year": 0.0,
            "overall_velocity_per_year": 0.0,
            "average_velocity_per_year": 0.0,
            "step_velocities": []
        }

    # Convert string dates to date objects if needed
    parsed_dates: List[date] = []
    for d in dates:
        if isinstance(d, str):
            parsed_dates.append(date.fromisoformat(d))
        elif isinstance(d, datetime):
            parsed_dates.append(d.date())
        else:
            parsed_dates.append(d)

    # Sort pairs chronologically
    pairs = sorted(zip(parsed_dates, values), key=lambda x: x[0])
    sorted_dates, sorted_values = zip(*pairs)

    step_velocities: List[Dict[str, Any]] = []
    velocity_list: List[float] = []

    for i in range(1, len(sorted_dates)):
        prev_d, prev_v = sorted_dates[i - 1], float(sorted_values[i - 1])
        curr_d, curr_v = sorted_dates[i], float(sorted_values[i])

        dt_days = (curr_d - prev_d).days
        delta_val = curr_v - prev_v

        if dt_days > 0:
            dt_years = dt_days / 365.25
            velocity = delta_val / dt_years
        else:
            velocity = 0.0

        vel_rounded = round(velocity, 4)
        velocity_list.append(vel_rounded)

        step_velocities.append({
            "from_date": str(prev_d),
            "to_date": str(curr_d),
            "dt_days": dt_days,
            "delta_value": round(delta_val, 4),
            "velocity_per_year": vel_rounded
        })

    # Latest velocity (between last two encounters)
    latest_velocity = velocity_list[-1] if velocity_list else 0.0

    # Overall velocity (from first baseline record to last encounter)
    first_d, first_v = sorted_dates[0], sorted_values[0]
    last_d, last_v = sorted_dates[-1], sorted_values[-1]
    total_dt_days = (last_d - first_d).days
    total_delta = last_v - first_v

    if total_dt_days > 0:
        overall_velocity = round(total_delta / (total_dt_days / 365.25), 4)
    else:
        overall_velocity = 0.0

    # Average velocity across all steps
    avg_velocity = round(sum(velocity_list) / len(velocity_list), 4) if velocity_list else 0.0

    return {
        "sample_size": len(sorted_values),
        "baseline_date": str(first_d),
        "latest_date": str(last_d),
        "total_days_elapsed": total_dt_days,
        "latest_velocity_per_year": latest_velocity,
        "overall_velocity_per_year": overall_velocity,
        "average_velocity_per_year": avg_velocity,
        "step_velocities": step_velocities
    }
