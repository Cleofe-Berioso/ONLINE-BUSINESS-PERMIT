eBPLS — Level 2 Data Flow Diagrams
Electronic Business Permit and Licensing System
All 10 Processes | Generalized Data Stores (D1–D10)
### Direction Legend

## Process 1.0 — User Management

Description
Handles user registration, login, and authentication for all application types (New, Renewal, Closure). Validates credentials and creates user sessions. Manages user profiles and role assignments.

Sub-Processes

Data Flows

Data Stores Used

## Process 2.0 — Application Processing

Description
Handles submission and processing of business permit applications. Validates application details based on application type: (NEW) normal application flow; (RENEWAL) verifies previous permit validity and expiry date before proceeding; (CLOSURE) checks for any pending payments — if pending payment exists, business owner must settle first before closure proceeds.

Sub-Processes

Data Flows

Data Stores Used

## Process 3.0 — Endorsement

Description
Manages the endorsement of applications to clearance offices. For CLOSURE applications, additionally endorses to the Municipality Treasury Office (MTO) to verify any existing unpaid fees or outstanding obligations. If MTO finds an outstanding balance, the application is returned for payment settlement. Only when MTO confirms all clear does the closure proceed.

Sub-Processes

Data Flows

Data Stores Used

## Process 4.0 — Approval

Description
Manages overall BPLO approval and department-level approval of applications. Records approval decisions and remarks.

Sub-Processes

Data Flows

Data Stores Used

## Process 5.0 — Fee Assessment

Description
Handles computation and assignment of business permit fees. Determines payment frequency (Annual, Quarterly, Monthly) and generates a Tax Order of Payment with installment schedule. For CLOSURE applications, checks if any closure fees apply before proceeding.

Sub-Processes

Data Flows

Data Stores Used

## Process 6.0 — Payment Processing

Description
Processes business permit fee payments through the Payment Gateway. Supports installment payments (Annual, Quarterly, Monthly) — tracks each installment, remaining balance, and sends reminders for upcoming due payments. Records payment transactions and generates official receipts per installment.

Sub-Processes

Data Flows

Data Stores Used

## Process 7.0 — Permit Issuance

Description
Processes and issues documents based on application type: (NEW/RENEWAL) sends permit for Mayor signing then issues Business Permit; (CLOSURE) issues Closure Certificate and deactivates the existing permit record. All documents are recorded in the Permit Record.

Sub-Processes

Data Flows

Data Stores Used

## Process 8.0 — Notification and Mapping

Description
Sends SMS notifications to business owners about application status and permit availability. Handles business location mapping by retrieving and storing business coordinates and map data from the Mapping Service.

Sub-Processes

Data Flows

Data Stores Used

## Process 9.0 — Issuance

Description
Handles the physical claiming of the printed business permit by the business owner at the BPLO office.

Sub-Processes

Data Flows

Data Stores Used

## Process 10.0 — Report Generation

Description
Generates system reports for BPLO Staff including application reports, payment reports, SMS logs, and user summaries.

Sub-Processes

Data Flows

Data Stores Used


---

## Table 1
| INPUT | OUTPUT | READ | WRITE | External → Process | Process → External | Data Store → Process | Process → Data Store |
| --- | --- | --- | --- | --- |

## Table 2
| Sub-Process | Name | Description |
| --- | --- | --- |
| 1.1 | User Registration | Accepts registration details from the Business Owner, validates uniqueness of username/email, hashes the password, and writes a new account and profile entry to the User Account Record. |
| 1.2 | User Authentication | Accepts login credentials, reads the stored credentials from the User Account Record, verifies the password, updates the last-login timestamp, and outputs an authenticated session token to the next process. |
| 1.3 | Profile Management | Allows the Business Owner to update personal profile information. Reads the existing profile from the User Account Record, applies changes, and writes the updated profile back. |
| 1.4 | Credential Retrieval | Handles forgotten-password requests. Reads the account record, generates a reset token, and sends the reset link/credentials back to the Business Owner. |

