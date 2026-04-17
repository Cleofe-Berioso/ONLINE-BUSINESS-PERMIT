eBPLS — Level 3 & Level 4 Data Flow Diagrams
Electronic Business Permit and Licensing System
Significant Process Decompositions Only — DFD Convention Applied
Sub-Processes Decomposed: 2.1 | 3.2 | 5.1 | 6.1 | 6.2 | 7.2 | 8.2
### Direction Color Legend

## Process 2.1 — Application Type Validation (Level 3)
Decomposes how the system validates New, Renewal, and Closure application types before allowing form submission. The branching logic makes this process significant enough to decompose.

Level 3 Sub-Processes

Level 3 Data Flows

#### Level 4 Decomposition — 2.1.4 Closure Pending Payment Check
This step has conditional logic complex enough to warrant Level 4 atomic actions: it must detect partial payments, installment arrears, and outstanding MTO-assessed fees before allowing closure to proceed.

## Process 3.2 — Clearance Office Dispatch (Level 3)
Decomposes how applications are routed to different clearance offices depending on application type. New applications require up to 9 offices; Renewal requires a subset; Closure routes exclusively to MTO for remaining obligation assessment.

Clearance Office Routing Rules

Level 3 Sub-Processes

Level 3 Data Flows

#### Level 4 Decomposition — 3.2.2 Clearance Office List Generation
The routing logic is conditional on both application type and business category, making this the most significant atomic step in 3.2.

## Process 5.1 — Fee Computation (Level 3)
Decomposes the bracket-based tax computation and category-based payment determination. Fees are computed based on gross sales or capital brackets, business category, and line of business. Payment category (Annual, Quarterly, Monthly) is applied after bracket lookup.

Level 3 Sub-Processes

Level 3 Data Flows

#### Level 4 Decomposition — 5.1.2 Tax Bracket Lookup & 5.1.3 Fee Item Computation
These two steps contain the core bracket-based financial logic of the eBPLS and represent the most atomic level of fee computation.

## Process 6.1 — Payment Initiation (Level 3)
Decomposes how the Business Owner scans the GCash QR code, submits payment, and the system routes the payment request to the Payment Gateway. The QR-based payment flow and document verification step make this significant enough to decompose.

Level 3 Sub-Processes

Level 3 Data Flows

#### Level 4 Decomposition — 6.1.2 GCash QR Code Generation & 6.1.3 QR Scan & Payment Submission
These steps represent the core payment interaction — QR generation parameters and the confirmation handshake with the Business Owner's GCash app.

## Process 6.2 — Payment Confirmation (Level 3)
Decomposes how the system validates the payment confirmation received from the Payment Gateway, submits details to MTO for verification, and writes the final payment transaction record.

Level 3 Sub-Processes

Level 3 Data Flows

#### Level 4 Decomposition — 6.2.3 MTO Payment Verification & 6.2.4 Payment Record Write
MTO verification involves cross-checking multiple data points; the write step must correctly handle both full payments and installment scenarios.

## Process 7.2 — Mayor Signing / New & Renewal (Level 3)
Decomposes the permit signing workflow between the BPLO and the Mayor's Office. Applicable only for New and Renewal applications. Closure applications bypass this process and go directly to 7.3 Document Issuance.

Level 3 Sub-Processes

Level 3 Data Flows

#### Level 4 Decomposition — 7.2.3 Mayor's Office Review & Signing
The Mayor's signing decision has conditional outcomes (approve, hold, return) each with different downstream effects on the Permit Record and the BPLO workflow.

## Process 8.2 — SMS Dispatch (Level 3)
Decomposes how notifications are composed, routed by event type, sent through the SMS Provider, and logged. Different application events trigger different SMS templates. Installment reminders are scheduled based on payment frequency.

Level 3 Sub-Processes

Level 3 Data Flows

#### Level 4 Decomposition — 8.2.1 Notification Event Classification & 8.2.2 SMS Template Composition
The classification and template selection logic determines the entire content and timing of the SMS. These atomic steps define the routing rules clearly.


---

## Table 1
| INPUT | OUTPUT | READ | WRITE | External→Process | Process→External | DataStore→Process | Process→DataStore |
| --- | --- | --- | --- | --- |

