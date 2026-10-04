import numpy as np
from typing import List, Dict, Any, Union
from datetime import date, datetime

try:
    import ruptures as rpt
    HAS_RUPTURES = True
except ImportError:
    HAS_RUPTURES = False


def detect_biomarker_changepoints(
    dates: List[Union[date, str]],
    values: List[float]
) -> Dict[str, Any]:
    """
    Sample-size-guarded changepoint detection:
    - If N >= 8: Executes PELT (Pruned Exact Linear Time) algorithm via ruptures library.
    - If 3 <= N < 8: Automatically falls back to rolling Z-score delta alerts to prevent false positives.
    - If N < 3: Returns insufficient data status.
    """
    if len(dates) != len(values):
        raise ValueError("Dates and values arrays must have equal length.")

    n_samples = len(values)

    if not dates or n_samples < 3:
        return {
            "sample_size": n_samples,
            "method_used": "INSUFFICIENT_DATA_SPARSE",
            "changepoints_detected_count": 0,
            "changepoints": [],
            "message": f"Sparse history (N={n_samples} < 3). Changepoint detection requires minimum N >= 3."
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

    signal = np.array(sorted_values, dtype=float)
    detected_changepoints: List[Dict[str, Any]] = []

    # =====================================================================
    # Strategy A: PELT Algorithm via Ruptures Library (N >= 8)
    # =====================================================================
    if n_samples >= 8 and HAS_RUPTURES:
        method_used = "PELT_RUPTURES_ALGORITHM"
        try:
            # Execute PELT algorithm with Radial Basis Function (rbf) kernel
            algo = rpt.Pelt(model="rbf", min_size=2, jump=1).fit(signal)
            # Penalty parameter tailored for clinical time-series
            cps = algo.predict(pen=2.5)

            # Filter out final index (which is always len(signal))
            changepoint_indices = [idx for idx in cps if 0 < idx < n_samples]

            for idx in changepoint_indices:
                cp_date = sorted_dates[idx]
                cp_val = sorted_values[idx]

                # Calculate mean shift before and after changepoint
                mean_before = float(np.mean(signal[:idx]))
                mean_after = float(np.mean(signal[idx:]))
                delta_mean = round(mean_after - mean_before, 4)

                detected_changepoints.append({
                    "index": idx,
                    "date": str(cp_date),
                    "value_at_shift": round(float(cp_val), 4),
                    "mean_before_shift": round(mean_before, 4),
                    "mean_after_shift": round(mean_after, 4),
                    "delta_mean": delta_mean,
                    "alert_type": "MEAN_VARIANCE_SHIFT",
                    "severity": "HIGH" if abs(delta_mean) > (0.15 * mean_before) else "MODERATE"
                })
        except Exception as e:
            print(f"[WARNING] Ruptures PELT execution error: {e}. Falling back to Rolling Z-score.")
            method_used = "ROLLING_Z_SCORE_DELTA_FALLBACK"

    # =====================================================================
    # Strategy B: Rolling Z-Score Delta Alerts (3 <= N < 8 or Ruptures Fallback)
    # =====================================================================
    if n_samples < 8 or not HAS_RUPTURES or not detected_changepoints:
        if n_samples >= 8 and detected_changepoints:
            pass  # Already generated via PELT
        else:
            method_used = "ROLLING_Z_SCORE_DELTA"
            for i in range(2, n_samples):
                history = signal[:i]
                current_val = signal[i]
                current_date = sorted_dates[i]

                mu = float(np.mean(history))
                sigma = float(np.std(history))

                if sigma > 1e-4:
                    z_score = (current_val - mu) / sigma
                else:
                    z_score = 0.0

                # Flag anomaly if rolling Z-score magnitude exceeds 2.0
                if abs(z_score) >= 2.0:
                    delta_mean = round(current_val - mu, 4)
                    detected_changepoints.append({
                        "index": i,
                        "date": str(current_date),
                        "value_at_shift": round(float(current_val), 4),
                        "mean_before_shift": round(mu, 4),
                        "mean_after_shift": round(current_val, 4),
                        "delta_mean": delta_mean,
                        "z_score": round(z_score, 2),
                        "alert_type": "ROLLING_Z_SCORE_SPIKE",
                        "severity": "HIGH" if abs(z_score) >= 2.5 else "MODERATE"
                    })

    return {
        "sample_size": n_samples,
        "method_used": method_used,
        "changepoints_detected_count": len(detected_changepoints),
        "changepoints": detected_changepoints
    }
