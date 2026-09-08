# JALANIN — User Flow Specification

> **JALANIN — Jalan Aman, Kota Nyaman.**

Dokumen ini mendefinisikan alur interaksi pengguna JALANIN dari pertama kali membuka aplikasi sampai laporan dipantau dan diselesaikan.

**Version:** MVP V1  
**Status:** Product Definition  
**Scope:** Web Application

---

# 1. User Flow Principles

User flow JALANIN harus:

- sederhana,
- jelas,
- minim langkah yang tidak perlu,
- mobile-friendly,
- transparan,
- memiliki feedback pada setiap proses penting,
- dan tidak memaksa user login hanya untuk melihat informasi publik.

Core principle:

```text
DISCOVER
   ↓
REPORT
   ↓
ANALYZE
   ↓
VERIFY
   ↓
PRIORITIZE
   ↓
MONITOR
   ↓
RESOLVE
```

---

# 2. User Roles

JALANIN memiliki tiga role utama:

```text
Guest
User
Admin
```

## Guest

Dapat melihat informasi publik tanpa login.

## User

Dapat membuat laporan dan melakukan verifikasi komunitas.

## Admin

Dapat melakukan review, moderasi, dan mengubah status laporan.

---

# 3. Global Application Flow

```text
                    JALANIN
                       │
             ┌─────────┴─────────┐
             ↓                   ↓
           Guest               Login
             │                   │
             ↓                   ↓
       Public Experience      User Dashboard
             │                   │
             │             ┌─────┴─────┐
             │             ↓           ↓
             │        Create Report  My Reports
             │             │
             │             ↓
             │        AI Analysis
             │             │
             │             ↓
             │        Submit Report
             │             │
             └─────────────┤
                           ↓
                     Public Map
                           │
                           ↓
                     Report Detail
                           │
                           ↓
                 Community Verification
                           │
                           ↓
                    Priority Score
                           │
                           ↓
                    Admin Dashboard
                           │
                           ↓
                    Status Update
                           │
                           ↓
                       Resolved
```

---

# 4. Guest User Flow

## 4.1 Landing → Public Map

```text
Landing Page
     ↓
Scroll / CTA
     ↓
Public Map
```

Guest tidak perlu login untuk melihat kondisi jalan.

---

## 4.2 Guest → Search Location

```text
Public Map
     ↓
Search Location
     ↓
Select Location
     ↓
Map Recenter
     ↓
Nearby Reports
```

---

## 4.3 Guest → Report Detail

```text
Public Map
     ↓
Click Marker
     ↓
Report Preview
     ↓
Report Detail
```

Guest dapat melihat:

- foto,
- jenis kerusakan,
- severity,
- lokasi,
- status,
- priority score,
- community verification.

---

## 4.4 Guest → Login

Jika guest ingin membuat laporan:

```text
Public Map / Landing
       ↓
Create Report CTA
       ↓
Login / Register
```

Setelah berhasil login:

```text
Login
 ↓
Create Report
```

---

# 5. Registration Flow

```text
Landing
   ↓
Register
   ↓
Enter Name
   ↓
Enter Email
   ↓
Enter Password
   ↓
Validation
   ↓
Firebase Authentication
   ↓
Create User Profile
   ↓
Success
   ↓
User Dashboard
```

## Error Flow

```text
Invalid Email
     ↓
Show Error
     ↓
Fix Input
```

```text
Email Already Exists
     ↓
Show Error
     ↓
Login
```

```text
Network Error
     ↓
Show Error
     ↓
Retry
```

---

# 6. Login Flow

```text
Login Page
    ↓
Email + Password
    ↓
Validation
    ↓
Firebase Authentication
    ↓
Check Role
    │
    ├── User → User Dashboard
    │
    └── Admin → Admin Dashboard
```

---

# 7. Logout Flow

```text
Dashboard
   ↓
Logout
   ↓
Firebase Sign Out
   ↓
Session Cleared
   ↓
Landing / Login
```

---

# 8. Create Report — Main Flow

Create Report adalah core user flow JALANIN.

```text
User Dashboard
      ↓
Create Report
      ↓
Upload Photo
      ↓
Preview Photo
      ↓
Get GPS
      ↓
Location Preview
      ↓
Analyze with AI
      ↓
AI Result
      ↓
User Review
      ↓
Confirm
      ↓
Submit Report
      ↓
Success
      ↓
Report Detail
```

---

# 9. Create Report — Step 1: Upload Photo

