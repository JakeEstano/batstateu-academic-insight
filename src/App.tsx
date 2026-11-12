import { modelPredictions, summarizeRisk, riskModel, type RiskPrediction } from "./data/demoRisk"
import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Info,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type Subject = {
  code: string
  name: string
  passing: number
  total: number
}

type Period = {
  id: string
  year: string
  semester: string
  short: string
  gradeOnTime: number
  gradeDue: number
  seteCompleted: number
  seteEligible: number
  seteRating: number
  riskPredictions: RiskPrediction[]
  subjects: Subject[]
  dimensions: number[]
}

const dimensions = [
  "Clarity of Instruction",
  "Student Engagement",
  "Assessment Practices",
  "Quality of Feedback",
  "Lesson Organization",
]

const periods: Period[] = [
  {
    id: "2025-1",
    year: "AY 2025–2026",
    semester: "First Semester",
    short: "1S 25–26",
    gradeOnTime: 89,
    gradeDue: 100,
    seteCompleted: 58,
    seteEligible: 100,
    seteRating: 3.72,
    riskPredictions: modelPredictions("2025-1"),
    subjects: [
      {
        code: "IT 101",
        name: "Introduction to Programming",
        passing: 16,
        total: 20,
      },
      {
        code: "IT 311",
        name: "Systems Administration and Maintenance",
        passing: 15,
        total: 20,
      },
      {
        code: "IT 312",
        name: "Systems Integration and Architecture",
        passing: 14,
        total: 20,
      },
      {
        code: "IT 313",
        name: "System Analysis and Design",
        passing: 17,
        total: 20,
      },
      {
        code: "BAT 401",
        name: "Fundamentals of Business Analytics",
        passing: 17,
        total: 20,
      },
    ],
    dimensions: [3.8, 3.6, 3.7, 3.5, 4.0],
  },
  {
    id: "2025-2",
    year: "AY 2025–2026",
    semester: "Second Semester",
    short: "2S 25–26",
    gradeOnTime: 93,
    gradeDue: 100,
    seteCompleted: 76,
    seteEligible: 100,
    seteRating: 3.94,
    riskPredictions: modelPredictions("2025-2"),
    subjects: [
      {
        code: "IT 101",
        name: "Introduction to Programming",
        passing: 18,
        total: 20,
      },
      {
        code: "IT 311",
        name: "Systems Administration and Maintenance",
        passing: 17,
        total: 20,
      },
      {
        code: "IT 312",
        name: "Systems Integration and Architecture",
        passing: 16,
        total: 20,
      },
      {
        code: "IT 313",
        name: "System Analysis and Design",
        passing: 18,
        total: 20,
      },
      {
        code: "BAT 401",
        name: "Fundamentals of Business Analytics",
        passing: 18,
        total: 20,
      },
    ],
    dimensions: [4.1, 3.9, 3.8, 3.7, 4.2],
  },
  {
    id: "2026-1",
    year: "AY 2026–2027",
    semester: "First Semester",
    short: "1S 26–27",
    gradeOnTime: 96,
    gradeDue: 100,
    seteCompleted: 55,
    seteEligible: 100,
    seteRating: 4.1,
    riskPredictions: modelPredictions("2026-1"),
    subjects: [
      {
        code: "IT 101",
        name: "Introduction to Programming",
        passing: 19,
        total: 20,
      },
      {
        code: "IT 311",
        name: "Systems Administration and Maintenance",
        passing: 17,
        total: 20,
      },
      {
        code: "IT 312",
        name: "Systems Integration and Architecture",
        passing: 15,
        total: 20,
      },
      {
        code: "IT 313",
        name: "System Analysis and Design",
        passing: 18,
        total: 20,
      },
      {
        code: "BAT 401",
        name: "Fundamentals of Business Analytics",
        passing: 18,
        total: 20,
      },
    ],
    dimensions: [4.3, 4.0, 4.1, 3.8, 4.3],
  },
  {
    id: "2026-2",
    year: "AY 2026–2027",
    semester: "Second Semester",
    short: "2S 26–27",
    gradeOnTime: 98,
    gradeDue: 100,
    seteCompleted: 84,
    seteEligible: 100,
    seteRating: 4.24,
    riskPredictions: modelPredictions("2026-2"),
    subjects: [
      {
        code: "IT 101",
        name: "Introduction to Programming",
        passing: 19,
        total: 20,
      },
      {
        code: "IT 311",
        name: "Systems Administration and Maintenance",
        passing: 18,
        total: 20,
      },
      {
        code: "IT 312",
        name: "Systems Integration and Architecture",
        passing: 17,
        total: 20,
      },
      {
        code: "IT 313",
        name: "System Analysis and Design",
        passing: 19,
        total: 20,
      },
      {
        code: "BAT 401",
        name: "Fundamentals of Business Analytics",
        passing: 18,
        total: 20,
      },
    ],
    dimensions: [4.4, 4.2, 4.1, 4.0, 4.5],
  },
]

