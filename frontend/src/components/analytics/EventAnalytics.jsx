import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = [
  '#6366f1',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
];

const EventAnalytics = ({ registrations = [] }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  /* ─────────────────────────────────────────────
     FILTER REGISTRATIONS BY EVENT DATE
  ───────────────────────────────────────────── */
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((registration) => {
      const eventDate = registration.eventDate;

      if (!eventDate) return false;

      if (startDate && eventDate < startDate) {
        return false;
      }

      if (endDate && eventDate > endDate) {
        return false;
      }

      return true;
    });
  }, [registrations, startDate, endDate]);

  /* ─────────────────────────────────────────────
     STATISTICS
  ───────────────────────────────────────────── */
  const statistics = useMemo(() => {
    const totalRegistrations = filteredRegistrations.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingRegistrations = filteredRegistrations.filter(
      (registration) => {
        if (!registration.eventDate) return false;

        const eventDate = new Date(
          `${registration.eventDate}T00:00:00`
        );

        return eventDate >= today;
      }
    ).length;

    const eventTypes = new Set(
      filteredRegistrations
        .map((registration) => registration.eventType)
        .filter(Boolean)
    ).size;

    const departments = new Set(
      filteredRegistrations
        .map((registration) => registration.department)
        .filter(Boolean)
    ).size;

    return {
      totalRegistrations,
      upcomingRegistrations,
      eventTypes,
      departments,
    };
  }, [filteredRegistrations]);

  /* ─────────────────────────────────────────────
     BAR CHART
     Registrations by Event Type
  ───────────────────────────────────────────── */
  const barData = useMemo(() => {
    const counts = {};

    filteredRegistrations.forEach((registration) => {
      const type = registration.eventType || 'Unknown';

      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts).map(([name, registrations]) => ({
      name,
      registrations,
    }));
  }, [filteredRegistrations]);

  /* ─────────────────────────────────────────────
     LINE CHART
     Registrations over time
  ───────────────────────────────────────────── */
  const lineData = useMemo(() => {
    const counts = {};

    filteredRegistrations.forEach((registration) => {
      if (!registration.eventDate) return;

      const date = registration.eventDate;

      counts[date] = (counts[date] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, registrations]) => ({
        date,
        registrations,
      }));
  }, [filteredRegistrations]);

  /* ─────────────────────────────────────────────
     PIE / DONUT CHART
     Registrations by Department
  ───────────────────────────────────────────── */
  const pieData = useMemo(() => {
    const counts = {};

    filteredRegistrations.forEach((registration) => {
      const department = registration.department || 'Unknown';

      counts[department] = (counts[department] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredRegistrations]);

  /* ─────────────────────────────────────────────
     CLEAR FILTER
  ───────────────────────────────────────────── */
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const hasFilter = startDate || endDate;

  return (
    <section className="analytics-section">
      {/* HEADER */}
      <div className="analytics-header">
        <div>
          <h2>Event Analytics</h2>
          <p>
            Overview of event registrations and activity
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div className="analytics-filter-card">
        <div className="filter-group">
          <label htmlFor="analytics-start-date">
            From
          </label>

          <input
            id="analytics-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="analytics-end-date">
            To
          </label>

          <input
            id="analytics-end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {hasFilter && (
          <button
            type="button"
            className="analytics-clear-btn"
            onClick={clearFilters}
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {filteredRegistrations.length === 0 ? (
        <div className="analytics-empty-state">
          <div className="analytics-empty-icon">📊</div>

          <h3>
            {registrations.length === 0
              ? 'No registration data available'
              : 'No registrations found'}
          </h3>

          <p>
            {registrations.length === 0
              ? 'Register for an event to see analytics here.'
              : 'Try changing the selected date range.'}
          </p>

          {registrations.length > 0 && hasFilter && (
            <button
              type="button"
              className="analytics-clear-btn"
              onClick={clearFilters}
            >
              Clear Filter
            </button>
          )}
        </div>
      ) : (
        <>
          {/* STAT CARDS */}
          <div className="analytics-stat-grid">
            <div className="analytics-stat-card">
              <span className="analytics-stat-label">
                Total Registrations
              </span>

              <strong
  className="analytics-stat-value"
  data-testid="total-registrations"
>
  {statistics.totalRegistrations}
            </strong>
            </div>
            <div className="analytics-stat-card">
              <span className="analytics-stat-label">
                Upcoming Events
              </span>

              <strong className="analytics-stat-value">
                {statistics.upcomingRegistrations}
              </strong>
            </div>

            <div className="analytics-stat-card">
              <span className="analytics-stat-label">
                Event Types
              </span>

              <strong className="analytics-stat-value">
                {statistics.eventTypes}
              </strong>
            </div>

            <div className="analytics-stat-card">
              <span className="analytics-stat-label">
                Departments
              </span>

              <strong className="analytics-stat-value">
                {statistics.departments}
              </strong>
            </div>
          </div>

          {/* CHARTS */}
          <div className="analytics-chart-grid">

            {/* BAR CHART */}
            <div className="analytics-chart-card">
              <div className="analytics-chart-header">
                <h3>Registrations by Event Type</h3>
                <p>Number of students registered for each event type</p>
              </div>

              <div className="analytics-chart">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={barData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.08)"
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fill: '#94a3b8',
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: '#94a3b8',
                        fontSize: 12,
                      }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="registrations"
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DONUT CHART */}
            <div className="analytics-chart-card">
              <div className="analytics-chart-header">
                <h3>Registrations by Department</h3>
                <p>Distribution of registrations across departments</p>
              </div>

              <div className="analytics-chart">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />

                    <Legend
                      wrapperStyle={{
                        color: '#94a3b8',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* LINE CHART */}
            <div className="analytics-chart-card analytics-chart-wide">
              <div className="analytics-chart-header">
                <h3>Registration Trends Over Time</h3>
                <p>
                  Number of registrations for each event date
                </p>
              </div>

              <div className="analytics-chart">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart
                    data={lineData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.08)"
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fill: '#94a3b8',
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: '#94a3b8',
                        fontSize: 12,
                      }}
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="registrations"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: '#06b6d4',
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default EventAnalytics;