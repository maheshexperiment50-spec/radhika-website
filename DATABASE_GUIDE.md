# Radhika IT College Management System - Database Documentation (डेटाबेस गाइड)

इस वेबसाइट (Radhika IT College Management System) के लिए **100% Complete & Production-Ready Relational Database** तैयार कर दिया गया है। 

यह डेटाबेस **SQLite** (लोकल Node.js/Website बैकएंड) और **MySQL / MariaDB / phpMyAdmin** (XAMPP/Live Server) दोनों के लिए पूरी तरह अनुकूलित (Compatible) है।

---

## 📁 मुख्य डेटाबेस फाइलें (Database Files)

| फ़ाइल का नाम | विवरण |
| :--- | :--- |
| **`database.sql`** | **Complete Universal SQL Script** - इसे सीधे **phpMyAdmin**, MySQL Workbench, MariaDB या PostgreSQL में 1-क्लिक से इम्पोर्ट कर सकते हैं। |
| **`data/radhika.db`** | **Ready SQLite Database** - इसमें सभी 10 टेबल्स, 3 एनालिटिक्स व्यूज (Views), इंडेक्स और फुल डमी/सीड डेटा पहले से लोड है। |
| **`scripts/setup-complete-db.js`** | **Database Automation Script** - जब भी डेटाबेस को फिर से रीसेट या नया बनाना हो, यह स्क्रिप्ट डेटाबेस और `database.sql` दोनों तैयार कर देती है। |

---

## 🗄️ डेटाबेस संरचना (Database Tables & Schema)

डेटाबेस में कुल **10 टेबल्स** और **3 रिपोर्टिंग व्यूज (Views)** बनाए गए हैं:

### 1. `centers` (कॉलेज ब्रांचेस / सेंटर्स)
- **`id`** (PK): सेंटर का यूनिक कोड (जैसे `C001`, `C002`)
- **`center_code`**: सेंटर कोड (`MCHQ01`, `CTC02`, आदि)
- **`center_name`**: सेंटर का नाम (Main Campus, City Tech Center, आदि)
- **`address`**: सेंटर का पूरा पता
- **`head_name`**: सेंटर हेड/डायरेक्टर का नाम
- **`contact`**: संपर्क मोबाइल नंबर
- **`email`**: ईमेल आईडी
- **`status`**: 'active' / 'inactive'

### 2. `courses` (पाठ्यक्रम / कोर्सेज)
- **`id`** (PK): कोर्स आईडी (`COURSE-001`, आदि)
- **`code`**: कोर्स कोड (`DCA`, `ADCA`, `PGDCA`, `O-Level`, `CCC`, `BA`, `PY-FS`, `DTP`)
- **`name`**: कोर्स का पूरा नाम
- **`duration`**: अवधि (3 Months, 6 Months, 12 Months)
- **`fee`**: मानक फीस (Standard Course Fee)
- **`description`**: कोर्स का विवरण व सिलेबस
- **`eligibility`**: आवश्यक योग्यता (10th, 12th, Graduate)
- **`status`**: 'active' / 'inactive'

### 3. `staff` (स्टाफ और फैकल्टी)
- **`id`** (PK): स्टाफ आईडी (`S001`, `S002`, आदि)
- **`name`**: स्टाफ का पूरा नाम
- **`login_id`**: लॉगिन यूजरनेम (Unique)
- **`password`**: लॉगिन पासवर्ड (डिफ़ॉल्ट: `123`)
- **`role`**: रोल (`super_admin`, `center_admin`, `staff`)
- **`center_id`** (FK): किस सेंटर से संबंधित हैं
- **`phone`**: मोबाइल नंबर
- **`email`**: ईमेल आईडी
- **`designation`**: पद (Managing Director, Center Head, Counselor, आदि)
- **`status`**: 'active' / 'inactive'

### 4. `students` (छात्र-छात्राएं)
- **`id`** (PK): एडमिशन / रोल नंबर (जैसे `RAD-2026-001`)
- **`student_name`**: छात्र का नाम
- **`father_name`**: पिता का नाम
- **`mother_name`**: माता का नाम
- **`course`**: नामांकित कोर्स (`ADCA`, `PGDCA`, आदि)
- **`mobile`**: मोबाइल नंबर
- **`email`**: ईमेल आईडी
- **`address`**: आवासीय पता
- **`admission_date`**: प्रवेश तिथि
- **`fees`**: तय की गई कुल कोर्स फीस
- **`center_id`** (FK): सेंटर आईडी
- **`status`**: 'active' / 'completed' / 'dropped'

### 5. `fees` (फीस रसीदें / किश्तें)
- **`id`** (PK): इनवॉइस नंबर (`INV-10001`, आदि)
- **`receipt_no`**: रसीद संख्या (`RCP-2026-001`)
- **`student_id`** (FK): छात्र की आईडी
- **`amount`**: जमा की गई राशि (₹)
- **`payment_date`**: भुगतान की तिथि
- **`payment_mode`**: भुगतान माध्यम (`Cash`, `UPI`, `Card`, `Net Banking`, `Cheque`)
- **`remark`**: विवरण (Admission fee, 2nd installment, आदि)
- **`collected_by`**: फीस जमा करने वाले स्टाफ की आईडी