## Table 2
| ID | Sub-Process / Step | Description |
| --- | --- | --- |
| 2.1.1 | Application Type Selection | Receives the authenticated user session from 1.0 and the Business Owner's selected application type (New, Renewal, or Closure). Presents the available application types and captures the selection. |
| 2.1.2 | New Application Route Check | For NEW type: confirms the authenticated user does not already have an active permit for the same business. If a duplicate is found, an error is returned. If clear, routes to 2.2 Application Form Submission. |
| 2.1.3 | Renewal Permit Validity Check | For RENEWAL type: reads the Permit Record to confirm a previous permit exists and is within the valid renewal window. Checks permit_status = Active and expiry_date is approaching. If invalid, returns an error. If valid, routes to 2.2. |
| 2.1.4 | Closure Pending Payment Check | For CLOSURE type: reads the Payment Record to detect any unpaid balance or pending installment. If pending payment exists, sends a Pending Payment Notice to the Business Owner and blocks the closure. If clear, routes to 2.2. |

## Table 3
| Dir | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | Business Owner | 2.1.1 Application Type Selection | Selected Application Type (New/Renewal/Closure) |
| INPUT | 1.0 User Management | 2.1.1 Application Type Selection | Authenticated User (session token, role) |
| READ | D9 Permit Record | 2.1.3 Renewal Permit Validity Check | Previous Permit Record (permit_status, expiry_date) |
| READ | D8 Payment Record | 2.1.4 Closure Pending Payment Check | Pending Payment Status (Closure) |
| OUTPUT | 2.1.4 Closure Pending Payment Check | Business Owner | Pending Payment Notice (Closure) |
| OUTPUT | 2.1.1 Application Type Selection | 2.2 Application Form Submission | Validated Application Type (New/Renewal/Closure) |

## Table 4
| Step ID | Atomic Action |
| --- | --- |
| 2.1.4.1 | Retrieve all Payment Records linked to the Business Owner's current application ID |
| 2.1.4.2 | Filter records where payment status = Pending or Partially Paid |
| 2.1.4.3 | Check for unpaid installment tranches (Annual/Quarterly/Monthly) in Payment Record |
| 2.1.4.4 | Query MTO-assessed outstanding balance from Fee & Tax Record for closure-specific fees |
| 2.1.4.5 | If any pending or unpaid record found → compose Pending Payment Notice with itemized balance |
| 2.1.4.6 | Send Pending Payment Notice to Business Owner |
| 2.1.4.7 | Set application status = Blocked — Pending Payment in Application Record |
| 2.1.4.8 | If all payments settled → set clearance flag = true and route to 2.2 Application Form Submission |

## Table 5
| Application Type | Clearance Offices Required |
| --- | --- |
| NEW | Sanitary Office, Zoning Office, Environment Office, Engineering Office, Bureau of Fire Protection (BFP), Municipality Treasury Office (MTO), Assessor's Office, Market Clearance (if market business), Agriculture (if farm/piggery) |
| RENEWAL | Sanitary Office, Engineering Office, Bureau of Fire Protection (BFP), Municipality Treasury Office (MTO), Assessor's Office, Market Clearance (market businesses only), Agriculture (farms or piggery businesses only) |
| CLOSURE | Municipality Treasury Office (MTO) only — to assess remaining unpaid fees and outstanding obligations before closure proceeds |

## Table 6
| ID | Sub-Process / Step | Description |
| --- | --- | --- |
| 3.2.1 | Application Type & Business Category Check | Read the Application Record to determine application type (New/Renewal/Closure) and business category (market, farm/piggery, or general). This determines which clearance offices will be included in the dispatch list. |
| 3.2.2 | Clearance Office List Generation | Based on application type and business category, generate the ordered list of clearance offices to notify. For New: all 9 offices (conditionally Market and Agriculture). For Renewal: 5 core + conditional Market and Agriculture. For Closure: MTO only. |
| 3.2.3 | Clearance Document Package Preparation | For each office in the dispatch list, read the Requirements Record to attach the department-specific requirement checklist. Read the Department & Clearance Record for department details. Prepare individual clearance document packages per office. |
| 3.2.4 | Office-by-Office Dispatch | Send Clearance Document Details to each clearance office in sequence. Each office receives the application summary, requirement checklist, and remarks from BPLO Staff. |
| 3.2.5 | Clearance Remarks Collection | Receive Remarks from each clearance office (Cleared, With Deficiency, or For Further Inspection). Write each clearance result to the Department & Clearance Record. |
| 3.2.6 | MTO Outstanding Balance Handling (Closure) | For CLOSURE only: after MTO assesses remaining obligations, receive MTO Clearance or Outstanding Balance Notice. If outstanding balance exists, return to endorsement stage for settlement. If clear, mark MTO clearance as complete. |

