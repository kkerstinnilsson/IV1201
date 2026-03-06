/**
 * File for testing magic link (claim existing account) flow.
 */
import { test, expect, request } from '@playwright/test';
test.describe.configure({ mode: 'serial' });
const TEST_USERNAME = 'testmagiclink';
const TEST_EMAIL = 'mbarr@finnsinte.se';
const BACKEND_URL = 'http://16.171.147.183:3000';
async function deleteCredentials() {
  const context = await request.newContext();
  await context.delete(
    `${BACKEND_URL}/test/delete-credentials?username=${TEST_USERNAME}`,
    { headers: { 'x-test-secret': process.env.TEST_SECRET } },
  );
  await context.dispose();
}
test.beforeEach(async () => {
  await deleteCredentials();
});
test.afterEach(async () => {
  await deleteCredentials();
});
test('request magic link shows confirmation message', async ({ page }) => {
  await page.goto('./claim/request');
  await page.getByLabel('Email').fill(TEST_EMAIL);
  await page.getByRole('button', { name: 'Send link' }).click();
  await expect(page.getByText('If an account exists for this email address, you will receive a link to set your username and password.')).toBeVisible();
});
test('claim account with magic link', async ({ page }) => {
  const context = await request.newContext();
  const response = await context.post(
    `${BACKEND_URL}/auth/account-token/request`,
    { data: { email: TEST_EMAIL } },
  );
  const body = await response.json();
  const { link } = body.data;
  await context.dispose();
  await page.goto(link);
  await page.getByLabel('Username').fill(TEST_USERNAME);
  await page.getByLabel('Password').fill('testpass123');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForURL(/\/login/, { timeout: 15000 });
  await expect(page).toHaveURL(/\/login/);
});
test('claim account then login with new credentials', async ({ page }) => {
  const context = await request.newContext();
  const response = await context.post(
    `${BACKEND_URL}/auth/account-token/request`,
    { data: { email: TEST_EMAIL } },
  );
  const body = await response.json();
  const { link } = body.data;
  await context.dispose();
  await page.goto(link);
  await page.getByLabel('Username').fill(TEST_USERNAME);
  await page.getByLabel('Password').fill('testpass123');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForURL(/\/login/, { timeout: 15000 });
  
  await page.getByRole('button', { name: 'Login' }).waitFor({ state: 'visible' });
  await page.getByLabel('Username').fill(TEST_USERNAME);
  await page.getByLabel('Password').fill('testpass123');

  await expect(page.getByLabel('Username')).toHaveValue(TEST_USERNAME);
  await expect(page.getByLabel('Password')).toHaveValue('testpass123');

  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/\/applicant/, { timeout: 15000 });
  await expect(page).toHaveURL(/\/applicant/);
});