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

  return (
    <div>
      <header>
        <h1>Applicant Portal</h1>
        <p>Welcome Back {user.username}!</p>

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
        <div>
          <h2>Ready to submit your application?</h2>
          <button onClick={() => setStep(2)}>
            Begin Application
          </button>
        </div>
      )}

      {/* STEP 2- EXPERTISE */}
      {step === 2 && (
        <section>
          <h2>Step 1: Enter Your Expertise</h2>
          <form onSubmit={handleAddExpertise}>
            <div>
              <label>Area</label>
              <select 
                value={currentArea} 
                onChange={(e) => setCurrentArea(e.target.value)}
              >
                <option value="">Select Area...</option>
                {availableAreas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label>Years</label>
              <input 
                type="number" 
                value={experienceYears} 
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="0"
              />
            </div>
            <button type="submit">+ Add to List</button>
          </form>

          {expertiseList.length > 0 && (
            <div>
              <button onClick={() => setStep(3)}>Next: Set Availability</button>
            </div>
          )}

          {expertiseList.length > 0 && (
            <div>
              <h3>Current Expertise List</h3>
              <ul>
                {expertiseList.map((item, index) => (
                  <li key={index}>
                    {item.area} — {item.years} Years
                    <button onClick={() => {
                      setExpertiseList(expertiseList.filter((_, i) => i !== index));
                    }}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <button onClick={() => setStep(1)}>Back</button>
          </div>
        </section>
      )}

      {/* STEP 3- AVAILABILITY */}
      {step === 3 && (
        <section>
          <h2>Step 2: When are you available?</h2>
          <div>
            <p>Please provide the date range for your availability.</p>

            <div>
              <label>Available From</label>
              <input 
                type="date" 
                value={availability.startDate}
                onChange={(e) => setAvailability({...availability, startDate: e.target.value})}
              />
            </div>
            <div>
              <label>Available Until</label>
              <input 
                type="date" 
                value={availability.endDate}
                onChange={(e) => setAvailability({...availability, endDate: e.target.value})}
              />
            </div>

            <div>
              <button onClick={() => setStep(2)}>Back</button>
              <button 
                disabled={!availability.startDate || !availability.endDate}
                onClick={() => setStep(4)}
              >
                Continue to Review
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STEP 4- REVIEW */}
      {step === 4 && (
        <section>
          <h2>Confirm Application Details</h2>
          
          <div>
            <div>
              <h3>Availability</h3>
              <p>{availability.startDate} to {availability.endDate}</p>
            </div>
            
            <div>
              <h3>Skills</h3>
              <ul>
                {expertiseList.map((item, i) => (
                  <li key={i}>{item.area} — {item.years} Years</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <button onClick={() => setStep(3)}>Back</button>
            <button onClick={reset}>Cancel</button>
            <button onClick={handleSubmitApplication}>
              Submit Application
            </button>
          </div>
        </section>
      )}

      {/* STEP 5- THANK YOU */}
      {step === 5 && (
        <section>
          <h2>Thank you for your submission!</h2>
          <p>Your application has been successfully submitted.</p>
          <div>
            <button onClick={() => setStep(6)}>
              Continue
            </button>
          </div>
        </section>
      )}

      {/* STEP 6- APPLICATION ALREADY EXISTS */}
      {step === 6 && (
        <section>
          <h2>Application Already Submitted</h2>
          <p>
            You have already submitted an application.  
            Multiple applications are not allowed.
            You may delete your old application to reapply
          </p>

          <div>
            <button onClick={handleDeleteApplication}>
              Delete Existing Application
            </button>
          </div>
        </section>
      )}
    </div>
  );
}