## Table 7
| Dir | From | To | Data Flow Label |
| --- | --- | --- | --- |
| READ | D2 Application Record | 3.2.1 App Type & Business Category Check | Application Type, Business Category |
| READ | D5 Department & Clearance Record | 3.2.3 Clearance Document Package Preparation | Department Details per Office |
| READ | D3 Requirements Record | 3.2.3 Clearance Document Package Preparation | Department-Specific Requirement Checklist |
| OUTPUT | 3.2.4 Office-by-Office Dispatch | Sanitary Office | Clearance Document Details — Sanitary (New/Renewal) |
| OUTPUT | 3.2.4 Office-by-Office Dispatch | Zoning Office | Clearance Document Details — Zoning (New only) |
| OUTPUT | 3.2.4 Office-by-Office Dispatch | Environment Office | Clearance Document Details — Environment (New only) |
| OUTPUT | 3.2.4 Office-by-Office Dispatch | Engineering Office | Clearance Document Details — Engineering (New/Renewal) |
| OUTPUT | 3.2.4 Office-by-Office Dispatch | Bureau of Fire Protection (BFP) | Clearance Document Details — BFP (New/Renewal) |
| OUTPUT | 3.2.4 Office-by-Office Dispatch | Municipality Treasury Office (MTO) | Clearance Document Details — MTO (New/Renewal/Closure) |
| OUTPUT | 3.2.4 Office-by-Office Dispatch | Assessor's Office | Clearance Document Details — Assessor (New/Renewal) |
| OUTPUT | 3.2.4 Office-by-Office Dispatch | Market Clearance Office | Clearance Document Details — Market (New/Renewal — market businesses only) |
| OUTPUT | 3.2.4 Office-by-Office Dispatch | Agriculture Office | Clearance Document Details — Agriculture (New/Renewal — farms/piggery only) |
| INPUT | Clearance Offices | 3.2.5 Clearance Remarks Collection | Clearance Remarks (Cleared / With Deficiency / For Inspection) |
| WRITE | 3.2.5 Clearance Remarks Collection | D5 Department & Clearance Record | Clearance Record per Office (status, remarks, date_cleared) |
| INPUT | Municipality Treasury Office (MTO) | 3.2.6 MTO Outstanding Balance Handling | MTO Clearance or Outstanding Balance Notice (Closure) |

## Table 8
| Step ID | Atomic Action |
| --- | --- |
| 3.2.2.1 | Read application_type from Application Record (New / Renewal / Closure) |
| 3.2.2.2 | Read business category tag from Application Record (General / Market / Farm-Piggery) |
| 3.2.2.3 | If application_type = NEW → initialize dispatch list: Sanitary, Zoning, Environment, Engineering, BFP, MTO, Assessor's Office |
| 3.2.2.4 | If application_type = NEW AND business_category = Market → append Market Clearance Office to dispatch list |
| 3.2.2.5 | If application_type = NEW AND business_category = Farm-Piggery → append Agriculture Office to dispatch list |
| 3.2.2.6 | If application_type = RENEWAL → initialize dispatch list: Sanitary, Engineering, BFP, MTO, Assessor's Office |
| 3.2.2.7 | If application_type = RENEWAL AND business_category = Market → append Market Clearance Office to dispatch list |
| 3.2.2.8 | If application_type = RENEWAL AND business_category = Farm-Piggery → append Agriculture Office to dispatch list |
| 3.2.2.9 | If application_type = CLOSURE → set dispatch list = MTO only |
| 3.2.2.10 | Write finalized dispatch list to endorsement staging area |
| 3.2.2.11 | Forward dispatch list to 3.2.3 Clearance Document Package Preparation |

