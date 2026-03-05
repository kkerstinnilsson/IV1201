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
import { expertiseItemSchema, availabilitySchema } from "../validation/applicationSchemas";

// helper that convers zod error to a { fieldName: message } object for UI
function zodToFieldErrors(zodError) {
  const fieldErrors = {};

  zodError.issues.forEach((issue) => {
    const field = issue.path[0];

    if (!fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  });

  return fieldErrors;
}

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

  const [errors, setErrors] = useState({
    expertise: {},
    availability: {},
    submit: null,
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

    try {
      await deleteApplication();
      setApplicationStatus({
        loading: false,
        hasApplication: false,
        error: null,
      });
      reset();
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message }));
    }
  };

  // Filter out areas already added
  const availableAreas = ALL_AREAS.filter(
    (area) => !expertiseList.some((item) => item.area === area)
  );

  // Add expertise to list
  const handleAddExpertise = (e) => {
    e.preventDefault();
     setErrors((prev) => ({ ...prev, expertise: {}, submit: null }));

    const parsed = expertiseItemSchema.safeParse({
      area: currentArea,
      years: experienceYears,
    });

    if (!parsed.success) {
      setErrors((prev) => ({ ...prev, expertise: zodToFieldErrors(parsed.error) }));
      return;
    }

    setExpertiseList([...expertiseList, parsed.data]);
    setCurrentArea('');
    setExperienceYears('');
  };

  const goToReview = () => {
    setErrors((prev) => ({ ...prev, availability: {}, submit: null }));

    const parsed = availabilitySchema.safeParse(availability);
    if (!parsed.success) {
      setErrors((prev) => ({ ...prev, availability: zodToFieldErrors(parsed.error) }));
      return;
    }
    setStep(4);
  };

  // Reset all state
  const reset = () => {
    setStep(1);
    setExpertiseList([]);
    setCurrentArea('');
    setExperienceYears('');
    setAvailability(initialAvailability);
    setErrors({ expertise: {}, availability: {}, submit: null });
  };

  // Submit application 
  const handleSubmitApplication = async () => {
  setErrors((prev) => ({ ...prev, submit: null }));

  try {
    await submitApplication({expertiseList, availability});
    setStep(5);
  } catch (err) {
    setErrors((prev) => ({ ...prev, submit: err.message }));
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
      errors={errors}
      goToReview={goToReview}

    />
  );
}