eBPLS — Level 1 Data Flow Diagram
Electronic Business Permit and Licensing System
Total Processes: 10  |  Total Data Stores: 21

Process 1.0 — User Management

Description
Handles user registration, login, and authentication for all application types (New, Renewal, Closure). Validates credentials and creates user sessions. Manages user profiles and role assignments.

Data Flows

Data Stores Used

Process 2.0 — Application Processing

Description
Handles submission and processing of business permit applications. Validates application details based on application type: (NEW) normal application flow; (RENEWAL) verifies previous permit validity and expiry date before proceeding; (CLOSURE) checks for any pending payments — if pending payment exists, business owner must settle first before closure proceeds.

Data Flows

Data Stores Used

Process 3.0 — Endorsement

Description
Manages the endorsement of applications to clearance offices. For CLOSURE applications, additionally endorses to Municipality Treasury Office (MTO) to verify any existing unpaid fees or outstanding obligations. If MTO finds outstanding balance, application is returned for payment settlement. Only when MTO confirms all clear does the closure proceed.

Data Flows

Data Stores Used

Process 4.0 — Approval

Description
Manages overall BPLO approval and department-level approval of applications. Records approval decisions and remarks.

Data Flows

Data Stores Used

Process 5.0 — Fee Assessment

Description
Handles computation and assignment of business permit fees. Determines payment frequency (Annual, Quarterly, Monthly) and generates Tax Order of Payment with installment schedule. For CLOSURE applications, checks if any closure fees apply before proceeding.

Data Flows

Data Stores Used

Process 6.0 — Payment Processing

Description
Processes business permit fee payments through the Payment Gateway. Supports installment payments (Annual, Quarterly, Monthly) — tracks each installment, remaining balance, and sends reminders for upcoming due payments. Records payment transactions and generates official receipts per installment.

Data Flows

Data Stores Used

Process 7.0 — Permit Issuance

Description
Processes and issues documents based on application type: (NEW/RENEWAL) sends permit for Mayor signing then issues Business Permit; (CLOSURE) issues Closure Certificate and deactivates the existing permit record. All documents are recorded in the permit data store.

Data Flows

Data Stores Used

Process 8.0 — Notification and Mapping

Description
Sends SMS notifications to business owners about application status and permit availability. Handles business location mapping by retrieving and storing business coordinates and map data from the Mapping Service.

Data Flows

Data Stores Used

Process 9.0 — Issuance

Description
Handles the physical claiming of the printed business permit by the business owner at the BPLO office.

Data Flows

Data Stores Used

Process 10.0 — Report Generation

Description
Generates system reports for BPLO Staff including application reports, payment reports, SMS logs, and user summaries.

Data Flows

Data Stores Used


---

## Table 1
| INPUT — External → Process | OUTPUT — Process → External | READ — Data Store → Process | WRITE — Process → Data Store |
| --- | --- | --- | --- |

## Table 2
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | Business Owner | 1.0 User Management | Registration Details (New/Renewal/Closure) |
| INPUT | Business Owner | 1.0 User Management | Login Credentials (New/Renewal/Closure) |
| OUTPUT | 1.0 User Management | Business Owner | Account Information (New/Renewal/Closure) |
| OUTPUT | 1.0 User Management | Business Owner | Login Credentials Retrieve (New/Renewal/Closure) |
| OUTPUT | 1.0 User Management | 2.0 Application Processing | Authenticated User (New/Renewal/Closure) |
| READ | D1 User Account Record | 1.0 User Management | Retrieve Log-in Credentials (New/Renewal/Closure) |
| WRITE | 1.0 User Management | D1 User Account Record | Account Information (New/Renewal/Closure) |
| READ | D1 User Account Record | 1.0 User Management | User Profiles (New/Renewal/Closure) |
| WRITE | 1.0 User Management | D1 User Account Record | User Profile Details (New/Renewal/Closure) |

## Table 3
| ID | Table Name | Fields Used |
| --- | --- | --- |
| D1 | User Account Record | Account ID, Username, Email, Password, Role, Status, Last Login, Profile Reference |
| D2 | User Account Record | Profile ID, First Name, Last Name, Sex, Phone Number |