## Table 9
| ID | Sub-Process / Step | Description |
| --- | --- | --- |
| 5.1.1 | Business Data Retrieval | Read the approved application from 4.0. Retrieve gross sales/capital amount, line of business, and business category from the Application Record and Business Record to serve as inputs for bracket lookup. |
| 5.1.2 | Tax Bracket Lookup | Read the Fee & Tax Record to identify the applicable tax bracket based on the declared gross sales or capital amount. Each bracket defines the tax base (taxbase), penalty rate, and applicable period. |
| 5.1.3 | Fee Item Computation | For each applicable fee item in the tax bracket (e.g. Business Tax, Mayor's Permit Fee, Sanitation Fee, Zoning Fee), compute the individual fee amount using the formula: Fee Amount = taxbase × rate + penalty. Aggregate all fee items to produce the total assessment. |
| 5.1.4 | Payment Category Assignment | Determine the payment category (Annual, Quarterly, Monthly) based on the MTO-provided Assessment of Fees and the business owner's declared preference or business type rules. Annual pays full amount; Quarterly splits into 4; Monthly splits into 12 installments. |
| 5.1.5 | Assessment Output | Compile the full fee breakdown and payment category. Forward to 5.2 Payment Schedule Generation. Send Fee Details to MTO for recording. |

## Table 10
| Dir | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 4.0 Approval | 5.1.1 Business Data Retrieval | Approved Application (New/Renewal/Closure) |
| INPUT | Municipality Treasury Office | 5.1.1 Business Data Retrieval | Assessment of Fees (MTO-provided rates) |
| READ | D2 Application Record | 5.1.1 Business Data Retrieval | Gross Sales / Capital Amount, Business Category |
| READ | D4 Business Record | 5.1.1 Business Data Retrieval | Line of Business (LOB Code, LOB Description) |
| READ | D7 Fee & Tax Record | 5.1.2 Tax Bracket Lookup | Tax Brackets (taxbase, penalty, period) by LOB |
| READ | D7 Fee & Tax Record | 5.1.3 Fee Item Computation | Fee Items (item_name, item_price, category) |
| OUTPUT | 5.1.4 Payment Category Assignment | 5.2 Payment Schedule Generation | Computed Fee Total + Payment Category |
| OUTPUT | 5.1.5 Assessment Output | Municipality Treasury Office | Fee Details for Recording (New/Renewal/Closure) |

## Table 11
| Step ID | Atomic Action |
| --- | --- |
| 5.1.2.1 | Retrieve declared gross sales or capital investment from Application Record |
| 5.1.2.2 | Retrieve the line of business (LOB) code from Business Record |
| 5.1.2.3 | Query Fee & Tax Record for all tax brackets matching the LOB code |
| 5.1.2.4 | Compare declared gross sales/capital against each bracket range (e.g. ₱0–₱50K, ₱50K–₱150K, ₱150K–₱500K, ₱500K+) |
| 5.1.2.5 | Select the matching bracket and retrieve: tax_code, taxbase, penalty rate, period |
| 5.1.2.6 | Flag bracket result for use in 5.1.3 |
| 5.1.3.1 | Read all fee items linked to the matched tax bracket from Fee & Tax Record |
| 5.1.3.2 | For each fee item: compute amount = item_price (or taxbase × applicable rate) |
| 5.1.3.3 | Apply penalty if application is filed after the deadline |
| 5.1.3.4 | Compute sub-total for each fee category: Business Tax, Mayor's Permit Fee, Sanitation Fee, Zoning Fee, BFP Fee, etc. |
| 5.1.3.5 | Sum all fee item amounts to produce gross total assessment |
| 5.1.3.6 | Apply payment category divisor: Annual ÷ 1, Quarterly ÷ 4, Monthly ÷ 12 |
| 5.1.3.7 | Output: fee breakdown per item, gross total, and per-installment amount |
| 5.1.3.8 | Forward to 5.1.4 Payment Category Assignment |

## Table 12
| ID | Sub-Process / Step | Description |
| --- | --- | --- |
| 6.1.1 | Statement of Account Display | Retrieve the Tax Order of Payment (TOP) from the Fee & Tax Record. Display the itemized Statement of Account to the Business Owner, showing per-installment amount due, deadline, and payment reference number. |
| 6.1.2 | GCash QR Code Generation | Generate a GCash QR code embedded with the payment amount, reference number, and merchant details. Display the QR code to the Business Owner for scanning via the GCash mobile application. |
| 6.1.3 | QR Scan & Payment Submission | Business Owner scans the QR code using their GCash app and confirms the payment on their mobile device. The system receives the payment submission event and records the transaction reference. |
| 6.1.4 | Payment Document Submission for Verification | Business Owner submits proof of payment document (GCash receipt screenshot or transaction reference). System receives and stores the submitted document for MTO verification in 6.2. |
| 6.1.5 | Payment Request Forwarding | Read the existing Payment Record to check for prior payments on this application. Forward the Payment Request (amount, reference, submitted document) to the Payment Gateway for processing. |

## Table 13
| Dir | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 5.0 Fee Assessment | 6.1.1 Statement of Account Display | Fee Details (amount, schedule, reference) |
| READ | D7 Fee & Tax Record | 6.1.1 Statement of Account Display | TOP Details (amount_paid, deadline_top, status) |
| OUTPUT | 6.1.2 GCash QR Code Generation | Business Owner | GCash QR Code (amount, reference, merchant) |
| INPUT | Business Owner | 6.1.3 QR Scan & Payment Submission | GCash QR Scan Confirmation (transaction reference) |
| INPUT | Business Owner | 6.1.4 Payment Document Submission | Proof of Payment Document (GCash receipt / reference) |
| READ | D8 Payment Record | 6.1.5 Payment Request Forwarding | Existing Payment Record (prior payments, status) |
| OUTPUT | 6.1.5 Payment Request Forwarding | Payment Gateway | Payment Request (amount, reference, method = GCash) |

## Table 14
| Step ID | Atomic Action |
| --- | --- |
| 6.1.2.1 | Retrieve payment amount due for current installment from Fee & Tax Record |
| 6.1.2.2 | Retrieve payment reference number (TOP ID or application ID) |
| 6.1.2.3 | Retrieve merchant GCash account details (merchant name, GCash number) |
| 6.1.2.4 | Compose QR code payload: amount + reference + merchant identifier |
| 6.1.2.5 | Encode payload into GCash-compatible QR format (EMVCo QR standard) |
| 6.1.2.6 | Display QR code on screen with payment amount and deadline visible |
| 6.1.3.1 | Wait for Business Owner to scan QR code using GCash mobile app |
| 6.1.3.2 | Business Owner confirms payment amount on GCash app and taps Pay |
| 6.1.3.3 | GCash app sends payment confirmation event to system |
| 6.1.3.4 | Receive transaction reference number from GCash confirmation |
| 6.1.3.5 | Record transaction reference in session for forwarding to Payment Gateway |
| 6.1.3.6 | Prompt Business Owner to submit proof of payment document |

## Table 15
| ID | Sub-Process / Step | Description |
| --- | --- | --- |
| 6.2.1 | Gateway Confirmation Receipt | Receive the Payment Confirmation from the Payment Gateway. Extract: transaction reference, confirmed amount, payment method (GCash), timestamp, and official receipt number. |
| 6.2.2 | Submitted Document Review | Retrieve the proof-of-payment document submitted by the Business Owner in 6.1.4. Cross-check the document reference number and amount against the Gateway Confirmation data. |
| 6.2.3 | MTO Payment Verification | Send Payment Details (confirmed amount, OR number, transaction reference, submitted document) to the Municipality Treasury Office for official verification. Receive Payment Verification response from MTO confirming authenticity of the receipt. |
| 6.2.4 | Payment Record Write | Upon MTO verification, write the complete payment transaction or installment record to the Payment Record: amount paid, date paid, payment method, transaction reference, official receipt number, and status = Paid. |

## Table 16
| Dir | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | Payment Gateway | 6.2.1 Gateway Confirmation Receipt | Payment Confirmation (ref, amount, OR number, timestamp) |
| INPUT | Business Owner | 6.2.2 Submitted Document Review | Proof of Payment Document (GCash receipt) |
| OUTPUT | 6.2.3 MTO Payment Verification | Municipality Treasury Office | Payment Details (amount, OR number, reference, document) |
| INPUT | Municipality Treasury Office | 6.2.3 MTO Payment Verification | Payment Verification (Verified / Discrepancy Found) |
| WRITE | 6.2.4 Payment Record Write | D8 Payment Record | Payment Transaction / Installment Record (status = Paid) |

## Table 17
| Step ID | Atomic Action |
| --- | --- |
| 6.2.3.1 | Compose payment verification package: transaction reference, confirmed amount, OR number, GCash receipt document |
| 6.2.3.2 | Submit verification package to Municipality Treasury Office |
| 6.2.3.3 | MTO checks OR number against official receipt registry |
| 6.2.3.4 | MTO cross-checks confirmed amount vs assessed fee in Fee & Tax Record |
| 6.2.3.5 | MTO cross-checks GCash reference vs GCash merchant settlement record |
| 6.2.3.6 | If discrepancy found → MTO returns Discrepancy Notice; system flags payment as Disputed |
| 6.2.3.7 | If verified → MTO returns Payment Verification approval |
| 6.2.4.1 | Retrieve current payment installment entry from Payment Record |
| 6.2.4.2 | Update status = Paid, date_paid = today, official_receipt_no = MTO-confirmed OR number |
| 6.2.4.3 | Set transaction_reference = GCash reference from 6.2.1 |
| 6.2.4.4 | If payment_category = Quarterly or Monthly → compute remaining installments and update balance |
| 6.2.4.5 | If all installments settled → update overall application payment_status = Fully Paid |
| 6.2.4.6 | Write finalized record to Payment Record |
| 6.2.4.7 | Forward to 6.3 Receipt & Notification |

## Table 18
| ID | Sub-Process / Step | Description |
| --- | --- | --- |
| 7.2.1 | Permit Document Preparation | Read the Permit Record to retrieve permit subscription details (permit number, issue date, expiry date, business name, signed_by field). Prepare the formatted printed business permit document ready for signing. |
| 7.2.2 | Permit Submission to Mayor's Office | Send the Printed Business Permit to the Mayor's Office. Record the submission date and pending-signature status in the Permit Record. |
| 7.2.3 | Mayor's Office Review & Signing | The Mayor's Office reviews the prepared permit document. If the Mayor approves, the permit is signed. If the Mayor holds or returns the permit, a hold notice is sent back to the BPLO. |
| 7.2.4 | Signed Permit Receipt | Receive the Signed Business Permit from the Mayor's Office. Update the Permit Record with the signed_by field (Mayor's name and signature date) and update permit_status = Signed. Forward to 7.3 Document Issuance. |

