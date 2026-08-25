import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRegistration } from '../context/RegistrationContext';
import FileUpload from '../components/FileUpload';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import EventAnalytics from '../components/analytics/EventAnalytics';

const API_URL = import.meta.env.VITE_API_URL || '';

/* ─── Initial form shape ─────────────────────────────────────────────────── */
const makeBlankForm = (user) => ({
  fullName: user?.fullName || '',
  email: user?.email || '',
  phone: '',
  studentId: '',
  department: '',
  eventType: '',
  eventDate: '',
});

/* ─── Field validation helper ────────────────────────────────────────────── */
const validateField = (name, value) => {
  switch (name) {
    case 'fullName':
      return !value || value.trim().length < 3
        ? 'Full Name is required and must be at least 3 characters.'
        : '';
    case 'email': {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      return !value || !ok ? 'Please enter a valid email address.' : '';
    }
    case 'phone':
      return !value || !/^03\d{9}$/.test(value)
        ? 'Phone number must be exactly 11 digits in Pakistani format (e.g. 03001234567).'
        : '';
    case 'studentId':
      return !value || value.trim() === '' ? 'Student ID is required.' : '';
    case 'department':
      return !value ? 'Department is required.' : '';
    case 'eventType':
      return !value ? 'Event Type is required.' : '';
    case 'eventDate': {
      if (!value) return 'Event Date is required.';
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate < today ? 'Event Date cannot be in the past.' : '';
    }
    default:
      return '';
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   Dashboard component
   ═══════════════════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  /* ── Context: auth (Feature 1 — no prop-drilling) ── */
  const { user } = useAuth();

  /* ── Context: registrations (Feature 2 — no prop-drilling) ── */
  const {
    registrations,
    loading: loadingRegs,
    error: regsError,
    uploadProgress,
    fetchRegistrations,
    addRegistration,
  } = useRegistration();

  /* ── Local form state ── */
  const [formData, setFormData] = useState(makeBlankForm(user));
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  /* ── Success state: show uploaded image from backend after registration ── */
  const [successEntry, setSuccessEntry] = useState(null);

  /* ── Fetch on mount (token is already in context, no prop needed) ── */
  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Toast helper ── */
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Field change handler ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const err = validateField(name, value);
    setErrors((prev) => {
      const next = { ...prev };
      err ? (next[name] = err) : delete next[name];
      return next;
    });
  };

  /* ── File selected from FileUpload component ── */
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (file) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.profileImage;
        return next;
      });
    } else {
      setErrors((prev) => ({
        ...prev,
        profileImage: 'Please select an image.',
      }));
    }
  };

  /* ── Form submission ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    /* Full validation pass */
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    if (!selectedFile) {
      newErrors.profileImage = 'Please select an image.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('error', 'Please correct the highlighted errors before submitting.');
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    Object.keys(formData).forEach((key) => fd.append(key, formData[key]));
    fd.append('profileImage', selectedFile);

    const result = await addRegistration(fd);

    if (result.success) {
      /* Show success panel with the backend-served image URL */
      setSuccessEntry(result.data);
      showToast('success', 'Student registered successfully!');
      setFormData(makeBlankForm(user));
      setSelectedFile(null);
      setErrors({});
    } else {
      if (result.errors) setErrors(result.errors);
      const msg =
        result.errors?.profileImage ||
        result.message ||
        'Something went wrong. Please try again.';
      showToast('error', msg);
    }

    setSubmitting(false);
  };

  /* ── Dismiss success panel and register another ── */
  const handleRegisterAnother = () => {
    setSuccessEntry(null);
  };

  /* ═══════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="dashboard-wrapper">
      <EventAnalytics registrations={registrations} />
      <div className="dashboard-grid">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <div className="dashboard-sidebar">

          {/* Student Profile card — reads from AuthContext directly */}
          <div className="dashboard-card profile-card-details">
            <h3>Student Profile</h3>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Name</span>
              <span className="profile-detail-value">{user?.fullName}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Email Address</span>
              <span className="profile-detail-value">{user?.email}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Auth Status</span>
              <span className="profile-detail-value auth-badge">Authenticated</span>
            </div>
          </div>

          {/* Registered Events list — reads from RegistrationContext directly */}
          <div className="dashboard-card registrations-card">
            <div className="card-header">
              <h3>Registered Events</h3>
              <button
                onClick={fetchRegistrations}
                className="btn-refresh"
                title="Refresh list"
                disabled={loadingRegs}
              >
                <svg
                  className={loadingRegs ? 'spin' : ''}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H18"
                  />
                </svg>
              </button>
            </div>

            {/* ── LOADING ── */}
            {loadingRegs && <SkeletonLoader count={2} />}

            {/* ── ERROR ── */}
            {!loadingRegs && regsError && (
              <ErrorMessage message={regsError} onRetry={fetchRegistrations} />
            )}

            {/* ── EMPTY ── */}
            {!loadingRegs && !regsError && registrations.length === 0 && (
              <EmptyState
                title="No registrations yet"
                description="You have not registered for any events yet. Fill out the registration form to join an event."
              />
            )}

            {/* ── SUCCESS — list of registrations ── */}
            {!loadingRegs && !regsError && registrations.length > 0 && (
              <div className="registrations-list">
                {registrations.map((reg) => (
                  <div key={reg.id} className="registration-item">
                    <div className="reg-item-img-wrapper">
                      <img
                        src={reg.imageUrl}
                        alt={`Uploaded image for ${reg.fullName}`}
                        className="reg-item-img"
                        onError={(e) => {
                          e.target.style.opacity = '0.3';
                        }}
                      />
                    </div>
                    <div className="reg-item-content">
                      <h4 className="reg-item-title">{reg.eventType}</h4>
                      <p className="reg-item-date">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(reg.eventDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="reg-item-details">
                        {reg.fullName} ({reg.studentId}) &bull; {reg.department}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT — REGISTRATION FORM ─────────────────────────────────────── */}
        <div className="dashboard-content">
          <div className="form-card">

            {/* ══════════════════════════════════════════════════════════════
                SUCCESS STATE — shown after a successful registration
                Displays the uploaded image from the backend /uploads/ URL.
                ══════════════════════════════════════════════════════════════ */}
            {successEntry ? (
              <div className="success-panel">
                <div className="success-checkmark">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="success-title">Student Registered!</h2>
                <p className="success-subtitle">
                  Registration submitted successfully.
                </p>

                {/* Uploaded image served from backend /uploads/ */}
                <div className="success-image-wrapper">
                  <img
                    src={successEntry.imageUrl}
                    alt={`Uploaded profile for ${successEntry.fullName}`}
                    className="success-image"
                  />
                  <div className="success-image-caption">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Profile image uploaded successfully
                  </div>
                </div>

                {/* Registration details summary */}
                <div className="success-details">
                  <div className="success-detail-row">
                    <span>Name</span>
                    <strong>{successEntry.fullName}</strong>
                  </div>
                  <div className="success-detail-row">
                    <span>Student ID</span>
                    <strong>{successEntry.studentId}</strong>
                  </div>
                  <div className="success-detail-row">
                    <span>Department</span>
                    <strong>{successEntry.department}</strong>
                  </div>
                  <div className="success-detail-row">
                    <span>Event</span>
                    <strong>{successEntry.eventType}</strong>
                  </div>
                  <div className="success-detail-row">
                    <span>Date</span>
                    <strong>
                      {new Date(successEntry.eventDate).toLocaleDateString(
                        undefined,
                        { year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-submit"
                  onClick={handleRegisterAnother}
                  style={{ marginTop: '1.5rem' }}
                >
                  Register Another Student
                </button>
              </div>
            ) : (
              /* ══════════════════════════════════════════════════════════════
                 FORM STATE — registration form
                 ══════════════════════════════════════════════════════════════ */
              <>
                <div className="form-header" style={{ marginBottom: '1.5rem' }}>
                  <h2>New Event Registration</h2>
                  <p>Register for upcoming student events and activities</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-grid">

                    {/* Full Name */}
                    <div className="form-group full-width">
                      <label htmlFor="fullName" className="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`form-control${errors.fullName ? ' input-error' : ''}`}
                        disabled={submitting}
                      />
                      {errors.fullName && (
                        <div className="invalid-feedback">{errors.fullName}</div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john.doe@example.com"
                        className={`form-control${errors.email ? ' input-error' : ''}`}
                        disabled={submitting}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="03001234567"
                        className={`form-control${errors.phone ? ' input-error' : ''}`}
                        disabled={submitting}
                      />
                      {errors.phone && (
                        <div className="invalid-feedback">{errors.phone}</div>
                      )}
                    </div>

                    {/* Student ID */}
                    <div className="form-group">
                      <label htmlFor="studentId" className="form-label">
                        Student ID
                      </label>
                      <input
                        type="text"
                        id="studentId"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        placeholder="FA21-BCS-000"
                        className={`form-control${errors.studentId ? ' input-error' : ''}`}
                        disabled={submitting}
                      />
                      {errors.studentId && (
                        <div className="invalid-feedback">{errors.studentId}</div>
                      )}
                    </div>

                    {/* Department */}
                    <div className="form-group">
                      <label htmlFor="department" className="form-label">
                        Department
                      </label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className={`form-control${errors.department ? ' input-error' : ''}`}
                        disabled={submitting}
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Business Administration">Business Administration</option>
                        <option value="Social Sciences">Social Sciences</option>
                      </select>
                      {errors.department && (
                        <div className="invalid-feedback">{errors.department}</div>
                      )}
                    </div>

                    {/* Event Type */}
                    <div className="form-group">
                      <label htmlFor="eventType" className="form-label">
                        Event Type
                      </label>
                      <select
                        id="eventType"
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleChange}
                        className={`form-control${errors.eventType ? ' input-error' : ''}`}
                        disabled={submitting}
                      >
                        <option value="">Select Event Type</option>
                        <option value="Technical Symposium">Technical Symposium</option>
                        <option value="Sports Gala">Sports Gala</option>
                        <option value="Cultural Night">Cultural Night</option>
                        <option value="Career Fair">Career Fair</option>
                        <option value="Seminar">Seminar</option>
                      </select>
                      {errors.eventType && (
                        <div className="invalid-feedback">{errors.eventType}</div>
                      )}
                    </div>

                    {/* Event Date */}
                    <div className="form-group">
                      <label htmlFor="eventDate" className="form-label">
                        Event Date
                      </label>
                      <input
                        type="date"
                        id="eventDate"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleChange}
                        className={`form-control${errors.eventDate ? ' input-error' : ''}`}
                        disabled={submitting}
                      />
                      {errors.eventDate && (
                        <div className="invalid-feedback">{errors.eventDate}</div>
                      )}
                    </div>

                    {/* Profile Image — uses the new FileUpload component */}
                    <div className="form-group full-width">
                      <label className="form-label">
                        Profile Picture / Student Card
                      </label>
                      <FileUpload
                        onFileSelect={handleFileSelect}
                        error={errors.profileImage}
                        disabled={submitting}
                      />
                      {submitting && uploadProgress > 0 && (
  <div className="upload-progress-container">
    <div className="upload-progress-header">
      <span>Uploading image...</span>
      <span>{uploadProgress}%</span>
    </div>

    <div className="upload-progress-bar">
      <div
        className="upload-progress-fill"
        style={{ width: `${uploadProgress}%` }}
      />
    </div>
  </div>
)}

                    </div>
                  </div>

                  {/* Submit button — disabled + spinner while submitting */}
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn-submit"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner" />
                          Registering Student...
                        </>
                      ) : (
                        'Submit Registration'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast notifications ─────────────────────────────────────────── */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? (
              <svg className="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div className="toast-message">{toast.message}</div>
            <button onClick={() => setToast(null)} className="toast-close">
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
