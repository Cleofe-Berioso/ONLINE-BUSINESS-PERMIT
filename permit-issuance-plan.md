Update the current `app/dashboard/issuance/page.tsx` implementation so it matches the Permit Issuance plan exactly.

Requirements:

* Keep authentication and role protection for STAFF and ADMINISTRATOR.
* Replace the current "Pending Issuance" and "Recent Permits" layout with a single Permit Issuance management page.
* The page must show:

  1. Page header

     * Title: "Permit Issuance"
     * Subtitle: "Generate and manage business permits"
  2. Three stat cards in a 3-column grid

     * Ready to Print → count of permits where status = "ready_to_print"
     * Issued → count of permits where status = "issued"
     * Claimed → count of permits where status = "claimed"
  3. Search input

     * Placeholder: "Search by permit number, business name, or owner..."
     * Filters permits client-side in real time
  4. Main permits table

     * Columns:

       * Permit Number
       * Business Name
       * Owner
       * Application Ref
       * Issue Date
       * Expiry Date
       * Status
       * Actions
     * Status badge styles:

       * ready_to_print → blue outline badge with label "Ready to Print"
       * issued → amber/yellow solid badge with label "Issued"
       * claimed → green solid badge with label "Claimed"
     * Actions:

       * Print button with printer icon
       * Download icon/button for PDF
* Do not keep the old "Pending Issuance" and "Recent Permits" sections.
* Refactor into a client component if needed for search/filtering and row actions.
* Use the existing design system and theme already used in the dashboard.
* Keep the page responsive with mobile cards or a mobile-friendly table layout.
* Use TypeScript.
* Use clean, production-ready code.

Behavior:

* On load, fetch all permits.
* Compute stat card counts from the fetched permits.
* Search should filter by permit number, business name, and owner name.
* Clicking Print:

  * opens print flow
  * if status is `ready_to_print`, update it to `issued`
  * refresh the UI immediately after update
* Clicking Download:

  * if a permit PDF URL exists, download it
  * otherwise prepare a client-side PDF generation placeholder
* Show an empty state if there are no permits.

Important:

* Preserve existing auth redirect logic.
* Do not change unrelated files unless required.
* Do not redesign the theme.
* Focus only on making the page match the plan exactly.