## Table 19
| Dir | From | To | Data Flow Label |
| --- | --- | --- | --- |
| READ | D9 Permit Record | 7.2.1 Permit Document Preparation | Permit Subscription Details (permit_number, dates, business name) |
| OUTPUT | 7.2.2 Permit Submission | Mayor's Office | Printed Business Permit (New/Renewal) |
| INPUT | Mayor's Office | 7.2.3 Mayor's Office Review & Signing | Signing Decision (Approved / Held / Returned) |
| INPUT | Mayor's Office | 7.2.4 Signed Permit Receipt | Signed Business Permit (New/Renewal) |
| WRITE | 7.2.4 Signed Permit Receipt | D9 Permit Record | signed_by, permit_status = Signed, date_signed |
| OUTPUT | 7.2.4 Signed Permit Receipt | 7.3 Document Issuance | Signed Permit ready for issuance |

## Table 20
| Step ID | Atomic Action |
| --- | --- |
| 7.2.3.1 | Mayor's Office receives Printed Business Permit from BPLO |
| 7.2.3.2 | Mayor's Office verifies permit details: business name, address, permit number, LOB, validity dates |
| 7.2.3.3 | Mayor's Office cross-checks that all required clearances are complete in Department & Clearance Record |
| 7.2.3.4 | Mayor's Office cross-checks that payment is fully verified in Payment Record |
| 7.2.3.5 | If all checks pass → Mayor signs the permit document |
| 7.2.3.6 | If any check fails or discretionary hold → Mayor returns permit to BPLO with hold remarks |
| 7.2.3.7 | If held → BPLO resolves the issue and resubmits to 7.2.2 |
| 7.2.3.8 | If signed → permit forwarded to 7.2.4 Signed Permit Receipt |

