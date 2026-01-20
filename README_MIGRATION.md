# Migration to Convex (v2)

You have successfully scaffolded **v2** of the Registry using Convex. This architecture solves the concurrency/crashing issues of the Google Drive implementation.

## 🚀 Quick Start

1.  **Navigate to the new directory:**
    ```bash
    cd bae-registry-v2
    ```

2.  **Install dependencies (if not already done):**
    ```bash
    npm install
    ```

3.  **Initialize Convex (REQUIRED):**
    This connects the code to a real live backend in the cloud (Free tier).
    ```bash
    npx convex dev
    ```
    *   It will ask you to log in (Github/Google).
    *   It will create a `.env.local` file with your `VITE_CONVEX_URL`.

4.  **Start the Frontend:**
    In a new terminal window (keep `npx convex dev` running):
    ```bash
    npm run dev
    ```

## 📂 Project Structure

*   `convex/schema.ts`: Defines your database tables (Users, Events, Attendees).
*   `convex/attendees.ts`: Backend logic for checking in.
*   `convex/events.ts`: Backend logic for managing events.
*   `src/App.tsx`: The main user-facing Check-In app.
*   `src/components/AdminImport.tsx`: A tool to import your `attendees-for-ceu.json`.

## 🔄 Importing Legacy Data

To import your existing `attendees-for-ceu.json`:

1.  Uncomment the `<AdminImport />` component in `src/App.tsx` (or import it temporarily).
2.  Run the app.
3.  Select your JSON file using the file picker.
4.  It will upload all 500+ attendees to the Convex database instantly.

## 📧 Certificate Email Delivery (Gmail API)

1.  Set Convex environment variables:
    - `GMAIL_CLIENT_ID` (required)
    - `GMAIL_CLIENT_SECRET` (required)
    - `GMAIL_REFRESH_TOKEN` (required)
    - `GMAIL_USER` (required)
    - `GMAIL_FROM_EMAIL` (optional)
    - `GMAIL_FROM_NAME` (optional)
    - `PUBLIC_APP_URL` (optional, default `https://bae-sig-ceu.web.app`)

2.  Regenerate Convex types after adding new functions:
    ```bash
    npx convex dev
    ```

3.  Use the admin “Bulk Email” flow or run:
    ```bash
    node audit-cert-email-coverage.mjs --event OP-04-0012 --sent sent.csv --send
    ```

## 🛡️ Why this is better
*   **Real-time:** Updates happen instantly on all devices.
*   **Concurrency:** 100 people can check in at the exact same second without crashing (Drive could handle ~1).
*   **Offline-tolerant:** Convex handles spotty connections gracefully.