const percent = (part: number, whole: number) =>
  Math.round((part / whole) * 100)

function passingRate(period: Period) {
  return percent(
    period.subjects.reduce((sum, subject) => sum + subject.passing, 0),
    period.subjects.reduce((sum, subject) => sum + subject.total, 0),
  )
}

type KpiKey = "grades" | "passing" | "participation" | "rating" | "risk"
type Kpi = {
  key: KpiKey
  label: string
  value: number
  display: string
  target: string
  met: boolean
  status: string
  formula: string
  interpretation: string
  action: string
  icon: typeof Clock3
}

function calculateKpis(period: Period): Kpi[] {
  const risk = summarizeRisk(period.riskPredictions)
  const values = {
    grades: percent(period.gradeOnTime, period.gradeDue),
    passing: passingRate(period),
    participation: percent(period.seteCompleted, period.seteEligible),
    rating: period.seteRating,
    risk: percent(risk.atRisk, risk.assessed),
  }
  return [
    {
      key: "grades",
      label: "On-Time Grade Submission",
      value: values.grades,
      display: `${values.grades}%`,
      target: "≥95%",
      met: values.grades >= 95,
      status: values.grades >= 95 ? "Meeting target" : "Below target",
      formula: "(On-time submissions / Total submissions due) × 100",
      interpretation:
        "Measures whether required final grades were submitted within the official timeline.",
      action:
        "Follow up on outstanding submissions and reinforce grade submission timelines.",
      icon: Clock3,
    },
    {
      key: "passing",
      label: "Subject Passing Rate",
      value: values.passing,
      display: `${values.passing}%`,
      target: "≥85%",
      met: values.passing >= 85,
      status: values.passing >= 85 ? "Meeting target" : "Below target",
      formula: "(Passing final grades / Total final grades recorded) × 100",
      interpretation:
        "Summarizes the proportion of final grades that meet the passing standard.",
      action:
        "Review low-performing subjects and coordinate targeted learning support.",
      icon: TrendingUp,
    },
    {
      key: "participation",
      label: "SETE Participation Rate",
      value: values.participation,
      display: `${values.participation}%`,
      target: "≥80%",
      met: values.participation >= 80,
      status: values.participation >= 80 ? "Meeting target" : "Below target",
      formula:
        "(Completed eligible evaluations / Total eligible evaluations) × 100",
      interpretation:
        "Indicates how much of the eligible student population completed a teaching evaluation.",
      action:
        "Review participation and coordinate student reminders before the evaluation deadline.",
      icon: Users,
    },
    {
      key: "rating",
      label: "Average SETE Rating",
      value: values.rating,
      display: `${values.rating.toFixed(1)}/5`,
      target: "≥4.0/5",
      met: values.rating >= 4,
      status: values.rating >= 4 ? "Meeting target" : "Below target",
      formula: "Sum of valid ratings / Number of valid ratings",
      interpretation:
        "Aggregated average of valid teaching evaluation ratings for the selected period.",
      action:
        "Use dimension-level results with other evidence to identify teaching improvement opportunities.",
      icon: Star,
    },
    {
      key: "risk",
      label: "At-Risk Student Rate",
      value: values.risk,
      display: `${values.risk}%`,
      target: "≤20%",
      met: values.risk <= 20,
      status: values.risk <= 20 ? "Meeting target" : "Above target",
      formula: "(Students flagged at risk / Total assessed students) × 100",
      interpretation:
        `${risk.atRisk} of ${risk.assessed} anonymous synthetic records are predicted at risk by the demonstration KNN model. The predicted outcome is failing at least one subject in the following semester. This model has not been validated on real university data.`,
      action:
        "Review common risk factors and prioritize supportive academic advising.",
      icon: AlertTriangle,
    },
  ]
}

