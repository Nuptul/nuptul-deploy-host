/**
 * Comprehensive End-to-End Test: Complete Guest Experience
 * Tests the entire flow from registration to RSVP submission
 * 
 * Test Flow:
 * Phase 1: Account Creation & Email Verification
 * Phase 2: Complete RSVP Flow Testing  
 * Phase 3: Verification & Validation
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const TEST_EMAIL = 'lyoncrypt@gmail.com';
const TEST_PASSWORD = 'TestPassword123!';
const BASE_URL = 'https://nuptul.netlify.app';

// Test data for realistic RSVP submission
const TEST_USER_DATA = {
  firstName: 'Lyon',
  lastName: 'Crypt',
  phone: '+61 400 123 456',
  emergencyContact: 'Jane Crypt +61 400 654 321',
  dietaryRestrictions: 'Vegetarian, no nuts',
  plusOneName: 'Sarah Johnson',
  songRequest: 'Perfect by Ed Sheeran',
  specialRequests: 'Please seat us near the dance floor. Looking forward to celebrating with you both!'
};

// Wedding events data for testing
const WEDDING_EVENTS = [
  { name: 'Pre-Wedding Drinks', attending: true, guestCount: 2 },
  { name: 'Wedding Ceremony & Reception', attending: true, guestCount: 2 },
  { name: 'Wedding Reception', attending: true, guestCount: 2 },
  { name: 'Recovery Beach Day', attending: false, guestCount: 1 }
];

test.describe('Complete Guest Experience E2E Test', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for mobile testing
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Navigate to the wedding website
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('Phase 1: Account Creation & Email Verification', async ({ page }) => {
    console.log('🚀 Starting Phase 1: Account Creation & Email Verification');
    
    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/01-homepage.png', fullPage: true });
    
    // Navigate to registration page
    await page.click('text=Sign Up', { timeout: 10000 });
    await page.waitForURL('**/register', { timeout: 10000 });
    
    // Take registration page screenshot
    await page.screenshot({ path: 'screenshots/02-registration-page.png', fullPage: true });
    
    // Fill out registration form
    console.log('📝 Filling out registration form...');
    
    // Basic information
    await page.fill('input[name="firstName"]', TEST_USER_DATA.firstName);
    await page.fill('input[name="lastName"]', TEST_USER_DATA.lastName);
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="phone"]', TEST_USER_DATA.phone);
    
    // Password fields
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);
    
    // Additional details
    await page.fill('input[name="emergencyContact"]', TEST_USER_DATA.emergencyContact);
    
    // Take filled form screenshot
    await page.screenshot({ path: 'screenshots/03-registration-form-filled.png', fullPage: true });
    
    // Submit registration
    console.log('✅ Submitting registration form...');
    await page.click('button[type="submit"]');
    
    // Wait for email confirmation message
    await page.waitForSelector('text=check your email', { timeout: 15000 });
    
    // Take confirmation screenshot
    await page.screenshot({ path: 'screenshots/04-email-confirmation-required.png', fullPage: true });
    
    console.log('📧 MANUAL STEP REQUIRED: Please check lyoncrypt@gmail.com and confirm the email');
    console.log('⏸️  Test will pause here. After email confirmation, continue to Phase 2...');
    
    // Verify email confirmation message is displayed
    await expect(page.locator('text=check your email')).toBeVisible();
    
    console.log('✅ Phase 1 Complete: Registration submitted, email confirmation required');
  });

  test('Phase 2: Complete RSVP Flow Testing', async ({ page }) => {
    console.log('🚀 Starting Phase 2: Complete RSVP Flow Testing');
    
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Login with test account (assuming email is confirmed)
    console.log('🔐 Logging in with test account...');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for successful login and redirect
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    // Take dashboard screenshot
    await page.screenshot({ path: 'screenshots/05-user-dashboard.png', fullPage: true });
    
    // Navigate to RSVP form
    console.log('📋 Navigating to RSVP form...');
    await page.click('text=RSVP', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Take RSVP form initial screenshot
    await page.screenshot({ path: 'screenshots/06-rsvp-step1-events.png', fullPage: true });
    
    // STEP 1: Event Selection
    console.log('🎉 Step 1: Selecting events...');
    
    // Verify blue glassmorphism design
    const progressIndicator = page.locator('.bg-gradient-to-r.from-blue-500.to-blue-600');
    await expect(progressIndicator).toBeVisible();
    
    // Select events based on test data
    for (const event of WEDDING_EVENTS) {
      const eventCard = page.locator(`text=${event.name}`).locator('..').locator('..');
      
      if (event.attending) {
        await eventCard.locator('button:has-text("Attending")').click();
        console.log(`✅ Selected attending for: ${event.name}`);
      } else {
        await eventCard.locator('button:has-text("Can\'t Attend")').click();
        console.log(`❌ Selected not attending for: ${event.name}`);
      }
      
      // Wait for visual feedback
      await page.waitForTimeout(500);
    }
    
    // Take event selection screenshot
    await page.screenshot({ path: 'screenshots/07-rsvp-events-selected.png', fullPage: true });
    
    // Continue to Step 2
    await page.click('button:has-text("Continue to Details")');
    await page.waitForLoadState('networkidle');
    
    // STEP 2: RSVP Details
    console.log('📝 Step 2: Filling out RSVP details...');
    
    // Take step 2 screenshot
    await page.screenshot({ path: 'screenshots/08-rsvp-step2-details.png', fullPage: true });
    
    // Fill details for each attending event
    const attendingEvents = WEDDING_EVENTS.filter(e => e.attending);
    
    for (let i = 0; i < attendingEvents.length; i++) {
      const event = attendingEvents[i];
      console.log(`📋 Filling details for: ${event.name}`);
      
      // Find the event section
      const eventSection = page.locator(`text=${event.name}`).locator('..').locator('..');
      
      // Set guest count
      const currentCount = await eventSection.locator('span:has-text("1")').textContent();
      const targetCount = event.guestCount;
      
      for (let count = parseInt(currentCount); count < targetCount; count++) {
        await eventSection.locator('button:has-text("+")').click();
        await page.waitForTimeout(200);
      }
      
      // Select meal preference
      await eventSection.locator('select').first().selectOption('Vegetarian');
      
      // Fill dietary restrictions
      await eventSection.locator('textarea').first().fill(TEST_USER_DATA.dietaryRestrictions);
      
      // Fill plus one name if guest count > 1
      if (event.guestCount > 1) {
        await eventSection.locator('input[placeholder*="plus one"]').fill(TEST_USER_DATA.plusOneName);
      }
      
      // Fill song request
      await eventSection.locator('input[placeholder*="song"]').fill(TEST_USER_DATA.songRequest);
      
      // Check accommodation if it's the main event
      if (event.name.includes('Ceremony')) {
        await eventSection.locator('input[type="checkbox"]').first().check();
      }
      
      // Fill event message
      await eventSection.locator('textarea').last().fill(`Excited for ${event.name}!`);
    }
    
    // Take completed details screenshot
    await page.screenshot({ path: 'screenshots/09-rsvp-details-completed.png', fullPage: true });
    
    // Continue to Step 3
    await page.click('button:has-text("Review & Submit")');
    await page.waitForLoadState('networkidle');
    
    // STEP 3: Review and Submit
    console.log('👀 Step 3: Reviewing and submitting RSVP...');
    
    // Take review screenshot
    await page.screenshot({ path: 'screenshots/10-rsvp-step3-review.png', fullPage: true });
    
    // Fill special requests
    await page.fill('textarea[placeholder*="additional requests"]', TEST_USER_DATA.specialRequests);
    
    // Verify all data is displayed correctly
    for (const event of attendingEvents) {
      await expect(page.locator(`text=${event.name}`)).toBeVisible();
      await expect(page.locator(`text=Guests: ${event.guestCount}`)).toBeVisible();
    }
    
    // Take final review screenshot
    await page.screenshot({ path: 'screenshots/11-rsvp-final-review.png', fullPage: true });
    
    // Submit RSVP
    console.log('🚀 Submitting RSVP...');
    await page.click('button:has-text("Submit RSVP")');
    
    // Wait for success message
    await page.waitForSelector('text=RSVP submitted successfully', { timeout: 15000 });
    
    // Take success screenshot
    await page.screenshot({ path: 'screenshots/12-rsvp-success.png', fullPage: true });
    
    console.log('✅ Phase 2 Complete: RSVP successfully submitted');
  });

  test('Phase 3: Verification & Validation', async ({ page }) => {
    console.log('🚀 Starting Phase 3: Verification & Validation');
    
    // Test mobile responsiveness by resizing
    console.log('📱 Testing mobile responsiveness...');
    
    // Test different screen sizes
    const screenSizes = [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 375, height: 812, name: 'iPhone X' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1024, height: 768, name: 'Desktop' }
    ];
    
    for (const size of screenSizes) {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto(`${BASE_URL}/rsvp`);
      await page.waitForLoadState('networkidle');
      
      // Take responsive screenshot
      await page.screenshot({ 
        path: `screenshots/13-responsive-${size.name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: true 
      });
      
      // Verify 44px touch targets
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const boundingBox = await button.boundingBox();
        
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
          console.log(`✅ Button ${i + 1} meets 44px height requirement: ${boundingBox.height}px`);
        }
      }
    }
    
    // Verify blue glassmorphism design
    console.log('🎨 Verifying blue glassmorphism design...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/rsvp`);
    
    // Check for blue color scheme (#0066CC)
    const blueElements = page.locator('.bg-gradient-to-r.from-blue-500.to-blue-600');
    await expect(blueElements.first()).toBeVisible();
    
    // Check for glassmorphism effects
    const glassCards = page.locator('[class*="backdrop-blur"]');
    await expect(glassCards.first()).toBeVisible();
    
    console.log('✅ Phase 3 Complete: All validations passed');
    
    // Final comprehensive screenshot
    await page.screenshot({ path: 'screenshots/14-final-validation-complete.png', fullPage: true });
  });
});