### 6. `expenses` (खर्चे / व्यय)
- **`id`** (PK): व्यय आईडी (`EXP-5001`)
- **`center_id`** (FK): किस सेंटर का खर्चा है
- **`title`**: खर्चे का शीर्षक (बिजली बिल, लैब रखरखाव, किराया, आदि)
- **`amount`**: खर्च की गई राशि (₹)
- **`date`**: खर्च की तिथि
- **`category`**: श्रेणी (`Electricity`, `Rent`, `Office Supplies`, `Lab Maintenance`, `Internet`, `Marketing`)
- **`payment_mode`**: भुगतान माध्यम
- **`bill_no`**: बिल/वाउचर नंबर

### 7. `attendance` (उपस्थिति रजिस्टर)
- **`id`** (PK): उपस्थिति रिकॉर्ड आईडी (`ATT-1774000100`)
- **`center_id`** (FK): सेंटर आईडी
- **`course`**: कोर्स का नाम
- **`date`**: तारीख
- **`records_json`**: छात्रवार उपस्थिति डेटा (`{"RAD-2026-001": "present"}`)

### 8. `notices` (सूचना पट्ट / कॉलेज नोटिस)
- **`id`** (PK): नोटिस आईडी (`N001`)
- **`title`**: शीर्षक (Summer Vacation, Exam Announcement, आदि)
- **`message`**: सूचना संदेश
- **`date`**: जारी होने की तारीख
- **`target`**: किसके लिए है (`all`, `super_admin`, `center_admin`, `staff`)
- **`is_active`**: 1 (सक्रिय) / 0 (निष्क्रिय)

### 9. `audit_logs` (सिस्टम लॉग्स)
- **`id`**: ऑटो-इंक्रीमेंट आईडी
- **`user_id`**: किस यूजर ने क्रिया की
- **`action`**: क्या काम हुआ
- **`entity`**: किस टेबल/रिकॉर्ड में हुआ
- **`details`**: अतिरिक्त विवरण
- **`created_at`**: टाइमस्टैम्प

### 10. `app_data` (हाइब्रिड की-वैल्यू स्टोरेज)
- वेबसाइट के फ्रंटएंड और बैकएंड के त्वरित डेटा सिंक के लिए बैकवर्ड कम्पैटिबिलिटी लेयर।

---

## 📊 तैयार किए गए विशेष एनालिटिक्स व्यूज (SQL Views)

डेटाबेस में ऑटोमैटिक कैलकुलेशन के लिए 3 बहुत उपयोगी Views पहले से बने हुए हैं:

1. **`v_student_fee_summary`**:
   - छात्र का नाम, कोर्स, कुल फीस, अब तक जमा फीस, **बाकी फीस (Balance Due)** और **भुगतान स्थिति ('Fully Paid', 'Partial', 'Unpaid')** अपने आप निकालता है।
2. **`v_center_financial_summary`**:
   - प्रत्येक सेंटर में कुल छात्र, कुल फीस कलेक्शन, कुल खर्चे और **शुद्ध लाभ (Net Profit/Balance)** दिखाता है।
3. **`v_course_enrollments`**:
   - किस कोर्स में कितने छात्र नामांकित हैं और कोर्स-वार कितना राजस्व प्राप्त हुआ।

---

## 🚀 डेटाबेस का उपयोग कैसे करें (How to Run / Use)

### विकल्प 1: Node.js / SQLite के साथ (Local Development)
डेटाबेस पहले से `data/radhika.db` में तैयार है।
यदि कभी भी डेटाबेस को दोबारा फ्रेश बनाना हो:
```bash
npm run db:setup
```
वेबसाइट का बैकएंड शुरू करने के लिए:
```bash
npm run serve
# या
node server.js
```
वेबसाइट आपके ब्राउज़र में `http://localhost:3000` पर चल जाएगी।

### विकल्प 2: MySQL / XAMPP / phpMyAdmin में इम्पोर्ट करना
1. XAMPP खोलें और **Apache** तथा **MySQL** स्टार्ट करें।
2. ब्राउज़र में `http://localhost/phpmyadmin` खोलें।
3. **Import** टैब पर जाएं।
4. `database.sql` फाइल को चुनें।
5. **Go / Import** बटन दबाएं। पूरा डेटाबेस टेबल्स, डेटा और व्यूज सहित लोड हो जाएगा!

---

## 🔑 डिफ़ॉल्ट लॉगिन क्रेडेंशियल्स (Default Login Credentials)

| Role | Username (Login ID) | Password | Center |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `123` | All Centers (HQ) |
| **Center Admin (City)** | `centerhead1` | `123` | City Tech Center (C002) |
| **Center Admin (Rural)** | `centerhead2` | `123` | Rural IT Center (C003) |
| **Staff / Counselor** | `staff1` | `123` | Main Campus (C001) |
| **Staff / Cashier** | `staff2` | `123` | City Tech Center (C002) |