type AcademicAlert = {
  key: KpiKey
  title: string
  value: string
  reason: string
  action: string
}

function calculateAlerts(kpis: Kpi[]): AcademicAlert[] {
  const value = Object.fromEntries(
    kpis.map((kpi) => [kpi.key, kpi]),
  ) as Record<KpiKey, Kpi>
  const alerts: AcademicAlert[] = []
  if (value.grades.value < 90)
    alerts.push({
      key: "grades",
      title: "Grade submission below warning threshold",
      value: value.grades.display,
      reason: "The proposed warning threshold is 90%.",
      action: value.grades.action,
    })
  if (value.passing.value < 80)
    alerts.push({
      key: "passing",
      title: "Subject performance needs review",
      value: value.passing.display,
      reason: "The proposed warning threshold is 80%.",
      action: value.passing.action,
    })
  if (value.participation.value < 60)
    alerts.push({
      key: "participation",
      title: "SETE participation below warning threshold",
      value: value.participation.display,
      reason: "The proposed warning threshold is 60%.",
      action: value.participation.action,
    })
  if (value.rating.value < 3.5)
    alerts.push({
      key: "rating",
      title: "Average SETE rating needs review",
      value: value.rating.display,
      reason: "The proposed review threshold is 3.5/5.",
      action: value.rating.action,
    })
  if (value.risk.value > 25)
    alerts.push({
      key: "risk",
      title: "Elevated academic risk",
      value: value.risk.display,
      reason: "The proposed warning threshold is 25%.",
      action: value.risk.action,
    })
  return alerts
}

type ModalState = { type: "kpi"; data: Kpi } | {
  type: "semester"
  data: Period
} | { type: "subject"; data: Subject } | {
  type: "dimension"
  data: { period: Period; dimension: string; score: number }
} | { type: "alert"; data: AcademicAlert } | {
  type: "alerts"
  data: AcademicAlert[]
} | null

function SelectField({
  label,
  value,
  onChange,
  children,
  disabled,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <label className={`select-field ${disabled ? "is-locked" : ""}`}>
      <span>{label}</span>
      <div>
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value)}
        >
          {children}
        </select>
        {disabled ? <ShieldCheck size={13} /> : <ChevronDown size={14} />}
      </div>
    </label>
  )
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          <div>
            <span>Analytics detail</span>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </header>
        <div className="modal-content">{children}</div>
      </section>
    </div>
  )
}

function LineTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: Period; value?: number }>
}) {
  const period = payload?.[0]?.payload
  if (!active || !period) return null
  return (
    <div className="chart-tooltip">
      <span>{period.year}</span>
      <strong>{period.semester}</strong>
      <p>
        Average rating <b>{period.seteRating.toFixed(2)}/5</b>
      </p>
    </div>
  )
}

function BarTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: Subject & { rate: number } }>
}) {
  const subject = payload?.[0]?.payload
  if (!active || !subject) return null
  return (
    <div className="chart-tooltip">
      <span>{subject.code}</span>
      <strong>{subject.name}</strong>
      <p>
        {subject.passing} passing · {subject.total - subject.passing} failing
      </p>
      <p>
        Passing rate <b>{subject.rate}%</b>
      </p>
    </div>
  )
}

type DotProps = { cx?: number; cy?: number; payload?: Period }
function RatingDot({
  cx = 0,
  cy = 0,
  payload,
  onSelect,
}: DotProps & { onSelect: (period: Period) => void }) {
  if (!payload) return null
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#fff"
      stroke="#b91c1c"
      strokeWidth={2.5}
      className="rating-dot"
      tabIndex={0}
      role="button"
      aria-label={`Open ${payload.short} rating details`}
      onClick={() => onSelect(payload)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect(payload)
      }}
    />
  )
}

