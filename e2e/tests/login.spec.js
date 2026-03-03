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
  
  await page.getByLabel('Username').fill(process.env.RECRUITER_USERNAME);
  
  await page.getByLabel('Password').fill(process.env.RECRUITER_PASSWORD);
  
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText(process.env.RECRUITER_USERNAME)).toBeVisible();
  
  await expect(page).toHaveURL(/\/recruiter/);
  
  await expect(page.getByRole('button', { name: 'List All Applications' })).toBeVisible();
});

test('recruiter logout', async ({ page }) => {
  await page.goto('./');
  
  await page.getByLabel('Username').fill(process.env.RECRUITER_USERNAME);
  
  await page.getByLabel('Password').fill(process.env.RECRUITER_PASSWORD);
  
  await page.getByRole('button', { name: 'Login' }).click();
  
  await page.waitForURL(/\/recruiter/);
  
  await page.getByRole('button', { name: 'Logout' }).click();
  
  await expect(page).toHaveURL(/\/login/);
});

test('applicant login', async ({ page }) => {
  await page.goto('./');
  
  await page.getByLabel('Username').fill(process.env.APPLICANT_USERNAME);
  
  await page.getByLabel('Password').fill(process.env.APPLICANT_PASSWORD);
  
  await page.getByRole('button', { name: 'Login' }).click();
  
  await page.waitForURL(/\/applicant/);

  await expect(page.getByText(process.env.APPLICANT_USERNAME)).toBeVisible();
  
  await expect(page).toHaveURL(/\/applicant/);
  
  await expect(page.getByText('Applicant Portal')).toBeVisible();
});

test('applicant logout', async ({ page }) => {
  await page.goto('./');
  
  await page.getByLabel('Username').fill(process.env.APPLICANT_USERNAME);
  
  await page.getByLabel('Password').fill(process.env.APPLICANT_PASSWORD);
  
  await page.getByRole('button', { name: 'Login' }).click();
  
  await page.getByRole('button', { name: 'Logout' }).click();
  
  await expect(page).toHaveURL(/\/login/);
});