## Table 3
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | Business Owner | 1.1 User Registration | Registration Details (New/Renewal/Closure) |
| INPUT | Business Owner | 1.2 User Authentication | Login Credentials (New/Renewal/Closure) |
| OUTPUT | 1.1 User Registration | Business Owner | Account Information (New/Renewal/Closure) |
| OUTPUT | 1.2 User Authentication | Business Owner | Login Credentials Retrieved (New/Renewal/Closure) |
| OUTPUT | 1.4 Credential Retrieval | Business Owner | Password Reset / Credentials (New/Renewal/Closure) |
| OUTPUT | 1.2 User Authentication | 2.0 Application Processing | Authenticated User (New/Renewal/Closure) |
| READ | D1 User Account Record | 1.2 User Authentication | Retrieve Login Credentials (New/Renewal/Closure) |
| WRITE | 1.1 User Registration | D1 User Account Record | Account Information (New/Renewal/Closure) |
| READ | D1 User Account Record | 1.3 Profile Management | User Profile (New/Renewal/Closure) |
| WRITE | 1.3 Profile Management | D1 User Account Record | User Profile Details (New/Renewal/Closure) |

## Table 4
| ID | Data Store | Data Elements |
| --- | --- | --- |
| D1 | User Account Record | Account ID, Username, Email, Password, Role, Status, Last Login, Profile ID, First Name, Last Name, Sex, Phone Number |

## Table 5
| Sub-Process | Name | Description |
| --- | --- | --- |
| 2.1 | Application Type Validation | Receives application type (New/Renewal/Closure) and authenticated user from 1.0. For Renewal, reads Permit Record to confirm previous permit is valid. For Closure, reads Payment Record to check for pending payments. Routes to 2.2 if valid; returns Pending Payment Notice to Business Owner if Closure is blocked. |
| 2.2 | Application Form Submission | Accepts application information and business details from the Business Owner. Reads the Requirements Record and Business Record to pre-populate and validate form fields. Writes the new application entry to the Application Record. |
| 2.3 | Document Upload Processing | Receives uploaded documents from the Business Owner. Validates each file against the Requirements Record (file type, completeness). Writes submitted requirement files to the Application Record. |
| 2.4 | Application Status Dispatch | Reads the saved application from the Application Record. Sends Application Details to BPLO Staff for review. Sends Application Status confirmation back to the Business Owner. Forwards Application Endorsement to 3.0 Endorsement. |

## Table 6
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | Business Owner | 2.1 Application Type Validation | Application Type (New/Renewal/Closure) |
| INPUT | 1.0 User Management | 2.1 Application Type Validation | Authenticated User (New/Renewal/Closure) |
| INPUT | Business Owner | 2.2 Application Form Submission | Application Information (New/Renewal/Closure) |
| INPUT | Business Owner | 2.2 Application Form Submission | Submit Application (New/Renewal/Closure) |
| INPUT | Business Owner | 2.3 Document Upload Processing | Document Upload (New/Renewal/Closure) |
| OUTPUT | 2.1 Application Type Validation | Business Owner | Pending Payment Notice (Closure) |
| OUTPUT | 2.4 Application Status Dispatch | BPLO Staff | Application Details (New/Renewal/Closure) |
| OUTPUT | 2.4 Application Status Dispatch | Business Owner | Application Status (New/Renewal/Closure) |
| OUTPUT | 2.4 Application Status Dispatch | 3.0 Endorsement | Application Endorsement (New/Renewal/Closure) |
| READ | D9 Permit Record | 2.1 Application Type Validation | Previous Permit Record (Renewal/Closure) |
| READ | D8 Payment Record | 2.1 Application Type Validation | Check Pending Payment (Closure) |
| READ | D3 Requirements Record | 2.2 Application Form Submission | Requirement List (New/Renewal/Closure) |
| READ | D4 Business Record | 2.2 Application Form Submission | Business Details (New/Renewal/Closure) |
| WRITE | 2.2 Application Form Submission | D2 Application Record | Business Application Record (New/Renewal/Closure) |
| READ | D2 Application Record | 2.3 Document Upload Processing | Requirement Details (New/Renewal/Closure) |
| WRITE | 2.3 Document Upload Processing | D2 Application Record | Submitted Requirements (New/Renewal/Closure) |

