# Specification

## Summary
**Goal:** Apply a complete design system and screen-by-screen UI specification to the SamriddhiSrot application, covering global tokens, typography, spacing, and all major screens.

**Planned changes:**
- Update global CSS and Tailwind config with design tokens: Earth Brown #8B4513, Sand Gold #DAA520, Ivory Cream #FFFFF0, Forest Green #228B22, Kutch Indigo #4B0082; load Poppins Bold, Roboto Regular, Playfair Display Italic fonts; enforce 16px grid, 12px border radius, and box-shadow 0px 4px 8px rgba(0,0,0,0.1)
- Add a full-screen splash screen (2 seconds) with centered logo text 'समृद्धिस्रोत' in Earth Brown Poppins Bold 48pt, tagline in Sand Gold Playfair Italic 20pt, spinning loader with 'Connecting artisans...' text, and an Ivory Cream-to-Sand Gold gradient background
- Redesign the Home Dashboard with a fixed header (brand name left, profile+cart icons right), rounded search bar with Himalayan/Kutch placeholder, horizontally scrollable featured product cards with rarity badges, and horizontal region filter chips (Himalayas, Northeast, Rajasthan, Kerala, Tribal)
- Add a persistent bottom navigation bar with four tabs: Home (/), Discover (/discover), Orders (/orders), Profile (/collection or /dashboard); active tab in #8B4513, inactive in #666
- Build/update the Producer Discovery page (/discover) with a 3×2 grid of producer cards showing circular photo, brand name, voice story play button, and rarity badge; filter chips for Banarasi, Kutch, Tribal, Himalayan, Northeast
- Update the Producer Profile page (/producers/:id) with fixed top section (back arrow, Follow button, producer name, follower count), brand story section (logo, story text, voice player bar), product grid, and action buttons (WhatsApp Chat in Forest Green linking to wa.me, Live Call in Sand Gold)
- Update the Product Detail page with full-width product image, title in Earth Brown Poppins Bold 22pt, rarity badge, blinking low-stock warning in #FF4500, price in Forest Green Poppins 28pt, voice audio player in Earth Brown, full-width Buy Now button in Forest Green, and outlined Custom Request button in Sand Gold
- Build/update the Producer Brand Setup screen (from Producer Dashboard) with a form for Brand Name, Brand Tagline (max 20 chars), logo upload, color picker, 30-sec voice recorder, and a full-width 'Launch My Brand' button in Forest Green
- Update Checkout/PurchaseModal to show order summary with '92% goes direct to [BrandName]' in Forest Green, payment method selector (PhonePe, GPay, Paytm, Bank), full-width Forest Green confirm button, and a post-confirmation WhatsApp order tracking link
- Update My Collection/Order History page (/collection) with header 'My Rare Collection', scrollable order cards (thumbnail, product name, producer name, star rating, delivery status, Re-order, Rate buttons), and stats row showing rare finds and followed producer counts
- Apply global reusable component specs: Badge Pill (32dp height, #DAA520, Poppins 12pt, 16px radius), Voice Player bar (full-width, 48dp, #8B4513, waveform, timestamp), Product Card (white, 12px radius, shadow), UPI/action buttons (full-width, 56dp, #228B22, Poppins Bold 18pt white)

**User-visible outcome:** The entire app reflects a cohesive Indian artisan marketplace design system with consistent colors, typography, spacing, and fully styled screens from splash through checkout and order history.
