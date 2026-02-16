/**
 * Container for applicant-only home view
 */
import { useState, useEffect } from 'react';
import ApplicantHomePage from '../presentation/pages/ApplicantHomePage';
import {
  submitApplication,
  getApplicationStatus,
  deleteApplication,
} from '../services/applicationService';

export default function ApplicantHomeContainer({ user }) {

  const ALL_AREAS = ['ticket sales', 'lotteries', 'roller coaster operation'];

  const initialAvailability = { startDate: '', endDate: '' };
  const [step, setStep] = useState(1); // 1: Start, 2: Expertise, 3: Availability, 4: Review, 5: Submitted, 6: Already Exists
  const [expertiseList, setExpertiseList] = useState([]);
  const [currentArea, setCurrentArea] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [availability, setAvailability] = useState(initialAvailability);

  // Application status state
  const [applicationStatus, setApplicationStatus] = useState({
    loading: true,
    hasApplication: false,
    error: null,
  });

  // Fetch application status on page load
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getApplicationStatus();

        setApplicationStatus({
          loading: false,
          hasApplication: status.hasApplication,
          error: null,
        });

        if (status.hasApplication) {
          setStep(6);
        }
      } catch (err) {
        setApplicationStatus({
          loading: false,
          hasApplication: false,
          error: err.message,
        });
      }
    };

    fetchStatus();
  }, []);

  // Delete existing application
  const handleDeleteApplication = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your existing application? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await deleteApplication();

      setApplicationStatus({
        loading: false,
        hasApplication: false,
        error: null,
      });

      reset();
    } catch (err) {
      alert(`Failed to delete application: ${err.message}`);
    }
  };

  // Filter out areas already added
  const availableAreas = ALL_AREAS.filter(
    (area) => !expertiseList.some((item) => item.area === area)
  );

  // Add expertise to list
  const handleAddExpertise = (e) => {
    e.preventDefault();
    if (!currentArea || experienceYears === '') return;
    setExpertiseList([...expertiseList, { area: currentArea, years: experienceYears }]);
    setCurrentArea('');
    setExperienceYears('');
  };

  // Reset all state
  const reset = () => {
    setStep(1);
    setExpertiseList([]);
    setCurrentArea('');
    setExperienceYears('');
    setAvailability(initialAvailability);
  };

  // Submit application 
  const handleSubmitApplication = async () => {
    try {
      await submitApplication({ expertiseList, availability });
      setStep(5);
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    }
  };

  return (
    <ApplicantHomePage
      user={user}
      step={step}
      setStep={setStep}
      expertiseList={expertiseList}
      setExpertiseList={setExpertiseList}
      currentArea={currentArea}
      setCurrentArea={setCurrentArea}
      experienceYears={experienceYears}
      setExperienceYears={setExperienceYears}
      availability={availability}
      setAvailability={setAvailability}
      applicationStatus={applicationStatus}
      availableAreas={availableAreas}
      handleAddExpertise={handleAddExpertise}
      handleDeleteApplication={handleDeleteApplication}
      handleSubmitApplication={handleSubmitApplication}
      reset={reset}
    />
  );
}