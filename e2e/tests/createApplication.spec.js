/**
 * File for testing use case 5.3 Apply for a Position.
 */
import { test, expect } from '@playwright/test';

test('applicant can submit an application', async ({ page }) => {
  await page.goto('./');
  
  // Login as applicant
  await page.getByLabel('Username').fill(process.env.APPLICANT_USERNAME);
  await page.getByLabel('Password').fill(process.env.APPLICANT_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Wait for page to load
  await page.waitForURL(/\/applicant/);
  
  // If an application already exists, delete it first
  const beginButton = page.getByRole('button', { name: 'Begin Application' });
  const deleteButton = page.getByRole('button', { name: 'Delete Existing Application' });

  if (await deleteButton.isVisible()) {
    await deleteButton.click();
    await page.getByRole('button', { name: 'Delete' }).click();
  }

  // Start new application
  await beginButton.click();

  // Step 1: Add expertise
  await page.getByLabel('Area').selectOption('ticket sales');
  await page.getByLabel('Years').fill('3');
  await page.getByRole('button', { name: '+ Add to List' }).click();
  await expect(page.getByText('ticket sales — 3 Years')).toBeVisible();
  await page.getByRole('button', { name: 'Next: Set Availability' }).click();

  // Step 2: Set availability
  await page.getByLabel('Available From').fill('2026-06-01');
  await page.getByLabel('Available Until').fill('2026-07-01');
  await page.getByRole('button', { name: 'Continue to Review' }).click();

  // Step 3: Review and submit
  await expect(page.getByText('ticket sales — 3 Years')).toBeVisible();
  await expect(page.getByText('2026-06-01 to 2026-07-01')).toBeVisible();
  await page.getByRole('button', { name: 'Submit Application' }).click();

  // Assert success
  await expect(page.getByText('Thank you for your submission!')).toBeVisible();

  // Cleanup: delete so next run starts fresh
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Delete Existing Application' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(beginButton).toBeVisible();
});