## Table 7
| ID | Data Store | Data Elements |
| --- | --- | --- |
| D2 | Application Record | Application ID, Business Name, Business Code, Business Type, Application Type, Status, Date Submitted, User Reference; Requirement Reference, Submitted File, Status |
| D3 | Requirements Record | Requirement ID, Requirement Name, Requirement Type, Applicable Application Type |
| D4 | Business Record | Line of Business ID, LOB Code, LOB Description |
| D8 | Payment Record | Application Reference, Payment Status |
| D9 | Permit Record | Application Reference, Permit Status |

## Table 8
| Sub-Process | Name | Description |
| --- | --- | --- |
| 3.1 | Endorsement Preparation | Receives the application endorsement from 2.0. BPLO Staff adds remarks. Reads the Department & Clearance Record to identify which clearance offices are required for this application type. Prepares clearance document packages for each office. |
| 3.2 | Clearance Office Dispatch | Sends Clearance Document Details to each required Clearance Office. Reads the Requirements Record to attach department-specific requirement checklists. Receives Remarks back from Clearance Offices. Writes Clearance Records to the Department & Clearance Record. |
| 3.3 | MTO Closure Endorsement | Applicable only for CLOSURE applications. Sends Closure Endorsement to Municipality Treasury Office. Reads the Payment Record to check outstanding balance. Receives MTO Clearance or Outstanding Balance Notice. If balance exists, routes back for settlement; if clear, proceeds. |
| 3.4 | Endorsement Status Update | Aggregates clearance results and MTO response. Writes Application Clearance Record to the Department & Clearance Record. Sends Endorsement Status to BPLO Staff. Forwards Endorsed Application to 4.0 Approval. |

## Table 9
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 2.0 Application Processing | 3.1 Endorsement Preparation | Application Endorsement (New/Renewal/Closure) |
| INPUT | BPLO Staff | 3.1 Endorsement Preparation | Application Remarks (New/Renewal/Closure) |
| OUTPUT | 3.2 Clearance Office Dispatch | Clearance Offices | Clearance Document Details (New/Renewal/Closure) |
| INPUT | Clearance Offices | 3.2 Clearance Office Dispatch | Remarks (New/Renewal/Closure) |
| OUTPUT | 3.3 MTO Closure Endorsement | Municipality Treasury Office | Closure Endorsement (Closure) |
| INPUT | Municipality Treasury Office | 3.3 MTO Closure Endorsement | MTO Clearance / Outstanding Balance Notice (Closure) |
| OUTPUT | 3.4 Endorsement Status Update | BPLO Staff | Endorsement Status (New/Renewal/Closure) |
| OUTPUT | 3.4 Endorsement Status Update | 4.0 Approval | Endorsed Application (New/Renewal/Closure) |
| READ | D5 Department & Clearance Record | 3.1 Endorsement Preparation | Department Details (New/Renewal/Closure) |
| READ | D3 Requirements Record | 3.2 Clearance Office Dispatch | Department Requirements (New/Renewal/Closure) |
| WRITE | 3.2 Clearance Office Dispatch | D5 Department & Clearance Record | Clearance Record (New/Renewal/Closure) |
| READ | D5 Department & Clearance Record | 3.2 Clearance Office Dispatch | Clearance Details (New/Renewal/Closure) |
| READ | D8 Payment Record | 3.3 MTO Closure Endorsement | Outstanding Balance Check (Closure) |
| WRITE | 3.4 Endorsement Status Update | D5 Department & Clearance Record | Application Clearance Record (New/Renewal/Closure) |

## Table 10
| ID | Data Store | Data Elements |
| --- | --- | --- |
| D3 | Requirements Record | Requirement Reference, Department Reference |
| D5 | Department & Clearance Record | Department ID, Department Name, Description; Clearance ID, Application Reference, Department Reference, Remarks, Status, Date Cleared; Application Reference, Clearance Reference, Status |
| D8 | Payment Record | Application Reference, Payment Status |

