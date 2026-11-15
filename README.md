# Chalkline Foundation: practice site

A fictional one page website for a charity that repairs and equips classrooms in public primary schools in Nigeria. I built it as a portfolio piece to practise the kind of work a nonprofit website needs: a clear impact page, a volunteer sign up that saves to a Google Sheet, live numbers, and a test mode donate button.

All names and figures are samples. No real money moves.

## What it does

- Mobile first impact page with a report card of key numbers and three funding projects.
- Volunteer form that saves each sign up to a Google Sheet through Google Apps Script.
- Live numbers: the report card and tally marks read their figures from the same Sheet.
- Donate button using Paystack Inline in test mode (public test key only).
- Accessible by design: skip link, labelled fields, 44px touch targets, visible focus, screen reader status messages, reduced motion support.

## Tech

Plain HTML, CSS and JavaScript in one file. No framework, no build step. Google Sheets and Apps Script as a free backend. Paystack Inline for test payments.

## Run it

1. Open `index.html` in a browser. It works straight away in demo mode with sample numbers.
2. To turn on the Sheet and payments, edit the `CONFIG` block near the top of the script in `index.html`:
   - `ENDPOINT`: your Apps Script web app URL.
   - `PAYSTACK_PUBLIC_KEY`: your Paystack TEST public key (starts with `pk_test_`).

## Set up the Google Sheet

1. Create a Sheet with two tabs named exactly `Volunteers` and `Stats`.
2. In `Stats`, put keys in column A and numbers in column B: `classrooms`, `pupils`, `schools`, `states`, `volunteers`.
3. Open Extensions, then Apps Script. Paste in `apps-script/Code.gs`.
4. Deploy, then New deployment, type Web app. Execute as: Me. Who has access: Anyone.
5. Copy the web app URL into `ENDPOINT`.

## Security notes

- Only a public test key is in the page. A secret key (`sk_...`) must never be in this repo. `.gitignore` blocks common secret files.
- The form has a hidden spam trap field, checks on the page, and checks again on the server in `Code.gs`.
- The server writes values as plain text so a sign up cannot run a spreadsheet formula.
- The live numbers endpoint only returns five named numbers. Nothing else leaves the Sheet.
- `_headers` adds basic security headers on Netlify. HTTPS is automatic on Netlify and Vercel.
- Paystack test payments are confirmed only in the browser here. A real launch needs a small server that verifies each payment with the secret key, or a Paystack webhook.

## Checks I ran

- Tested at 390px wide on a phone sized screen: no sideways scrolling.
- Lighthouse scores for performance, accessibility, best practices and SEO are listed below.

| Category | Score |
| --- | --- |
| Performance | (fill in) |
| Accessibility | (fill in) |
| Best practices | (fill in) |
| SEO | (fill in) |

## What I would do next

- Verify payments on a server and store donations.
- Add a thank you email for volunteers.
- Move the numbers from a Sheet to a small database once traffic grows.

Built by Confidence Akinsoun (Tech-Fidence), Lagos.
