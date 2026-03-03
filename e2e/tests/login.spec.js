/**
 * File for testing use case 5.2 Login.
 */

import { test, expect } from '@playwright/test';

test('prompts login', async ({ page }) => {
  await page.goto('./');

  await expect(page).toHaveTitle(/frontend/);
});

test('recruiter login', async ({ page }) => {
  await page.goto('./');
  
  // Login as recruiter
  await page.getByLabel('Username').fill(process.env.RECRUITER_USERNAME);
  await page.getByLabel('Password').fill(process.env.RECRUITER_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Confirm username is in header, correct url and recruiter can list all applications
  await expect(page.getByText(process.env.RECRUITER_USERNAME)).toBeVisible();
  await expect(page).toHaveURL(/\/recruiter/);
  await expect(page.getByRole('button', { name: 'List All Applications' })).toBeVisible();
});

test('recruiter logout', async ({ page }) => {
  await page.goto('./');
  
  // Login as recruiter
  await page.getByLabel('Username').fill(process.env.RECRUITER_USERNAME);
  await page.getByLabel('Password').fill(process.env.RECRUITER_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Ensure page has loaded
  await page.waitForURL(/\/recruiter/);
  
  // Logout
  await page.getByRole('button', { name: 'Logout' }).click();
  
  // Confirm logout sends you to startpage
  await expect(page).toHaveURL(/\/login/);
});

test('applicant login', async ({ page }) => {
  await page.goto('./');
  
  // Login as applicant
  await page.getByLabel('Username').fill(process.env.APPLICANT_USERNAME);
  await page.getByLabel('Password').fill(process.env.APPLICANT_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Confirm username is in header, correct url and applicant can see applicant portal
  await expect(page.getByText(process.env.APPLICANT_USERNAME)).toBeVisible();
  await expect(page).toHaveURL(/\/applicant/);
  await expect(page.getByText('Applicant Portal')).toBeVisible();
});

test('applicant logout', async ({ page }) => {
  await page.goto('./');
  
  // Login as applicant
  await page.getByLabel('Username').fill(process.env.APPLICANT_USERNAME);
  await page.getByLabel('Password').fill(process.env.APPLICANT_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Ensure page has loaded
  await page.waitForURL(/\/applicant/);
  
  // Logout
  await page.getByRole('button', { name: 'Logout' }).click();
  
  // Confirm logout sends you to startpage
  await expect(page).toHaveURL(/\/login/);
});

test('failed login', async ({ page }) => {
  await page.goto('./');
  
  // Login attempt with incorrect credentials
  await page.getByLabel('Username').fill('wronguser');
  await page.getByLabel('Password').fill('wrongpassword');
  await page.getByRole('button', { name: 'Login' }).click();

  // Expect error message and to stay on login page
  // await expect(page.getByText('Login failed')).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});