function App() {
  const [year, setYear] = useState("AY 2026–2027")
  const [semester, setSemester] = useState("First Semester")
  const [modal, setModal] = useState<ModalState>(null)
  const [resetting, setResetting] = useState(false)

  const period =
    periods.find((item) => item.year === year && item.semester === semester) ||
    periods[2]
  // Retain historical context while excluding periods after the selected semester.
  const selectedPeriodIndex = periods.findIndex((item) => item.id === period.id)
  const historyPeriods = periods.slice(0, selectedPeriodIndex + 1)
  const kpis = useMemo(() => calculateKpis(period), [period])
  const alerts = useMemo(() => calculateAlerts(kpis), [kpis])
  const previous =
    periods[periods.findIndex((item) => item.id === period.id) - 1]
  const subjectChartData = period.subjects.map((subject) => ({
    ...subject,
    rate: percent(subject.passing, subject.total),
  }))

  function resetFilters() {
    setResetting(true)
    setYear("AY 2026–2027")
    setSemester("First Semester")
    window.setTimeout(() => setResetting(false), 450)
  }

  function openSubject(subject: Subject & { rate?: number }) {
    setModal({ type: "subject", data: subject })
  }

  const heatColor = (score: number) => {
    if (score >= 4.2) return "heat-excellent"
    if (score >= 4.0) return "heat-strong"
    if (score >= 3.7) return "heat-steady"
    if (score >= 3.5) return "heat-watch"
    return "heat-critical"
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand-lockup">
          <span className="brand-mark">
            <span>B</span>
          </span>
          <div>
            <strong>BatStateU Academic Insight</strong>
            <small>Academic Performance &amp; Teaching Effectiveness</small>
          </div>
        </div>
        <div className="header-actions">
          <div className="period-context">
            <span>Active period</span>
            <strong>
              {year.replace("AY ", "")} · {semester.replace(" Semester", "")}
            </strong>
          </div>
          <button
            className="notification-button"
            aria-label={`Open ${alerts.length} academic alerts`}
            onClick={() => setModal({ type: "alerts", data: alerts })}
          >
            <Bell size={18} />
            {alerts.length > 0 && <i>{alerts.length}</i>}
          </button>
          <div className="role">
            <span>PC</span>
            <div>
              <strong>Program Chair</strong>
              <small>BS Information Technology</small>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="overview-row">
          <div>
            <h1>Academic Overview</h1>
            <p>
              Monitor academic performance, teaching effectiveness, and emerging
              concerns.
            </p>
          </div>
          <button className="review-summary" onClick={() => setModal({ type: "alerts", data: alerts })}>
            <AlertTriangle size={16} />
            {alerts.length ? `${alerts.length} academic concerns to review` : "No warning thresholds triggered"}
            <span aria-hidden="true">→</span>
          </button>
        </section>

        <div className="dashboard-context" aria-label="Dashboard access and data status">
          <span><ShieldCheck size={14} /> Restricted Access — BSIT Program Chair</span>
          <span className="demo-data-label"><i aria-hidden="true" /> Demo Data</span>
          <span>Role-scoped demonstration · No live university connection</span>
        </div>

        <section className="filter-toolbar" aria-label="Dashboard filters">
          <SelectField
            label="Academic Year"
            value={year}
            onChange={(value) => {
              setYear(value)
              setSemester("First Semester")
            }}
          >
            <option>AY 2026–2027</option>
            <option>AY 2025–2026</option>
          </SelectField>
          <SelectField label="Semester" value={semester} onChange={setSemester}>
            <option>First Semester</option>
            <option>Second Semester</option>
          </SelectField>
          <SelectField label="College" value="CICS" disabled>
            <option value="CICS">Informatics &amp; Computing Sciences</option>
          </SelectField>
          <SelectField label="Program / Department" value="BSIT" disabled>
            <option value="BSIT">BS Information Technology</option>
          </SelectField>
          <button className="reset-button" onClick={resetFilters}>
            <RefreshCw size={14} className={resetting ? "spin" : ""} /> Reset
          </button>

        </section>

        <section className="kpi-grid" aria-label="Key performance indicators">
          {kpis.map((kpi) => {
            const previousKpi = previous
              ? calculateKpis(previous).find((item) => item.key === kpi.key)
              : undefined
            const delta = previousKpi ? kpi.value - previousKpi.value : 0
            const improved = kpi.key === "risk" ? delta <= 0 : delta >= 0
            return (
              <button
                className="kpi-card"
                key={kpi.key}
                onClick={() => setModal({ type: "kpi", data: kpi })}
              >
                <div className="kpi-card-top">
                  <span
                    className={`status-dot ${kpi.met ? "success" : "warning"}`}
                  >
                    <i />
                    {kpi.status}
                  </span>
                </div>
                <span className="kpi-label">{kpi.label}</span>
                <strong className="kpi-value" key={`${period.id}-${kpi.key}`}>
                  {kpi.display}
                </strong>
                <div className="kpi-meta">
                  <span>
                    Target <b>{kpi.target}</b>
                  </span>
                  <span className={!previousKpi || delta === 0 ? "" : improved ? "positive" : "negative"}>
                    {previousKpi ? <>{delta > 0 ? "+" : ""}{delta.toFixed(kpi.key === "rating" ? 1 : 0)}{kpi.key === "rating" ? "" : " pts"} <small>vs prior semester</small></> : <small>No prior semester</small>}
                  </span>
                </div>
              </button>
            )
          })}
        </section>

        <section className="chart-row chart-row-primary">
          <article className="analytics-card line-card">
            <div className="card-heading">
              <div>
                <span>History through {period.short}</span>
                <h2>SETE Performance Over Time</h2>
              </div>
              <div className="current-stat">
                <strong>{period.seteRating.toFixed(1)}</strong>
                <span>/ 5 current</span>
              </div>
            </div>
            <div className="line-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={historyPeriods}
                  margin={{ top: 9, right: 12, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#b91c1c"
                        stopOpacity={0.16}
                      />
                      <stop offset="100%" stopColor="#b91c1c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="#eeeeF1"
                    strokeDasharray="3 4"
                  />
                  <XAxis
                    dataKey="short"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8b8b94", fontSize: 11 }}
                    dy={7}
                  />
                  <YAxis
                    domain={[3, 5]}
                    ticks={[3, 4, 5]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  />
                  <Tooltip
                    content={<LineTooltip />}
                    cursor={{ stroke: "#d4d4d8", strokeDasharray: "3 3" }}
                  />
                  <ReferenceLine
                    y={4}
                    stroke="#a1a1aa"
                    strokeDasharray="5 4"
                    label={{
                      value: "Target 4.0",
                      fill: "#8b8b94",
                      fontSize: 11,
                      position: "insideTopRight",
                    }}
                  />
                  <Area
                    type="linear"
                    dataKey="seteRating"
                    stroke="#b91c1c"
                    strokeWidth={2.4}
                    fill="#b91c1c"
                    fillOpacity={0.05}
                    animationDuration={500}
                    dot={(props: unknown) => (
                      <RatingDot
                        {...props as DotProps}
                        onSelect={(item) =>
                          setModal({ type: "semester", data: item })
                        }
                      />
                    )}
                    activeDot={{
                      r: 6,
                      fill: "#b91c1c",
                      stroke: "#fff",
                      strokeWidth: 3,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="chart-hint">
              <Info size={11} /> Select a data point for its semester summary.
            </p>
          </article>

          <article className="analytics-card bar-card">
            <div className="card-heading">
              <div>
                <span>Course outcomes</span>
                <h2>Subject Passing Rates</h2>
              </div>
              <div className="current-stat">
                <strong>{passingRate(period)}%</strong>
                <span>program average</span>
              </div>
            </div>
            <div className="bar-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectChartData}
                  layout="vertical"
                  margin={{ top: 2, right: 28, left: 2, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="#eeeeF1" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    ticks={[0, 50, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    unit="%"
                  />
                  <YAxis
                    type="category"
                    dataKey="code"
                    width={52}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#52525b", fontSize: 11, fontWeight: 600 }}
                  />
                  <Tooltip
                    content={<BarTooltip />}
                    cursor={{ fill: "#fafafa" }}
                  />
                  <ReferenceLine
                    x={85}
                    stroke="#a1a1aa"
                    strokeDasharray="4 4"
                    label={{
                      value: "85%",
                      fill: "#8b8b94",
                      fontSize: 11,
                      position: "insideTop",
                    }}
                  />
                  <Bar
                    dataKey="rate"
                    radius={[0, 5, 5, 0]}
                    barSize={12}
                    animationDuration={500}
                    cursor="pointer"
                    onClick={(entry) =>
                      openSubject(
                        (entry as unknown as {
                          payload: Subject & { rate: number }
                        }).payload ||
                          entry as unknown as Subject & { rate: number },
                      )
                    }
                  >
                    {subjectChartData.map((subject) => (
                      <Cell
                        key={subject.code}
                        fill={subject.rate < 80 ? "#d97706" : "#b91c1c"}
                      />
                    ))}
                    <LabelList
                      dataKey="rate"
                      position="right"
                      formatter={(value) => `${value}%`}
                      fill="#52525b"
                      fontSize={11}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="chart-hint">
              <Info size={11} /> Amber indicates a passing rate below 80%.
            </p>
          </article>
        </section>

        <section className="chart-row chart-row-secondary">
          <article className="analytics-card heatmap-card">
            <div className="card-heading">
              <div>
                <span>Illustrative categories · Through {period.short}</span>
                <h2>SETE Teaching Dimensions</h2>
              </div>
              <span className="aggregate-badge">
                <ShieldCheck size={12} /> Aggregated only
              </span>
            </div>
            <div className="heatmap" style={{ gridTemplateColumns: `minmax(110px, 1.6fr) repeat(${historyPeriods.length}, minmax(32px, 1fr))` }}>
              <div />
              {historyPeriods.map((item) => (
                <div
                  className={`heat-column ${
                    item.id === period.id ? "selected" : ""
                  }`}
                  key={item.id}
                >
                  {item.short}
                </div>
              ))}
              {dimensions.map((dimension, dimensionIndex) => (
                <div className="heat-row" key={dimension}>
                  <span>{dimension}</span>
                  {historyPeriods.map((item) => {
                    const score = item.dimensions[dimensionIndex]
                    return (
                      <button
                        key={item.id}
                        className={`heat-cell ${heatColor(score)} ${
                          item.id === period.id ? "selected" : ""
                        }`}
                        aria-label={`${dimension}, ${item.short}: ${score.toFixed(1)} out of 5`}
                        onClick={() =>
                          setModal({
                            type: "dimension",
                            data: { period: item, dimension, score },
                          })
                        }
                      >
                        {score.toFixed(1)}
                        <span>
                          {dimension}
                          <br />
                          {item.semester}: {score.toFixed(1)}/5
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="heat-legend">
              <span>Lower</span>
              <i className="heat-critical" />
              <i className="heat-watch" />
              <i className="heat-steady" />
              <i className="heat-strong" />
              <i className="heat-excellent" />
              <span>Higher</span>
              <em>Illustrative dimensions</em>
            </div>
          </article>

          <article className="analytics-card alerts-card">
            <div className="card-heading">
              <div>
                <span>Automated monitoring</span>
                <h2>Academic Alerts</h2>
              </div>
              <span
                className={`alert-count ${alerts.length === 0 ? "clear" : ""}`}
              >
                {alerts.length} active
              </span>
            </div>
            <div className="alert-feed">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <button
                    className="alert-item"
                    key={alert.key}
                    onClick={() => setModal({ type: "alert", data: alert })}
                  >
                    <span className="alert-symbol">
                      <AlertTriangle size={15} />
                    </span>
                    <span className="alert-copy">
                      <strong>{alert.title}</strong>
                      <small>
                        <b>{alert.value}</b> · {alert.reason}
                      </small>
                    </span>
                    <span className="view-action">View</span>
                  </button>
                ))
              ) : (
                <div className="alert-empty">
                  <span>
                    <Check size={18} />
                  </span>
                  <div>
                    <strong>No active threshold alerts</strong>
                    <p>
                      All monitored indicators are within the proposed warning
                      thresholds.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="alert-note">
              <Info size={12} />
              <span>
                Thresholds are proposed for this case study and can be reviewed
                by authorized academic leaders.
              </span>
            </div>
          </article>
        </section>
      </main>

      <footer>
        <div>
          <span>
            <i /> Illustrative Academic Data — For Case Study Demonstration Only
          </span>
          <span>
            <ShieldCheck size={12} /> Aggregated, role-scoped information
          </span>
        </div>
        <p>
          SETE results are supporting evidence and should not be the sole basis
          for faculty performance decisions.
        </p>
      </footer>

      {modal?.type === "kpi" && (
        <Modal
          title={modal.data.label}
          subtitle={`${period.semester} · ${period.year}`}
          onClose={() => setModal(null)}
        >
          <div className="modal-metrics">
            <div>
              <span>Current value</span>
              <strong>{modal.data.display}</strong>
            </div>
            <div>
              <span>Management target</span>
              <strong>{modal.data.target}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong
                className={modal.data.met ? "text-success" : "text-warning"}
              >
                {modal.data.status}
              </strong>
            </div>
          </div>
          <div className="detail-list">
            <div>
              <span>Calculation formula</span>
              <p>{modal.data.formula}</p>
            </div>
            <div>
              <span>Previous-semester comparison</span>
              <p>
                {previous
                  ? `${calculateKpis(previous).find((item) => item.key === modal.data.key)?.display} in ${previous.short}`
                  : "No earlier sample period is available."}
              </p>
            </div>
            <div>
              <span>Interpretation</span>
              <p>{modal.data.interpretation}</p>
            </div>
          </div>
          <div className="action-callout">
            <span>
              <TrendingUp size={17} />
            </span>
            <div>
              <strong>Recommended management action</strong>
              <p>{modal.data.action}</p>
            </div>
          </div>
          {modal.data.key === "risk" && (
            <div className="detail-list">
              <div>
                <span>Model and inputs</span>
                <p>KNN classification · k={riskModel.best_parameters.knn__n_neighbors} · {riskModel.best_parameters.knn__weights} weights. Inputs: previous average grade, attendance, previous failed subjects, and assignment completion.</p>
              </div>
              <div>
                <span>Held-out synthetic test results</span>
                <p>Recall: {(riskModel.test_metrics.recall * 100).toFixed(1)}% · Precision: {(riskModel.test_metrics.precision * 100).toFixed(1)}% · Accuracy: {(riskModel.test_metrics.accuracy * 100).toFixed(1)}%. Evaluated on {riskModel.test_records} fictional records; {riskModel.training_records} separate records used for training.</p>
              </div>
              <div>
                <span>Responsible use</span>
                <p>Synthetic-data results demonstrate the workflow, not real-world accuracy. A flag suggests supportive adviser review and must not automatically determine a student’s academic standing.</p>
              </div>
            </div>
          )}
          <DemoNotice />
        </Modal>
      )}

      {modal?.type === "semester" && (
        <Modal
          title={`${modal.data.short} SETE Summary`}
          subtitle={`${modal.data.semester} · ${modal.data.year}`}
          onClose={() => setModal(null)}
        >
          <div className="modal-metrics">
            <div>
              <span>Average SETE rating</span>
              <strong>{modal.data.seteRating.toFixed(2)}/5</strong>
            </div>
            <div>
              <span>Participation</span>
              <strong>
                {percent(modal.data.seteCompleted, modal.data.seteEligible)}%
              </strong>
            </div>
            <div>
              <span>Valid completions</span>
              <strong>{modal.data.seteCompleted}</strong>
            </div>
          </div>
          <div className="detail-list">
            <div>
              <span>Semester interpretation</span>
              <p>
                The aggregated rating is{" "}
                {modal.data.seteRating >= 4 ? "at or above" : "below"} the 4.0
                teaching effectiveness target. Participation should be
                considered when interpreting the result.
              </p>
            </div>
          </div>
          <div className="action-callout">
            <span>
              <Star size={17} />
            </span>
            <div>
              <strong>Evidence note</strong>
              <p>
                Use SETE together with course context, peer input, and other
                authorized evidence.
              </p>
            </div>
          </div>
          <DemoNotice />
        </Modal>
      )}

      {modal?.type === "subject" && (
        <Modal
          title={`${modal.data.code} Subject Performance`}
          subtitle={modal.data.name}
          onClose={() => setModal(null)}
        >
          <div className="modal-metrics">
            <div>
              <span>Passing students</span>
              <strong>{modal.data.passing}</strong>
            </div>
            <div>
              <span>Failing students</span>
              <strong>{modal.data.total - modal.data.passing}</strong>
            </div>
            <div>
              <span>Passing rate</span>
              <strong>{percent(modal.data.passing, modal.data.total)}%</strong>
            </div>
          </div>
          <div className="performance-track">
            <span
              style={{
                width: `${percent(modal.data.passing, modal.data.total)}%`,
              }}
            />
            <i />
          </div>
          <div className="action-callout">
            <span>
              <BookOpen size={17} />
            </span>
            <div>
              <strong>Recommended action</strong>
              <p>
                {percent(modal.data.passing, modal.data.total) < 80
                  ? "Review assessment outcomes and coordinate targeted support for learners below the passing standard."
                  : "Continue monitoring outcomes and document effective course practices."}
              </p>
            </div>
          </div>
          <DemoNotice />
        </Modal>
      )}

      {modal?.type === "dimension" && (
        <Modal
          title={modal.data.dimension}
          subtitle={`${modal.data.period.semester} · ${modal.data.period.year}`}
          onClose={() => setModal(null)}
        >
          <div className="dimension-hero">
            <span>Aggregated illustrative rating</span>
            <strong>
              {modal.data.score.toFixed(1)}
              <small>/5</small>
            </strong>
          </div>
          <div className="detail-list">
            <div>
              <span>Interpretation</span>
              <p>
                This score summarizes valid ratings for the selected
                illustrative teaching dimension. It does not expose individual
                responses or confidential comments.
              </p>
            </div>
          </div>
          <div className="action-callout">
            <span>
              <Sparkles size={17} />
            </span>
            <div>
              <strong>Suggested improvement</strong>
              <p>
                {modal.data.score < 4
                  ? "Review this dimension with course context and identify one practical teaching enhancement for the next cycle."
                  : "Sustain the effective practice and consider sharing relevant approaches through peer collaboration."}
              </p>
            </div>
          </div>
          <DemoNotice />
        </Modal>
      )}

      {modal?.type === "alert" && (
        <Modal
          title={modal.data.title}
          subtitle={`${period.semester} · ${period.year}`}
          onClose={() => setModal(null)}
        >
          <div className="alert-detail-value">
            <span>Current metric</span>
            <strong>{modal.data.value}</strong>
            <p>{modal.data.reason}</p>
          </div>
          <div className="action-callout">
            <span>
              <AlertTriangle size={17} />
            </span>
            <div>
              <strong>Recommended action</strong>
              <p>{modal.data.action}</p>
            </div>
          </div>
          <DemoNotice />
        </Modal>
      )}

      {modal?.type === "alerts" && (
        <Modal
          title="Academic Alerts"
          subtitle={`${period.semester} · ${period.year}`}
          onClose={() => setModal(null)}
        >
          {modal.data.length ? (
            <div className="modal-alert-list">
              {modal.data.map((alert) => (
                <button
                  key={alert.key}
                  onClick={() => setModal({ type: "alert", data: alert })}
                >
                  <AlertTriangle size={16} />
                  <span>
                    <strong>{alert.title}</strong>
                    <small>
                      {alert.value} · {alert.reason}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="modal-empty">
              <Check size={22} />
              <strong>No active alerts</strong>
              <p>All indicators are within the proposed warning thresholds.</p>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

function DemoNotice() {
  return (
    <p className="demo-notice">
      <Info size={12} /> Illustrative Academic Data — For Case Study
      Demonstration Only
    </p>
  )
}

export default App
