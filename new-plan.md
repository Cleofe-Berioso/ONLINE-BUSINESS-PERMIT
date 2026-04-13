I do not want a fully finished implementation.

I only want a **template structure** for the renewal system, because I will configure and complete each page myself.

What I need:

* Create only the **basic template/foundation**
* Keep the code minimal, clean, and easy to edit
* Do not overbuild the UI
* Do not fully configure the pages
* Do not add too much styling
* I will manually customize each page, section, and logic later

Scope:

* I want the renewal feature to have only the starter structure for:

  * renewal page
  * renewal details page
  * optional API route templates
  * optional validation template
  * optional hook template
* Use placeholders where needed
* Add clear comments like:

  * `// TODO: configure this`
  * `// TODO: connect your own UI here`
  * `// TODO: add your own fetch logic`
  * `// TODO: map your own fields here`

Important:

* Do not make the pages fully complete
* Do not assume the final UI
* Do not create a polished production design
* Do not force a full workflow
* Only provide a starter template that matches this logic:

System logic:

* New Application is for first-time applicants
* Renewal Portal is only for applicants with an existing permit
* Renewal should require `previousPermitId`
* Applicants should be able to view permits and choose which one to renew
* The renewal application should link to the previous permit

Please generate:

1. `dashboard/renew/page.tsx` template
2. `dashboard/renew/[permitId]/page.tsx` template
3. optional `api/permits/user/route.ts` template
4. optional `api/applications/route.ts` renewal validation template
5. optional `lib/validations.ts` template section

Code style:

* Next.js App Router
* TypeScript
* Minimal starter code only
* Use placeholders instead of full implementation
* Add short comments explaining what I should configure manually

Output format:

* Separate each file clearly
* Make each file paste-ready
* Keep everything modular and editable
