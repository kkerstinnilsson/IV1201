/**
 * @file applicationsService.test.js
 * @description Unit tests for applicationsService.
 *
 * These tests verify:
 * - getAllApplications(): returns list, error wrapping
 * - submitApplication(): success, duplicate application, unknown competence
 * - deleteApplication(): success, not found, error wrapping
 * - getApplicationStatus(): returns boolean, error wrapping
 */

jest.mock("../../models", () => ({
  sequelize: { transaction: jest.fn() },
}));

const mockDAO = {
  getAllApplicants: jest.fn(),
  hasApplication: jest.fn(),
  createApplication: jest.fn(),
  getCompetenceIdByName: jest.fn(),
  createCompetenceProfile: jest.fn(),
  createAvailability: jest.fn(),
  deleteApplication: jest.fn(),
};

jest.mock("../../src/integration/RecruitementDAO", () =>
  jest.fn().mockImplementation(() => mockDAO)
);

const { sequelize } = require("../../models");
const { AppError, ValidationError, NotFoundError } = require("../../src/business/errors/AppError");
const applicationsService = require("../../src/business/applicationsService");

describe("applicationsService", () => {
  beforeEach(() => {
    /** Resets call history between tests */
    jest.clearAllMocks();

    /**
     * Default: transaction executes the callback and returns its result.
     * We pass a fake transaction object to simulate the "t" argument.
     */
    sequelize.transaction.mockImplementation(async (cb) => cb({}));
  });

  test("getAllApplications: returns list", async () => {
    /**
     * Success:
     * - DAO returns a list of applicants
     * - service returns the list
     */
    mockDAO.getAllApplicants.mockResolvedValue([{ id: 1 }]);
    const res = await applicationsService.getAllApplications();
    expect(res).toEqual([{ id: 1 }]);
  });

  test("getAllApplications: wraps unexpected error into AppError(500)", async () => {
    /**
     * Error wrapping:
     * - DAO throws a regular Error
     * - service should wrap it into AppError(500) with message "Failed to fetch applications"
     */
    mockDAO.getAllApplicants.mockRejectedValue(new Error("db down"));
    await expect(applicationsService.getAllApplications()).rejects.toMatchObject({
      message: "Failed to fetch applications",
      statusCode: 500,
    });
  });

  test("submitApplication: success", async () => {
    /**
     * Success:
     * - user has no existing application
     * - competence is found in the database
     * - application, competence profile and availability are all created
     * - service returns { success: true }
     */
    mockDAO.hasApplication.mockResolvedValue(false);
    mockDAO.getCompetenceIdByName.mockResolvedValue(7);

    const res = await applicationsService.submitApplication(
      12,
      [{ area: "lotteries", years: 2 }],
      [{ startDate: "2026-01-01", endDate: "2026-02-01" }]
    );

    expect(mockDAO.createApplication).toHaveBeenCalledWith(12, expect.anything());
    expect(mockDAO.createCompetenceProfile).toHaveBeenCalledWith(12, 7, 2, expect.anything());
    expect(mockDAO.createAvailability).toHaveBeenCalledWith(
      12,
      { startDate: "2026-01-01", endDate: "2026-02-01" },
      expect.anything()
    );
    expect(res).toEqual({ success: true });
  });

  test("submitApplication: throws ValidationError if already exists", async () => {
    /**
     * Validation:
     * - user already has an existing application
     * - service should throw ValidationError(409)
     */
    mockDAO.hasApplication.mockResolvedValue(true);

    const err = await applicationsService.submitApplication(12, [], []).catch(e => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err).toMatchObject({ statusCode: 409 });
  });

  test("submitApplication: throws ValidationError if competence not found", async () => {
    /**
     * Validation:
     * - user has no existing application
     * - DAO returns null for the given competence name
     * - service should throw ValidationError before creating any competence profile
     */
    mockDAO.hasApplication.mockResolvedValue(false);
    mockDAO.getCompetenceIdByName.mockResolvedValue(null);

    await expect(applicationsService.submitApplication(12, [{ area: "Nope", years: 1 }], []))
      .rejects.toBeInstanceOf(ValidationError);
  });

  test("submitApplication: wraps unexpected error into AppError(500)", async () => {
    /**
     * Error wrapping:
     * - user has no existing application
     * - DAO throws a regular Error during application creation
     * - service should wrap the error into AppError(500)
     */
    mockDAO.hasApplication.mockResolvedValue(false);
    mockDAO.createApplication.mockRejectedValue(new Error("db down"));

    await expect(
        applicationsService.submitApplication(12, [{ area: "lotteries", years: 2 }], [])
    ).rejects.toMatchObject({
        message: "Failed to submit application",
        statusCode: 500,
    });
  });

  test("deleteApplication: success", async () => {
    /**
     * Success:
     * - application exists for the user
     * - DAO deletes it
     * - service returns { success: true }
     */
    mockDAO.hasApplication.mockResolvedValue(true);

    const res = await applicationsService.deleteApplication(12);

    expect(mockDAO.deleteApplication).toHaveBeenCalledWith(12, expect.anything());
    expect(res).toEqual({ success: true });
  });

  test("deleteApplication: throws NotFoundError when missing", async () => {
    /**
     * Not found:
     * - no application exists for the user
     * - service should throw NotFoundError before attempting deletion
     */
    mockDAO.hasApplication.mockResolvedValue(false);

    await expect(applicationsService.deleteApplication(12))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  test("deleteApplication: wraps unexpected error into AppError(500)", async () => {
    /**
     * Error wrapping:
     * - application exists for the user
     * - DAO throws a regular Error during deletion
     * - service should wrap the error into AppError(500)
     */
    mockDAO.hasApplication.mockResolvedValue(true);
    mockDAO.deleteApplication.mockRejectedValue(new Error("db down"));

    await expect(applicationsService.deleteApplication(12)).rejects.toMatchObject({
        message: "Failed to delete application",
        statusCode: 500,
    });
  });

  test("getApplicationStatus: returns boolean", async () => {
    /**
     * Success:
     * - DAO returns true for the given user
     * - service wraps the result in { hasApplication: boolean }
     */
    mockDAO.hasApplication.mockResolvedValue(true);
    const res = await applicationsService.getApplicationStatus(12);
    expect(res).toEqual({ hasApplication: true });
  });

  test("getApplicationStatus: wraps unexpected error into AppError(500)", async () => {
    /**
     * Error wrapping:
     * - DAO throws a regular Error when checking application status
     * - service should wrap it into AppError(500)
     */
    mockDAO.hasApplication.mockRejectedValue(new Error("db down"));

    await expect(applicationsService.getApplicationStatus(12)).rejects.toMatchObject({
        message: "Failed to retrieve application status",
        statusCode: 500,
    });
  });
});
