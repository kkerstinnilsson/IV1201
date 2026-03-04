/**
 * @file ApplicantHomeContainer.jsx
 * @description Container component for the applicant home view.
 * Manages multi-step application flow, expertise/availability state,
 * and application status (submit, delete, check existing).
 */

import { useState, useEffect } from 'react';
import ApplicantHomePage from '../presentation/pages/ApplicantHomePage';
import { handleApiError } from "../utils/handleApiError";
import {
  submitApplication,
  getApplicationStatus,
  deleteApplication,
} from '../services/applicationService';


const ALL_AREAS = ['ticket sales', 'lotteries', 'roller coaster operation'];
const INITIAL_AVAILABILITY = { startDate: '', endDate: '' };

/**
 * Manages state and business logic for the applicant home page.
 *
 * Step flow:
 * - 1: Start
 * - 2: Expertise
 * - 3: Availability
 * - 4: Review
 * - 5: Submitted
 * - 6: Already Exists
 *
 * @param {Object} props
 * @param {{id: number, username: string, role: string}} props.user - The currently authenticated user.
 * @returns {JSX.Element}
 */
export default function ApplicantHomeContainer({ user }) {
  const [step, setStep] = useState(1);
  const [expertiseList, setExpertiseList] = useState([]);
  const [currentArea, setCurrentArea] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [availability, setAvailability] = useState(INITIAL_AVAILABILITY);
  const [actionError, setActionError] = useState(null); 
  const [applicationStatus, setApplicationStatus] = useState({
    loading: true,
    hasApplication: false,
    error: null,
  });


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
      } catch (error) {
        setApplicationStatus({
          loading: false,
          hasApplication: false,
          error: handleApiError(error, "Failed to fetch application status"),
        });
      }
    };

    fetchStatus();
  }, []);

  /**
   * Deletes the user's existing application and resets the form to step 1.
   *
   * @returns {Promise<void>}
   */
  const handleDeleteApplication = async () => {
    setActionError(null);
    try {
      await deleteApplication();
      setApplicationStatus({ loading: false, hasApplication: false, error: null });
      reset();
    } catch (error) {
      setActionError(handleApiError(error, "Failed to delete application"));
    }
  };

  /**
   * Submits the current expertise list and availability to the API.
   * Advances to step 5 on success.
   *
   * @returns {Promise<void>}
   */
  const handleSubmitApplication = async () => {
    setActionError(null);
    try {
      await submitApplication({ expertiseList, availability });
      setStep(5);
    } catch (error) {
      setActionError(handleApiError(error, "Submission failed"));
    }
  };

  /**
   * Adds a new expertise entry to the list if area and years are both set.
   *
   * @param {React.FormEvent} e - The form submit event.
   */
  const handleAddExpertise = (e) => {
    e.preventDefault();
    if (!currentArea || experienceYears === '') return;
    setExpertiseList([...expertiseList, { area: currentArea, years: experienceYears }]);
    setCurrentArea('');
    setExperienceYears('');
  };

 
  const reset = () => {
    setStep(1);
    setExpertiseList([]);
    setCurrentArea('');
    setExperienceYears('');
    setAvailability(INITIAL_AVAILABILITY);
  };


  const availableAreas = ALL_AREAS.filter(
    (area) => !expertiseList.some((item) => item.area === area)
  );

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
      actionError={actionError}
    />
  );
}