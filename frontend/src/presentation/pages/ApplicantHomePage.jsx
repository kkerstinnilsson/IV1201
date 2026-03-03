/**
* Presentation component for the applicant home page.
 *
 * @param {Object} user - Authenticated user object
 * @param {number} step - Current step in the application flow
 * @param {(step: number) => void} setStep - Updates the current step
 * @param {Array<{area: string, years: string}>} expertiseList - List of added expertise entries
 * @param {(list: Array) => void} setExpertiseList - Updates expertise list
 *
 * @param {string} currentArea - Currently selected expertise area
 * @param {(value: string) => void} setCurrentArea - Updates selected area
 *
 * @param {string} experienceYears - Years of experience for selected area
 * @param {(value: string) => void} setExperienceYears - Updates years input
 *
 * @param {{startDate: string, endDate: string}} availability - Selected availability range
 * @param {(availability: Object) => void} setAvailability - Updates availability dates
 *
 * @param {{loading: boolean, hasApplication: boolean, error: string|null}} applicationStatus
 *        - Current application status metadata
 *
 * @param {Array<string>} availableAreas - Filtered list of expertise areas not yet added
 *
 * @param {(e: React.FormEvent) => void} handleAddExpertise - Adds expertise entry
 * @param {() => void} handleDeleteApplication - Deletes existing application
 * @param {() => void} handleSubmitApplication - Submits application
 * @param {() => void} reset - Resets the application flow state
 */

import { useState } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import Modal from '../components/Modal';

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back"
      className="rounded p-2 hover:bg-gray-100 transition"
    >
      <HiArrowLeft className="h-5 w-5" />
    </button>
  );
}

