export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
  created_at: string;
}

export interface BoundingBox {
  page: number;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

export interface BiomarkerReading {
  id: string;
  canonical_name: string;
  display_name: string;
  loinc_code?: string;
  raw_name: string;
  raw_value: number;
  raw_unit: string;
  canonical_value: number;
  canonical_unit: string;
  lab_ref_min?: number;
  lab_ref_max?: number;
  test_date: string;
  is_abnormal: boolean;
  confidence_score?: number;
  source_bounding_box?: BoundingBox;
}

export interface Medication {
  id: string;
  medication_name: string;
  rxnorm_code?: string;
  dosage?: string;
  frequency?: string;
  is_active: boolean;
  prescribed_date: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  category: 'LAB_REPORT' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'ACUTE_EPISODE' | 'SURGERY' | 'ROUTINE';
  facility?: string;
  details: string;
  statusTag?: string;
  statusType?: 'stable' | 'warning' | 'critical';
  biomarkers?: BiomarkerReading[];
  medications?: Medication[];
  document_url?: string;
}

export interface VelocityMetrics {
  sample_size: number;
  baseline_date?: string;
  latest_date?: string;
  total_days_elapsed?: number;
  latest_velocity_per_year: number;
  overall_velocity_per_year: number;
  average_velocity_per_year: number;
}

export interface ForecastPoint {
  days_ahead: number;
  projected_date: string;
  projected_value: number;
  confidence_interval_95: {
    lower_bound: number;
    upper_bound: number;
  };
}

export interface ForecastMetrics {
  sample_size: number;
  forecast_available: boolean;
  bayesian_annual_slope?: number;
  forecast_points?: ForecastPoint[];
  cutoff_projection?: {
    target_cutoff: number;
    cutoff_direction: string;
    is_moving_towards_cutoff: boolean;
    projected_crossing_date?: string;
    days_remaining?: number;
    months_remaining?: number;
    clinical_warning: string;
  };
}

export interface Changepoint {
  index: number;
  date: string;
  value_at_shift: number;
  mean_before_shift: number;
  mean_after_shift: number;
  delta_mean: number;
  alert_type: string;
  severity: 'HIGH' | 'MODERATE';
}

export interface ChangepointMetrics {
  sample_size: number;
  method_used: string;
  changepoints_detected_count: number;
  changepoints: Changepoint[];
}

export interface TrajectoryAnalytics {
  status: string;
  patient_id: string;
  canonical_name: string;
  display_name: string;
  standard_unit: string;
  sample_size: number;
  historical_records: Array<{
    test_date: string;
    canonical_value: number;
    canonical_unit: string;
    is_abnormal?: boolean;
  }>;
  velocity_metrics: VelocityMetrics;
  forecast_metrics: ForecastMetrics;
  changepoint_metrics: ChangepointMetrics;
}
