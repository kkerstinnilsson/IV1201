/**
 * File for testing use case 5.4 List All Applications.
 */
import { test, expect } from '@playwright/test';

test('recruiter can list all applications', async ({ page }) => {
  await page.goto('./');
  await page.getByLabel('Username').fill(process.env.RECRUITER_USERNAME);
  await page.getByLabel('Password').fill(process.env.RECRUITER_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/\/recruiter/);

  // List applications
  await page.getByRole('button', { name: 'List All Applications' }).click();

  // Assert the applications table/list is visible
  await expect(page).toHaveURL(/\/recruiter/);
  await expect(page.getByText('Full Name')).toBeVisible();
  await expect(page.getByText('Status')).toBeVisible();
});