## Table 21
| ID | Sub-Process / Step | Description |
| --- | --- | --- |
| 8.2.1 | Notification Event Classification | Receive Permit Issuance Details from 7.4. Classify the notification event type: (a) Permit Issued — New/Renewal, (b) Closure Certificate Issued, (c) Installment Payment Due Reminder, (d) Application Status Update. Each event maps to a specific SMS template. |
| 8.2.2 | SMS Template Composition | Select the appropriate SMS template based on the classified event type. Populate the template with dynamic fields: business name, permit number, amount due, due date, claiming instructions, or status details. Compose the final SMS message. |
| 8.2.3 | SMS Sending | Send the composed Notification Data to the SMS Provider with the recipient phone number from the User Account Record. Receive the SMS delivery confirmation or failure report from the SMS Provider. |
| 8.2.4 | Installment Reminder Scheduling | For New/Renewal applications with Quarterly or Monthly payment categories: receive the SMS Reminder trigger from the SMS Provider at each installment due date. Re-compose and re-send the installment reminder SMS to the Business Owner. |
| 8.2.5 | Notification Log Write | Write the notification record to the Notification & Location Record: notification type, message content, date sent, delivery status, and SMS reference number from the provider. |

## Table 22
| Dir | From | To | Data Flow Label |
| --- | --- | --- | --- |
| INPUT | 7.0 Permit Issuance | 8.2.1 Notification Event Classification | Permit Issuance Details (type, status, dates) |
| READ | D1 User Account Record | 8.2.2 SMS Template Composition | Recipient Phone Number |
| OUTPUT | 8.2.3 SMS Sending | SMS Provider | Notification Data (phone, message, reference) |
| INPUT | SMS Provider | 8.2.3 SMS Sending | Delivery Confirmation / Failure Report |
| INPUT | SMS Provider | 8.2.4 Installment Reminder Scheduling | SMS Reminder Trigger (due date, application ref) |
| OUTPUT | 8.2.4 Installment Reminder Scheduling | Business Owner | Installment Due Reminder SMS (New/Renewal) |
| OUTPUT | 8.2.3 SMS Sending | Business Owner | SMS Notification (permit ready / status / closure) |
| WRITE | 8.2.5 Notification Log Write | D10 Notification & Location Record | Notification Record (type, message, date, delivery status, SMS ref) |