```text
Create Report
     ↓
Select / Take Photo
     ↓
Validate File
     │
     ├── Invalid → Error
     │
     └── Valid
           ↓
       Preview
```

Validation:

- file type,
- file size,
- image readability.

User harus dapat melihat preview sebelum melanjutkan.

---

# 10. Create Report — Step 2: GPS

```text
Photo Ready
     ↓
Get My Location
     ↓
Browser Permission
     │
     ├── Granted
     │      ↓
     │   Get Coordinates
     │
     └── Denied
            ↓
       Explain Permission
            ↓
          Retry
```

Data:

```text
Latitude
Longitude
Timestamp
```

Optional:

```text
Address
Location Label
```

User harus melihat lokasi sebelum submit.

---

# 11. Create Report — Step 3: AI Analysis

```text
Photo + GPS
     ↓
Analyze
     ↓
Upload / Process Image
     ↓
AI Vision
     ↓
Structured Result
```

Output:

```json
{
  "damage_type": "pothole",
  "severity": "high",
  "confidence": 0.94,
  "description": "Large pothole affecting the road surface."
}
```

UI harus menampilkan state:

```text
Analyzing road condition...
```

---

# 12. AI Error Flow

Jika AI gagal:

```text
Analyze
  ↓
AI Error
  ↓
Show Explanation
  ↓
Retry
```

Contoh error:

```text
AI service unavailable.
Please try again.
```

Jika retry gagal berkali-kali, sistem tidak boleh membuat hasil AI palsu.

---

# 13. AI Result Review Flow

```text
AI Result
    ↓
User Reviews
    │
    ├── Accept
    │      ↓
    │   Continue
    │
    └── Edit
           ↓
      Modify Result
           ↓
         Confirm
```

User dapat memeriksa:

```text
Damage Type
Severity
Description
```

AI confidence ditampilkan sebagai informasi.

---

# 14. Submit Report Flow

```text
Review
  ↓
Confirm Report
  ↓
Validate All Data
  ↓
Upload / Save
  ↓
Create Firestore Record
  ↓
Calculate Initial Priority
  ↓
Success
```

Required:

```text
Photo
Location
Damage Type
Severity
Description
Reporter
Timestamp
```

---

# 15. Submit Error Flow

```text
Submit
  ↓
Validation Failed
  ↓
Highlight Missing Data
  ↓
User Fixes Data
  ↓
Submit Again
```

Jika database gagal:

```text
Submit
  ↓
Database Error
  ↓
Show Error
  ↓
Retry
```

Sistem harus menghindari pembuatan report ganda akibat retry.

---

# 16. Report Created Flow

Setelah berhasil:

```text
Report Created
      ↓
Success Message
      ↓
Report Detail
```

Contoh:

```text
Report submitted successfully.

Your report is now visible on JALANIN.
```

Status awal:

```text
REPORTED
```

---

# 17. My Reports Flow

```text
User Dashboard
     ↓
My Reports
     ↓
Report List
     ↓
Select Report
     ↓
Report Detail
```

Report list menampilkan:

```text
Photo
Damage
Severity
Status
Priority
Created At
```

---

# 18. Report Tracking Flow

```text
My Reports
    ↓
Open Report
    ↓
View Status
    ↓
View Timeline
```

Contoh:

```text
02 Sep
Reported
    ↓
03 Sep
Verified
    ↓
05 Sep
In Progress
    ↓
10 Sep
Resolved
```

---

# 19. Community Verification Flow

User membuka laporan:

```text
Report Detail
      ↓
Community Verification
      ↓
Question:
"Apakah kerusakan ini masih ada?"
      │
      ├── 👍 Masih Ada
      │
      └── 👎 Sudah Diperbaiki
```

Setelah vote:

```text
Submit Vote
    ↓
Save Verification
    ↓
Recalculate Verification
    ↓
Recalculate Priority
    ↓
Update UI
```

---

# 20. Existing Verification Flow

Jika user sudah pernah memberikan vote:

```text
Report Detail
      ↓
Existing Vote
      ↓
Show Current Choice
```

User dapat mengubah pilihannya sesuai aturan.

Contoh:

```text
Your verification:
👍 Masih ada

Change verification
```

---

# 21. Duplicate Vote Prevention

```text
User
 ↓
Verify Report
 ↓
Check Existing Verification
 │
 ├── None
 │     ↓
 │   Create Vote
 │
 └── Exists
       ↓
    Update Vote
```