## Table 4
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | Business Owner | 2.0 Application Processing | Submit Application (New/Renewal/Closure) |
| INPUT | Business Owner | 2.0 Application Processing | Application Information (New/Renewal/Closure) |
| INPUT | Business Owner | 2.0 Application Processing | Application Type (New/Renewal/Closure) |
| INPUT | Business Owner | 2.0 Application Processing | Document Upload (New/Renewal/Closure) |
| INPUT | 1.0 User Management | 2.0 Application Processing | Authenticated User (New/Renewal/Closure) |
| OUTPUT | 2.0 Application Processing | BPLO Staff | Application Details (New/Renewal/Closure) |
| OUTPUT | 2.0 Application Processing | Business Owner | Application Status (New/Renewal/Closure) |
| OUTPUT | 2.0 Application Processing | Business Owner | Pending Payment Notice (Closure) |
| OUTPUT | 2.0 Application Processing | 3.0 Endorsement | Application Endorsement (New/Renewal/Closure) |
| READ | D2 Application Record | 2.0 Application Processing | Application Details (New/Renewal/Closure) |
| WRITE | 2.0 Application Processing | D2 Application Record | Business Application Record (New/Renewal/Closure) |
| READ | D2 Application Record | 2.0 Application Processing | Requirement Details (New/Renewal/Closure) |
| WRITE | 2.0 Application Processing | D2 Application Record | Submitted Requirements (New/Renewal/Closure) |
| READ | D3 Requirements Record | 2.0 Application Processing | Requirement List (New/Renewal/Closure) |
| READ | D4 Business Record | 2.0 Application Processing | Business Details (New/Renewal/Closure) |
| READ | D9 Permit Record | 2.0 Application Processing | Previous Permit Record (Renewal/Closure) |
| READ | D8 Payment Record | 2.0 Application Processing | Check Pending Payment (Closure) |

## Table 5
| ID | Table Name | Fields Used |
| --- | --- | --- |
| D3 | Application Record | Application ID, Business Name, Business Code, Business Type, Application Type, Status, Date Submitted, User Reference |
| D4 | Application Record | Application ID, Requirement Reference, Submitted File, Status |
| D5 | Requirements Record | Requirement ID, Requirement Name, Requirement Type, Applicable Application Type |
| D6 | Business Record | Line of Business ID, LOB Code, LOB Description |
| D16 | Payment Record | Application Reference, Payment Status |
| D18 | Permit Record | Application Reference, Permit Status |

## Table 6
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 2.0 Application Processing | 3.0 Endorsement | Application Endorsement (New/Renewal/Closure) |
| INPUT | BPLO Staff | 3.0 Endorsement | Application Remarks (New/Renewal/Closure) |
| OUTPUT | 3.0 Endorsement | Clearance Offices | Clearance Document Details (New/Renewal/Closure) |
| OUTPUT | 3.0 Endorsement | BPLO Staff | Endorsement Status (New/Renewal/Closure) |
| OUTPUT | 3.0 Endorsement | Municipality Treasury Office | Closure Endorsement (Closure) |
| OUTPUT | 3.0 Endorsement | 4.0 Approval | Endorsed Application (New/Renewal/Closure) |
| INPUT | Clearance Offices | 3.0 Endorsement | Remarks (New/Renewal/Closure) |
| INPUT | Municipality Treasury Office | 3.0 Endorsement | MTO Clearance / Outstanding Balance Notice (Closure) |
| READ | D5 Department & Clearance Record | 3.0 Endorsement | Department Details (New/Renewal/Closure) |
| READ | D5 Department & Clearance Record | 3.0 Endorsement | Clearance Details (New/Renewal/Closure) |
| WRITE | 3.0 Endorsement | D5 Department & Clearance Record | Clearance Record (New/Renewal/Closure) |
| READ | D5 Department & Clearance Record | 3.0 Endorsement | Application Clearance Details (New/Renewal/Closure) |
| WRITE | 3.0 Endorsement | D5 Department & Clearance Record | Application Clearance Record (New/Renewal/Closure) |
| READ | D3 Requirements Record | 3.0 Endorsement | Department Requirements (New/Renewal/Closure) |
| READ | D8 Payment Record | 3.0 Endorsement | Outstanding Balance Check (Closure) |

## Table 7
| ID | Table Name | Fields Used |
| --- | --- | --- |
| D7 | Department & Clearance Record | Department ID, Department Name, Description |
| D8 | Department & Clearance Record | Clearance ID, Application Reference, Department Reference, Remarks, Status, Date Cleared |
| D9 | Department & Clearance Record | Application Reference, Clearance Reference, Status |
| D10 | Requirements Record | Requirement Reference, Department Reference |

## Table 8
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 3.0 Endorsement | 4.0 Approval | Endorsed Application (New/Renewal/Closure) |
| INPUT | BPLO Staff | 4.0 Approval | Manage Applications (New/Renewal/Closure) |
| OUTPUT | 4.0 Approval | BPLO Staff | Application Assessment (New/Renewal/Closure) |
| OUTPUT | 4.0 Approval | Business Owner | Application Remarks (New/Renewal/Closure) |
| OUTPUT | 4.0 Approval | 5.0 Fee Assessment | Approved Application (New/Renewal/Closure) |
| READ | D6 Approval Record | 4.0 Approval | Approval Record (New/Renewal/Closure) |
| WRITE | 4.0 Approval | D6 Approval Record | Approval Details (New/Renewal/Closure) |
| READ | D6 Approval Record | 4.0 Approval | Department Approval Record (New/Renewal/Closure) |
| WRITE | 4.0 Approval | D6 Approval Record | Department Approval Details (New/Renewal/Closure) |