## Table 11
| Sub-Process | Name | Description |
| --- | --- | --- |
| 4.1 | Application Review | Receives the endorsed application from 3.0. BPLO Staff manages and reviews the full application. Reads the Approval Record to check any prior approval history for this application. |
| 4.2 | Department-Level Approval | Routes the application to relevant department heads for department-level approval decisions. Reads and writes the Approval Record for each department's response (approval status and remarks). |
| 4.3 | BPLO Overall Approval | Consolidates department approvals. BPLO Staff makes the final overall approval decision. Writes the overall Approval Details to the Approval Record. Sends Application Assessment to BPLO Staff and Application Remarks to the Business Owner. |
| 4.4 | Approval Forwarding | Upon overall approval, forwards the Approved Application to 5.0 Fee Assessment. |

## Table 12
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 3.0 Endorsement | 4.1 Application Review | Endorsed Application (New/Renewal/Closure) |
| INPUT | BPLO Staff | 4.1 Application Review | Manage Applications (New/Renewal/Closure) |
| READ | D6 Approval Record | 4.1 Application Review | Approval Record (New/Renewal/Closure) |
| OUTPUT | 4.2 Department-Level Approval | BPLO Staff | Application Assessment (New/Renewal/Closure) |
| READ | D6 Approval Record | 4.2 Department-Level Approval | Department Approval Record (New/Renewal/Closure) |
| WRITE | 4.2 Department-Level Approval | D6 Approval Record | Department Approval Details (New/Renewal/Closure) |
| WRITE | 4.3 BPLO Overall Approval | D6 Approval Record | Approval Details (New/Renewal/Closure) |
| OUTPUT | 4.3 BPLO Overall Approval | Business Owner | Application Remarks (New/Renewal/Closure) |
| OUTPUT | 4.4 Approval Forwarding | 5.0 Fee Assessment | Approved Application (New/Renewal/Closure) |

## Table 13
| ID | Data Store | Data Elements |
| --- | --- | --- |
| D6 | Approval Record | Approval ID, Application Reference, Remarks, Status, Date Updated; Approval Reference, Department Reference, Approval Status, Approval Remarks |

## Table 14
| Sub-Process | Name | Description |
| --- | --- | --- |
| 5.1 | Fee Computation | Receives the approved application from 4.0. Reads the Fee & Tax Record (tax orders and fee items) to compute applicable fees based on business type, capital, and line of business. MTO provides the Assessment of Fees. |
| 5.2 | Payment Schedule Generation | Determines payment frequency (Annual, Quarterly, Monthly). Generates the Tax Order of Payment (TOP) with installment schedule. Writes the TOP details to the Fee & Tax Record. Sends Statement of Account and Payment Schedule to the Business Owner. |
| 5.3 | Closure Fee Check | For CLOSURE applications only: reads the Fee & Tax Record to determine if any closure-specific fees apply. Sends Fee Details to MTO for confirmation. Routes to 5.4 after confirmation. |
| 5.4 | Fee Detail Forwarding | Sends final Fee Details to 6.0 Payment Processing and to the Municipality Treasury Office for recording. |

## Table 15
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 4.0 Approval | 5.1 Fee Computation | Approved Application (New/Renewal/Closure) |
| INPUT | Municipality Treasury Office | 5.1 Fee Computation | Assessment of Fees (New/Renewal/Closure) |
| READ | D7 Fee & Tax Record | 5.1 Fee Computation | Tax Order Details (New/Renewal/Closure) |
| READ | D7 Fee & Tax Record | 5.1 Fee Computation | Fee Items (New/Renewal/Closure) |
| WRITE | 5.2 Payment Schedule Generation | D7 Fee & Tax Record | Tax Order of Payment with Payment Frequency (New/Renewal/Closure) |
| READ | D7 Fee & Tax Record | 5.2 Payment Schedule Generation | TOP Details (New/Renewal/Closure) |
| OUTPUT | 5.2 Payment Schedule Generation | Business Owner | Statement of Account (New/Renewal/Closure) |
| OUTPUT | 5.2 Payment Schedule Generation | Business Owner | Payment Schedule — Annual/Quarterly/Monthly (New/Renewal) |
| OUTPUT | 5.3 Closure Fee Check | Municipality Treasury Office | Fee Details (Closure) |
| OUTPUT | 5.4 Fee Detail Forwarding | Municipality Treasury Office | Fee Details (New/Renewal/Closure) |
| OUTPUT | 5.4 Fee Detail Forwarding | 6.0 Payment Processing | Fee Details (New/Renewal/Closure) |