User tidak boleh membuat verification baru berkali-kali untuk report yang sama.

---

# 22. Verification Summary Flow

Setelah ada vote:

```text
Verification Data
      ↓
Count Still Exists
      ↓
Count Resolved
      ↓
Calculate Confidence
      ↓
Display Summary
```

Contoh:

```text
23 masih ada
2 sudah diperbaiki

Confidence: 92%
```

---

# 23. Priority Score Flow

Priority score dihitung berdasarkan:

```text
Severity
Community Confidence
Risk Factor
```

Flow:

```text
Report Created
      ↓
Initial Score
      ↓
Community Verification
      ↓
Verification Changes
      ↓
Recalculate Score
```

Formula MVP:

```text
Priority Score =
(Severity × 0.50)
+
(Community Confidence × 0.30)
+
(Risk Factor × 0.20)
```

---

# 24. Public Map Flow

```text
Open Public Map
      ↓
Load Valid Reports
      ↓
Render Markers
      ↓
User Selects Marker
      ↓
Report Preview
      ↓
Report Detail
```

Map harus menangani:

```text
Loading
Empty
Error
Success
```

---

# 25. Map Filter Flow

```text
Public Map
    ↓
Filter
    │
    ├── Severity
    ├── Status
    └── Damage Type
    ↓
Apply Filter
    ↓
Update Markers
```

Filter dapat ditambahkan setelah map core stabil.

---

# 26. Admin Login Flow

```text
Login
  ↓
Firebase Authentication
  ↓
Check Role
  ↓
Admin?
 │
 ├── YES → Admin Dashboard
 │
 └── NO  → User Dashboard
```

Admin page tidak boleh hanya dilindungi oleh UI.

Authorization harus dilakukan pada backend/database rules.

---

# 27. Admin Dashboard Flow

```text
Admin Dashboard
      ↓
Overview
      ↓
Report Management
      ↓
Select Report
```

Overview menampilkan:

```text
Total Reports
Reported
Verified
In Progress
Resolved
High Priority
```

---

# 28. Admin Review Flow

```text
Admin Dashboard
      ↓
Reports
      ↓
Select Report
      ↓
Review
```

Admin melihat:

```text
Photo
Location
AI Analysis
User Correction
Community Verification
Priority Score
Status History
```

---

# 29. Admin Verification Flow

```text
Report
  ↓
Review Evidence
  ↓
Check AI
  ↓
Check Community
  ↓
Admin Decision
   │
   ├── Valid
   │      ↓
   │   VERIFIED
   │
   └── Invalid
          ↓
        REJECT
```

Jika MVP tidak menggunakan status `REJECTED` sebagai status utama, rejection dapat disimpan sebagai moderation outcome terpisah.

---

# 30. Admin Status Update Flow

```text
Admin Report Detail
       ↓
Change Status
       ↓
Select New Status
       ↓
Validate Transition
       ↓
Save
       ↓
Create Status History
       ↓
Update Report
       ↓
Success
```

Normal flow:

```text
REPORTED
   ↓
VERIFIED
   ↓
IN_PROGRESS
   ↓
RESOLVED
```

---

# 31. Status Transition Rules

Default MVP:

| Current | Allowed Next |
|---|---|
| REPORTED | VERIFIED |
| VERIFIED | IN_PROGRESS |
| IN_PROGRESS | RESOLVED |
| RESOLVED | — |

Admin dapat memiliki override tertentu jika diperlukan untuk koreksi data, tetapi harus tercatat.

---

# 32. Status Timeline Flow

Setiap perubahan:

```text
Status Change
     ↓
Create History Record
     ↓
Save:
- Previous Status
- New Status
- Actor
- Timestamp
```

Timeline:

```text
Latest
  ↓
Previous
  ↓
Older
```

---

# 33. Resolved Flow

```text
IN_PROGRESS
      ↓
Admin Marks Resolved
      ↓
RESOLVED
      ↓
Update Timeline
      ↓
Public Map Marker
      ↓
Green / Resolved
```

Community verification dapat tetap digunakan sebagai data historis.

---

# 34. Complete Reporter Journey

```text
Landing
  ↓
Register
  ↓
Login
  ↓
Dashboard
  ↓
Create Report
  ↓
Upload Photo
  ↓
Get GPS
  ↓
AI Analysis
  ↓
Review
  ↓
Submit
  ↓
Report Created
  ↓
Public Map
  ↓
Community Verification
  ↓
Priority Score
  ↓
Admin Review
  ↓
Status Updated
  ↓
Resolved
```