## Table 9
| ID | Table Name | Fields Used |
| --- | --- | --- |
| D11 | Approval Record | Approval ID, Application Reference, Remarks, Status, Date Updated |
| D12 | Approval Record | Approval Reference, Department Reference, Approval Status, Approval Remarks |

## Table 10
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 4.0 Approval | 5.0 Fee Assessment | Approved Application (New/Renewal/Closure) |
| INPUT | Municipality Treasury Office | 5.0 Fee Assessment | Assessment of Fees (New/Renewal/Closure) |
| OUTPUT | 5.0 Fee Assessment | Municipality Treasury Office | Fee Details (New/Renewal/Closure) |
| OUTPUT | 5.0 Fee Assessment | Business Owner | Statement of Account (New/Renewal/Closure) |
| OUTPUT | 5.0 Fee Assessment | Business Owner | Payment Schedule — Annual/Quarterly/Monthly (New/Renewal) |
| OUTPUT | 5.0 Fee Assessment | 6.0 Payment Processing | Fee Details (New/Renewal/Closure) |
| READ | D7 Fee & Tax Record | 5.0 Fee Assessment | Tax Order Details (New/Renewal/Closure) |
| READ | D7 Fee & Tax Record | 5.0 Fee Assessment | Fee Items (New/Renewal/Closure) |
| READ | D7 Fee & Tax Record | 5.0 Fee Assessment | TOP Details (New/Renewal/Closure) |
| WRITE | 5.0 Fee Assessment | D7 Fee & Tax Record | Tax Order of Payment with Payment Frequency (New/Renewal/Closure) |

## Table 11
| ID | Table Name | Fields Used |
| --- | --- | --- |
| D13 | Fee & Tax Record | Tax Order ID, Tax Description, Tax Code, Tax Base, Penalty, Period |
| D14 | Fee & Tax Record | Item ID, Tax Order Reference, Item Name, Item Price, Category |
| D15 | Fee & Tax Record | Application Reference, Amount, Payment Deadline, Status |

## Table 12
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 5.0 Fee Assessment | 6.0 Payment Processing | Fee Details (New/Renewal/Closure) |
| INPUT | Business Owner | 6.0 Payment Processing | Payment (New/Renewal/Closure) |
| INPUT | Payment Gateway | 6.0 Payment Processing | Payment Confirmation (New/Renewal/Closure) |
| OUTPUT | 6.0 Payment Processing | Payment Gateway | Payment Request (New/Renewal/Closure) |
| OUTPUT | 6.0 Payment Processing | Business Owner | Official Receipt (New/Renewal/Closure) |
| OUTPUT | 6.0 Payment Processing | Business Owner | Installment Reminder (New/Renewal) |
| OUTPUT | 6.0 Payment Processing | Business Owner | Remaining Balance (New/Renewal) |
| OUTPUT | 6.0 Payment Processing | Municipality Treasury Office | Payment Details (New/Renewal/Closure) |
| OUTPUT | 6.0 Payment Processing | 7.0 Permit Issuance | Payment Completion (New/Renewal/Closure) |
| INPUT | Municipality Treasury Office | 6.0 Payment Processing | Payment Verification (New/Renewal/Closure) |
| READ | D8 Payment Record | 6.0 Payment Processing | Payment Record (New/Renewal/Closure) |
| WRITE | 6.0 Payment Processing | D8 Payment Record | Payment Transaction / Installment Record (New/Renewal/Closure) |

## Table 13
| ID | Table Name | Fields Used |
| --- | --- | --- |
| D16 | Payment Record | Payment ID, Application Reference, Amount Paid, Date Paid, Payment Method, Transaction Reference, OR Number, Status |

## Table 14
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 6.0 Payment Processing | 7.0 Permit Issuance | Payment Completion (New/Renewal/Closure) |
| OUTPUT | 7.0 Permit Issuance | Mayor's Office | Printed Business Permit (New/Renewal) |
| INPUT | Mayor's Office | 7.0 Permit Issuance | Signed Business Permit (New/Renewal) |
| OUTPUT | 7.0 Permit Issuance | Business Owner | Closure Certificate (Closure) |
| OUTPUT | 7.0 Permit Issuance | 8.0 Notification | Permit Issuance Details (New/Renewal/Closure) |
| READ | D9 Permit Record | 7.0 Permit Issuance | Permit Subscription Details (New/Renewal) |
| WRITE | 7.0 Permit Issuance | D9 Permit Record | Permit File (New/Renewal) |
| READ | D9 Permit Record | 7.0 Permit Issuance | Existing Permit Record (Renewal/Closure) |
| WRITE | 7.0 Permit Issuance | D9 Permit Record | Issued Permit (New/Renewal) / Closure Certificate (Closure) |