## Table 16
| ID | Data Store | Data Elements |
| --- | --- | --- |
| D7 | Fee & Tax Record | Tax Order ID, Tax Description, Tax Code, Tax Base, Penalty, Period; Item ID, Tax Order Reference, Item Name, Item Price, Category; Application Reference, Amount, Payment Deadline, Status |

## Table 17
| Sub-Process | Name | Description |
| --- | --- | --- |
| 6.1 | Payment Initiation | Receives Fee Details from 5.0. Business Owner submits payment. Reads the Payment Record to check existing payment status. Sends a Payment Request to the Payment Gateway. |
| 6.2 | Payment Confirmation | Receives Payment Confirmation from the Payment Gateway. Sends Payment Details to the Municipality Treasury Office for verification. Receives Payment Verification from MTO. Writes the payment transaction or installment record to the Payment Record. |
| 6.3 | Receipt & Notification | Generates and sends the Official Receipt to the Business Owner. For installment plans, computes and sends the Remaining Balance and Installment Reminder to the Business Owner. |
| 6.4 | Payment Completion Forwarding | Upon full or accepted payment, forwards Payment Completion to 7.0 Permit Issuance. |

## Table 18
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 5.0 Fee Assessment | 6.1 Payment Initiation | Fee Details (New/Renewal/Closure) |
| INPUT | Business Owner | 6.1 Payment Initiation | Payment (New/Renewal/Closure) |
| READ | D8 Payment Record | 6.1 Payment Initiation | Payment Record (New/Renewal/Closure) |
| OUTPUT | 6.1 Payment Initiation | Payment Gateway | Payment Request (New/Renewal/Closure) |
| INPUT | Payment Gateway | 6.2 Payment Confirmation | Payment Confirmation (New/Renewal/Closure) |
| OUTPUT | 6.2 Payment Confirmation | Municipality Treasury Office | Payment Details (New/Renewal/Closure) |
| INPUT | Municipality Treasury Office | 6.2 Payment Confirmation | Payment Verification (New/Renewal/Closure) |
| WRITE | 6.2 Payment Confirmation | D8 Payment Record | Payment Transaction / Installment Record (New/Renewal/Closure) |
| OUTPUT | 6.3 Receipt & Notification | Business Owner | Official Receipt (New/Renewal/Closure) |
| OUTPUT | 6.3 Receipt & Notification | Business Owner | Installment Reminder (New/Renewal) |
| OUTPUT | 6.3 Receipt & Notification | Business Owner | Remaining Balance (New/Renewal) |
| OUTPUT | 6.4 Payment Completion Forwarding | 7.0 Permit Issuance | Payment Completion (New/Renewal/Closure) |

## Table 19
| ID | Data Store | Data Elements |
| --- | --- | --- |
| D8 | Payment Record | Payment ID, Application Reference, Amount Paid, Date Paid, Payment Method, Transaction Reference, OR Number, Status |

## Table 20
| Sub-Process | Name | Description |
| --- | --- | --- |
| 7.1 | Permit Preparation | Receives Payment Completion from 6.0. Reads the Permit Record to retrieve permit subscription details and any existing permit for Renewal/Closure. Prepares the business permit document or closure certificate based on application type. |
| 7.2 | Mayor Signing (New/Renewal) | Sends the Printed Business Permit to the Mayor's Office for signing. Receives the Signed Business Permit back from the Mayor's Office. Applicable only for New and Renewal application types. |
| 7.3 | Document Issuance | For New/Renewal: writes the signed permit file to the Permit Record, updates permit status to Issued. For Closure: issues the Closure Certificate to the Business Owner and deactivates the permit record by writing Closure Certificate status. |
| 7.4 | Issuance Notification Forwarding | Sends Permit Issuance Details to 8.0 Notification and Mapping. |