---

# 35. Complete Community Journey

```text
Landing
  ↓
Public Map
  ↓
Find Report
  ↓
Report Detail
  ↓
Login
  ↓
Verify
  ↓
Submit Vote
  ↓
Verification Updated
  ↓
Priority Updated
```

---

# 36. Complete Admin Journey

```text
Admin Login
     ↓
Dashboard
     ↓
High Priority Reports
     ↓
Open Report
     ↓
Review Photo
     ↓
Review AI
     ↓
Review Community
     ↓
Check Priority
     ↓
Update Status
     ↓
Status History
```

---

# 37. Error & Recovery Principles

Setiap flow penting harus memiliki:

```text
Loading
Success
Error
Retry
Empty State
```

Contoh:

```text
GPS
├── Loading
├── Success
├── Permission Denied
├── Location Unavailable
└── Retry
```

```text
AI
├── Loading
├── Success
├── API Error
├── Invalid Response
└── Retry
```

```text
Submit
├── Loading
├── Success
├── Validation Error
├── Database Error
└── Retry
```

---

# 38. Mobile Flow Principle

Karena laporan kemungkinan dibuat langsung dari jalan, create report harus dirancang mobile-first.

Target:

```text
Open
 ↓
Take Photo
 ↓
Get Location
 ↓
Analyze
 ↓
Review
 ↓
Submit
```

Semakin sedikit friction semakin baik.

---

# 39. Navigation Model

## Guest

```text
Home
Map
Reports
Login
```

## User

```text
Home
Map
Create Report
Dashboard
My Reports
Profile
```

## Admin

```text
Dashboard
Reports
Priority
Profile
```

---

# 40. Flow Security Rules

Security tidak boleh hanya bergantung pada navigation.

Contoh:

```text
User mencoba:
GET /admin
      ↓
Authorization Check
      ↓
Not Admin
      ↓
403 / Redirect
```

Create report:

```text
Guest
 ↓
Create Report API
 ↓
Authentication Check
 ↓
401 Unauthorized
```

Verification:

```text
Guest
 ↓
Verification API
 ↓
Authentication Check
 ↓
401 Unauthorized
```

---

# 41. Core Flow Definition of Done

JALANIN MVP harus berhasil menyelesaikan:

## Reporter

```text
Login
→ Create Report
→ Photo
→ GPS
→ AI
→ Review
→ Submit
```

## Public

```text
Open Map
→ See Report
→ Open Detail
→ See Status
```

## Community

```text
Login
→ Open Report
→ Verify
→ Submit Vote
```

## Priority

```text
Report
→ Severity
→ Community
→ Risk
→ Priority Score
```

## Admin

```text
Login
→ Dashboard
→ Review
→ Update Status
```

## Final

```text
User
→ See Updated Status
→ Report Becomes Resolved
```

---

# 42. Recommended Implementation Order

Setelah user flow selesai, implementasi sebaiknya mengikuti:

```text
01 Authentication
        ↓
02 User Profile / Roles
        ↓
03 Report Data Model
        ↓
04 Photo Upload
        ↓
05 GPS
        ↓
06 AI Analysis
        ↓
07 Create Report
        ↓
08 Report Detail
        ↓
09 Public Map
        ↓
10 Community Verification
        ↓
11 Priority Score
        ↓
12 Admin Dashboard
        ↓
13 Status Management
        ↓
14 Timeline
        ↓
15 Landing Page Polish
        ↓
16 Testing
```

---

# 43. Final Product Flow

Core JALANIN:

```text
                   JALANIN
                      │
                      ↓
                FIND A PROBLEM
                      │
                      ↓
                 TAKE PHOTO
                      │
                      ↓
                   GET GPS
                      │
                      ↓
                 AI ANALYSIS
                      │
                      ↓
                USER REVIEWS
                      │
                      ↓
                  REPORT
                      │
                      ↓
                PUBLIC MAP
                      │
                      ↓
              COMMUNITY VERIFY
                      │
                      ↓
              PRIORITY SCORE
                      │
                      ↓
               ADMIN REVIEW
                      │
                      ↓
                IN PROGRESS
                      │
                      ↓
                  RESOLVED
```

> **Core principle:** JALANIN harus membuat proses dari menemukan kerusakan sampai memantau penyelesaiannya terasa sederhana, transparan, dan dapat dipercaya.