## Table 15
| ID | Table Name | Fields Used |
| --- | --- | --- |
| D17 | Permit Record | Application Reference, Permit File, Subscription Type, Permit Deadline |
| D18 | Permit Record | Permit ID, Application Reference, Payment Reference, Permit Number, Issue Date, Expiry Date, Permit Status, Signed By, Date Claimed |

## Table 16
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 7.0 Permit Issuance | 8.0 Notification | Permit Issuance Details (New/Renewal/Closure) |
| OUTPUT | 8.0 Notification | SMS Provider | Notification Data (New/Renewal/Closure) |
| INPUT | SMS Provider | 8.0 Notification | SMS Reminder (New/Renewal) |
| OUTPUT | 8.0 Notification | Business Owner | SMS Notification (New/Renewal/Closure) |
| OUTPUT | 8.0 Notification | Mapping Service | Location Request (New/Renewal) |
| INPUT | Mapping Service | 8.0 Notification | Business Map (New/Renewal) |
| INPUT | Mapping Service | 8.0 Notification | Business Location Coordinates (New/Renewal) |
| OUTPUT | 8.0 Notification | Business Owner | Business Map (New/Renewal) |
| OUTPUT | 8.0 Notification | 9.0 Issuance | Permit Ready Notification (New/Renewal/Closure) |
| READ | D10 Notification & Location Record | 8.0 Notification | Notification Logs (New/Renewal/Closure) |
| WRITE | 8.0 Notification | D10 Notification & Location Record | Notification Record (New/Renewal/Closure) |
| READ | D10 Notification & Location Record | 8.0 Notification | Retrieve Location Coordinates (New/Renewal) |
| WRITE | 8.0 Notification | D10 Notification & Location Record | Business Location Coordinates (New/Renewal) |

## Table 17
| ID | Table Name | Fields Used |
| --- | --- | --- |
| D19 | Notification & Location Record | Application Reference, Account Reference, Notification Type, Message, Date Sent, Delivery Status, SMS Reference |
| D21 | Notification & Location Record | Application Reference, Latitude, Longitude, Business Map, Location Coordinates, Map Reference, Date Updated |

## Table 18
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 8.0 Notification | 9.0 Issuance | Permit Ready Notification (New/Renewal/Closure) |
| INPUT | Business Owner | 9.0 Issuance | Claim Permit (New/Renewal) / Claim Certificate (Closure) |
| OUTPUT | 9.0 Issuance | Business Owner | Business Permit (New/Renewal) |
| OUTPUT | 9.0 Issuance | Business Owner | Closure Certificate (Closure) |
| OUTPUT | 9.0 Issuance | Business Owner | Business Map (New/Renewal) |
| OUTPUT | 9.0 Issuance | 10.0 Report Generation | Report (New/Renewal/Closure) |
| READ | D9 Permit Record | 9.0 Issuance | Permit Record (New/Renewal/Closure) |
| WRITE | 9.0 Issuance | D9 Permit Record | Permit Claimed Status (New/Renewal/Closure) |

## Table 19
| ID | Table Name | Fields Used |
| --- | --- | --- |
| D18 | Permit Record | Permit Reference, Status, Date Claimed |

## Table 20
| Direction | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 9.0 Issuance | 10.0 Report Generation | Report (New/Renewal/Closure) |
| INPUT | BPLO Staff | 10.0 Report Generation | Report Request (New/Renewal/Closure) |
| OUTPUT | 10.0 Report Generation | BPLO Staff | Report Details (New/Renewal/Closure) |
| READ | D2 Application Record | 10.0 Report Generation | Application Report (New/Renewal/Closure) |
| READ | D8 Payment Record | 10.0 Report Generation | Payment Report (New/Renewal/Closure) |
| READ | D10 Notification & Location Record | 10.0 Report Generation | SMS Logs Report (New/Renewal/Closure) |
| READ | D1 User Account Record | 10.0 Report Generation | Registered User Summary (New/Renewal/Closure) |
| READ | D9 Permit Record | 10.0 Report Generation | Issued Business / Closure Report (New/Renewal/Closure) |
| WRITE | 10.0 Report Generation | D10 Notification & Location Record | Generated Report (New/Renewal/Closure) |

## Table 21
| ID | Table Name | Fields Used |
| --- | --- | --- |
| D20 | Notification & Location Record | Report ID, Account Reference, Report Type, Report Date, Date From, Date To, Report Details, Report File |