## Table 21
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 6.0 Payment Processing | 7.1 Permit Preparation | Payment Completion (New/Renewal/Closure) |
| READ | D9 Permit Record | 7.1 Permit Preparation | Permit Subscription Details (New/Renewal) |
| READ | D9 Permit Record | 7.1 Permit Preparation | Existing Permit Record (Renewal/Closure) |
| OUTPUT | 7.2 Mayor Signing | Mayor's Office | Printed Business Permit (New/Renewal) |
| INPUT | Mayor's Office | 7.2 Mayor Signing | Signed Business Permit (New/Renewal) |
| WRITE | 7.3 Document Issuance | D9 Permit Record | Permit File (New/Renewal) |
| WRITE | 7.3 Document Issuance | D9 Permit Record | Issued Permit / Closure Certificate (New/Renewal/Closure) |
| OUTPUT | 7.3 Document Issuance | Business Owner | Closure Certificate (Closure) |
| OUTPUT | 7.4 Issuance Notification Forwarding | 8.0 Notification | Permit Issuance Details (New/Renewal/Closure) |

## Table 22
| ID | Data Store | Data Elements |
| --- | --- | --- |
| D9 | Permit Record | Application Reference, Permit File, Subscription Type, Permit Deadline; Permit ID, Application Reference, Payment Reference, Permit Number, Issue Date, Expiry Date, Permit Status, Signed By, Date Claimed |

## Table 23
| Sub-Process | Name | Description |
| --- | --- | --- |
| 8.1 | Notification Preparation | Receives Permit Issuance Details from 7.0. Reads the Notification & Location Record for prior notification logs. Prepares the notification message based on application type and issuance outcome. |
| 8.2 | SMS Dispatch | Sends Notification Data to the SMS Provider. Receives SMS Reminder back from the SMS Provider for installment due dates (New/Renewal). Writes the Notification Record to the Notification & Location Record. Sends SMS Notification to the Business Owner. |
| 8.3 | Location Mapping | Sends a Location Request to the Mapping Service (New/Renewal only). Receives Business Map and Business Location Coordinates from the Mapping Service. Writes Business Location Coordinates to the Notification & Location Record. Sends Business Map to the Business Owner. |
| 8.4 | Permit Ready Forwarding | After notification and mapping are complete, sends Permit Ready Notification to 9.0 Issuance. |

## Table 24
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 7.0 Permit Issuance | 8.1 Notification Preparation | Permit Issuance Details (New/Renewal/Closure) |
| READ | D10 Notification & Location Record | 8.1 Notification Preparation | Notification Logs (New/Renewal/Closure) |
| OUTPUT | 8.2 SMS Dispatch | SMS Provider | Notification Data (New/Renewal/Closure) |
| INPUT | SMS Provider | 8.2 SMS Dispatch | SMS Reminder (New/Renewal) |
| WRITE | 8.2 SMS Dispatch | D10 Notification & Location Record | Notification Record (New/Renewal/Closure) |
| OUTPUT | 8.2 SMS Dispatch | Business Owner | SMS Notification (New/Renewal/Closure) |
| OUTPUT | 8.3 Location Mapping | Mapping Service | Location Request (New/Renewal) |
| INPUT | Mapping Service | 8.3 Location Mapping | Business Map (New/Renewal) |
| INPUT | Mapping Service | 8.3 Location Mapping | Business Location Coordinates (New/Renewal) |
| WRITE | 8.3 Location Mapping | D10 Notification & Location Record | Business Location Coordinates (New/Renewal) |
| OUTPUT | 8.3 Location Mapping | Business Owner | Business Map (New/Renewal) |
| OUTPUT | 8.4 Permit Ready Forwarding | 9.0 Issuance | Permit Ready Notification (New/Renewal/Closure) |

## Table 25
| ID | Data Store | Data Elements |
| --- | --- | --- |
| D10 | Notification & Location Record | Application Reference, Account Reference, Notification Type, Message, Date Sent, Delivery Status, SMS Reference; Application Reference, Latitude, Longitude, Business Map, Location Coordinates, Map Reference, Date Updated |

