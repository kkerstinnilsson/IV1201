/**
 * File for testing use case 5.1 Create Account.
 */
import { test, expect, request } from '@playwright/test';

const TEST_USERNAME = 'testcreateaccount';
const BACKEND_URL = 'http://16.171.147.183:3000';

async function deleteAccount() {
  const context = await request.newContext();
  await context.delete(
    `${BACKEND_URL}/test/delete-account?username=${TEST_USERNAME}`,
    { headers: { 'x-test-secret': process.env.TEST_SECRET } },
  );
  await context.dispose();
}

test.beforeEach(async () => {
  await deleteAccount();
});

test.afterEach(async () => {
  await deleteAccount();
});

test('create account successfully', async ({ page }) => {
  await page.goto('./register');

  await page.getByLabel('Name').fill('Test');
  await page.getByLabel('Surname').fill('User');
  await page.getByLabel('Email').fill('testcreateaccount@test.com');
  await page.getByLabel('Personal Number').fill('199001010000');
  await page.getByLabel('Username').fill(TEST_USERNAME);
  await page.getByLabel('Password').fill('testpass123');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).getByText('Account created successfully.').toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('create account with missing fields shows error', async ({ page }) => {
  await page.goto('./register');

  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).getByText('Please enter your name').toBeVisible();
  await expect(page).getByText('Please enter your surname').toBeVisible();
  await expect(page).getByText('Please enter an email address').toBeVisible();
  await expect(page).getByText('Please enter your personal number').toBeVisible();
  await expect(page).getByText('Please enter a username').toBeVisible();
  await expect(page).getByText('Please enter a password').toBeVisible();
  await expect(page).toHaveURL(/\/register/);
});

test('create account with duplicate username shows error', async ({ page }) => {
  await page.goto('./register');

  await page.getByLabel('Name').fill('Test');
  await page.getByLabel('Surname').fill('User');
  await page.getByLabel('Email').fill('testcreateaccount@test.com');
  await page.getByLabel('Personal Number').fill('199001010000');
  await page.getByLabel('Username').fill(process.env.APPLICANT_USERNAME);
  await page.getByLabel('Password').fill('testpass123');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).getByText('Username already exists').toBeVisible();
  await expect(page).toHaveURL(/\/register/);
});