export default function ApplicantHomePage({
  user,
  step,
  setStep,
  expertiseList,
  setExpertiseList,
  currentArea,
  setCurrentArea,
  experienceYears,
  setExperienceYears,
  availability,
  setAvailability,
  applicationStatus,
  availableAreas,
  handleAddExpertise,
  handleDeleteApplication,
  handleSubmitApplication,
  reset,
}) {

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  return (
    <div>
      <div className="container space-y-6">
      <header className="space-y-1">
        <h1>Applicant Portal</h1>
        <p className="text-gray-700 mt-4">Here you can submit your application to work at the amusement park. The process will guide you through a few simple steps where you add your
            skills and availability. You can review everything before submitting.</p>
    

        {/* APPLICATION STATUS 
        <p>
          Status:{' '}
          {applicationStatus.loading && 'Checking application status...'}
          {!applicationStatus.loading && applicationStatus.hasApplication && 'Application already submitted'}
          {!applicationStatus.loading && !applicationStatus.hasApplication && 'No application submitted'}
          {applicationStatus.error && 'Unable to determine status'}
        </p>
        */}
      </header>

      {/* STEP 1- WELCOME */}
      {step === 1 && (
        <div className="space-y-4 flex justify-end pt-6">
          <button className="btn-primary" onClick={() => setStep(2)}>
            Begin Application
          </button>
        </div>
      )}

      {/* STEP 2- EXPERTISE */}
      {step === 2 && (
        <section>
         <div className="flex items-center justify-between">
          <h2>Step 1: Enter Your Expertise</h2>
          <BackButton onClick={() => setStep(1)} />
          </div>
          <form onSubmit={handleAddExpertise} className="grid gap-4 sm:grid-cols-3 items-end">
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="area">Area</label>
              <select 
                id="area"
                value={currentArea} 
                onChange={(e) => setCurrentArea(e.target.value)}
              >
                <option value="">Select Area...</option>
                {availableAreas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="years">Years</label>
              <input 
                id="years"
                type="number" 
                value={experienceYears} 
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="0"
              />
            </div>
            <button type="submit" className="btn-secondary w-fit mt-4 col-start-3 justify-self-end">+ Add to List</button>
          </form>

          {expertiseList.length > 0 && (
            <div className="space-y-2">
              <h3>Current Expertise List</h3>
              <ul>
                {expertiseList.map((item, index) => (
                  <li key={index} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2">
                    <span className="text-sm">
                      {item.area} — {item.years} Years
                    </span>
                    <button type="button" className="btn-danger" onClick={() => {
                      setExpertiseList(expertiseList.filter((_, i) => i !== index));
                    }}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {expertiseList.length > 0 && (
            <div className="flex justify-end pt-6">
              <button
              className="btn-primary"
              onClick={() => setStep(3)}
              >
              Next: Set Availability
              </button>
            </div>
          )}
        </section>
      )}

      {/* STEP 3- AVAILABILITY */}
      {step === 3 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
          <h2>Step 2: When are you available?</h2>
          <BackButton onClick={() => setStep(2)} />
          </div>
            <p className="text-sm text-gray-700">Please provide the date range for your availability.</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">

              <label htmlFor="availableFrom">Available From</label>
              <input 
                id="availableFrom"
                type="date" 
                value={availability.startDate}
                onChange={(e) => setAvailability({...availability, startDate: e.target.value})}
              />
              
            </div>
            <div className="space-y-1">
              <label htmlFor="availableUntil">Available Until</label>
              <input 
                id="availableTo"
                type="date" 
                value={availability.endDate}
                onChange={(e) => setAvailability({...availability, endDate: e.target.value})}
              />
            </div>
            </div>

            <div className="flex justify-end pt-6">
              <button 
                className="btn-primary"
                disabled={!availability.startDate || !availability.endDate}
                onClick={() => setStep(4)}
              >
                Continue to Review
              </button>
            </div>
        </section>
      )}

      {/* STEP 4- REVIEW */}
      {step === 4 && (
        <section className="space-y-4">
           <div className="flex items-center justify-between">
              <h2>Confirm Application Details</h2>
              <BackButton onClick={() => setStep(3)} />
            </div>
          
          <div className="grid gap-4 sm:grid-cols-2"> 
            <div className="rounded border border-gray-200 p-4">
              <h3>Availability</h3>
              <p className="text-sm text-gray-700 mt-1">{availability.startDate} to {availability.endDate}</p>
            </div>
            
            <div className="rounded border border-gray-200 p-4">
              <h3>Skills</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                {expertiseList.map((item, i) => (
                  <li key={i}>{item.area} — {item.years} Years</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-6 flex-wrap gap-3">
            <button className="btn-danger" onClick={() => setShowCancelModal(true)}>
              Cancel
            </button> 
            <button className="btn-primary" onClick={handleSubmitApplication}>
              Submit Application
            </button>
          </div>
        </section>
        
      )}

      {/* STEP 5- THANK YOU */}
      {step === 5 && (
        <section className="space-y-3">
          <h2>Thank you for your submission!</h2>
          <p className="text-sm text-gray-700">Your application has been successfully submitted.</p>
          <div>
            <div className="flex justify-end pt-6">
            <button className="btn-primary w-fit" onClick={() => setStep(6)}>
              Continue
            </button>
          </div>
          </div>
        </section>
      )}

      {/* STEP 6- APPLICATION ALREADY EXISTS */}
      {step === 6 && (
        <section className="space-y-4">
          <h2>Application Already Submitted</h2>
          <p className="text-sm text-gray-700">
            You have already submitted an application.  
            Multiple applications are not allowed.
            You may delete your old application to reapply.
          </p>

          <div>
            <div className="flex justify-end pt-6">
            <button className="btn-danger w-fit"  onClick={() => setShowDeleteModal(true)}>
              Delete Existing Application
            </button>
          </div>
         </div>
        </section>
      )} 
        
        {/* Modals */}
        <Modal
          open={showCancelModal}
          title="Are you sure you want to cancel?"
          onClose={() => setShowCancelModal(false)}
          footer={
            <>
              <button
                className="btn-secondary"
                type="button"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Editing
              </button>

              <button
                className="btn-danger"
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  reset();
                }}
              >
                Cancel
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-700">
            Your entered information will be cleared and you will return to the
            start.
          </p>
        </Modal>

        <Modal
          open={showDeleteModal}
          title="Are you sure you want to delete this application?"
          onClose={() => setShowDeleteModal(false)}
          footer={
            <>
              <button
                className="btn-secondary"
                type="button"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn-danger"
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  handleDeleteApplication();
                }}
              >
                Delete
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-700">
            This will permanently delete your existing application. You can submit
            a new application afterwards.
          </p>
        </Modal>
      </div>
    </div>
  );
}