## Table 26
| Sub-Process | Name | Description |
| --- | --- | --- |
| 9.1 | Claim Verification | Receives Permit Ready Notification from 8.0. Receives Claim Permit or Claim Certificate request from the Business Owner. Reads the Permit Record to verify the permit is ready and not yet claimed. |
| 9.2 | Document Release | Releases the Business Permit (New/Renewal) or Closure Certificate (Closure) and Business Map (New/Renewal) to the Business Owner. Writes the Permit Claimed Status to the Permit Record (updates permit_status to Claimed, records date_claimed). |
| 9.3 | Report Trigger | After successful document release, forwards the Report trigger to 10.0 Report Generation. |

## Table 27
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 8.0 Notification | 9.1 Claim Verification | Permit Ready Notification (New/Renewal/Closure) |
| INPUT | Business Owner | 9.1 Claim Verification | Claim Permit (New/Renewal) / Claim Certificate (Closure) |
| READ | D9 Permit Record | 9.1 Claim Verification | Permit Record (New/Renewal/Closure) |
| OUTPUT | 9.2 Document Release | Business Owner | Business Permit (New/Renewal) |
| OUTPUT | 9.2 Document Release | Business Owner | Closure Certificate (Closure) |
| OUTPUT | 9.2 Document Release | Business Owner | Business Map (New/Renewal) |
| WRITE | 9.2 Document Release | D9 Permit Record | Permit Claimed Status (New/Renewal/Closure) |
| OUTPUT | 9.3 Report Trigger | 10.0 Report Generation | Report (New/Renewal/Closure) |

## Table 28
| ID | Data Store | Data Elements |
| --- | --- | --- |
| D9 | Permit Record | Permit Reference, Status, Date Claimed |

## Table 29
| Sub-Process | Name | Description |
| --- | --- | --- |
| 10.1 | Report Request Handling | Receives Report trigger from 9.0 Issuance and Report Request from BPLO Staff. Validates report type and date range parameters. |
| 10.2 | Data Aggregation | Reads source data from all relevant records: Application Record (application summary), Payment Record (payment report), Notification & Location Record (SMS logs), User Account Record (registered user summary), and Permit Record (issued permit / closure report). |
| 10.3 | Report Compilation | Compiles the aggregated data into the requested report format. Writes the Generated Report to the Notification & Location Record (report store). |
| 10.4 | Report Delivery | Sends the final Report Details to BPLO Staff. |

## Table 30
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 9.0 Issuance | 10.1 Report Request Handling | Report (New/Renewal/Closure) |
| INPUT | BPLO Staff | 10.1 Report Request Handling | Report Request (New/Renewal/Closure) |
| READ | D2 Application Record | 10.2 Data Aggregation | Application Report (New/Renewal/Closure) |
| READ | D8 Payment Record | 10.2 Data Aggregation | Payment Report (New/Renewal/Closure) |
| READ | D10 Notification & Location Record | 10.2 Data Aggregation | SMS Logs Report (New/Renewal/Closure) |
| READ | D1 User Account Record | 10.2 Data Aggregation | Registered User Summary (New/Renewal/Closure) |
| READ | D9 Permit Record | 10.2 Data Aggregation | Issued Business / Closure Report (New/Renewal/Closure) |
| WRITE | 10.3 Report Compilation | D10 Notification & Location Record | Generated Report (New/Renewal/Closure) |
| OUTPUT | 10.4 Report Delivery | BPLO Staff | Report Details (New/Renewal/Closure) |

## Table 31
| ID | Data Store | Data Elements |
| --- | --- | --- |
| D1 | User Account Record | Account ID, Username, Email, Role, Status |
| D2 | Application Record | Application ID, Business Name, Application Type, Status, Date Submitted |
| D8 | Payment Record | Payment ID, Application Reference, Amount Paid, Date Paid, OR Number, Status |
| D9 | Permit Record | Permit ID, Application Reference, Permit Number, Issue Date, Expiry Date, Permit Status |
| D10 | Notification & Location Record | Report ID, Account Reference, Report Type, Report Date, Date From, Date To, Report Details, Report File; Notification Type, Message, Date Sent, Delivery Status |