## Table 23
| Step ID | Atomic Action |
| --- | --- |
| 8.2.1.1 | Read application_type from Permit Issuance Details (New / Renewal / Closure) |
| 8.2.1.2 | Read issuance_outcome (Permit Issued / Closure Certificate Issued / Payment Received) |
| 8.2.1.3 | If application_type = New AND permit_status = Signed → classify as EVENT_PERMIT_ISSUED_NEW |
| 8.2.1.4 | If application_type = Renewal AND permit_status = Signed → classify as EVENT_PERMIT_ISSUED_RENEWAL |
| 8.2.1.5 | If application_type = Closure AND closure_cert_issued = true → classify as EVENT_CLOSURE_CERT_ISSUED |
| 8.2.1.6 | If payment_category = Quarterly or Monthly AND installment_due_date approaching → classify as EVENT_INSTALLMENT_REMINDER |
| 8.2.1.7 | Forward classified event type to 8.2.2 |
| 8.2.2.1 | Select SMS template matching classified event type |
| 8.2.2.2 | For EVENT_PERMIT_ISSUED_NEW/RENEWAL: populate template with business name, permit number, claiming location, office hours |
| 8.2.2.3 | For EVENT_CLOSURE_CERT_ISSUED: populate template with business name, certificate reference, claiming instructions |
| 8.2.2.4 | For EVENT_INSTALLMENT_REMINDER: populate template with amount due, due date, payment reference, GCash details |
| 8.2.2.5 | Retrieve recipient phone number from User Account Record by Account ID |
| 8.2.2.6 | Finalize composed SMS message (max 160 characters per SMS segment) |
| 8.2.2.7 | Forward composed message and phone number to 8.2.3 SMS Sending |
