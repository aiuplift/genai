# Module 5 — Sample Datasets

Three datasets for the Data Analysis & Visualisation exercises.

## 1. Clean Sales Data (`01-clean-sales-data.csv`)
- **18 rows** — Monthly revenue by region (London, Manchester, Edinburgh)
- **Use for:** Formula generation exercises (percentage change, conditional averages, counts)
- **Columns:** Month, Region, Revenue, Expenses, Headcount, New_Clients
- **Data quality:** Clean, no issues. Ready to analyse immediately.

## 2. Messy Client Data (`02-messy-client-data.csv`)
- **16 rows** — Client onboarding records with deliberate quality issues
- **Use for:** Data cleaning exercise (the "Diagnose This Dataset" practical)
- **Known issues:**
  - Duplicate rows (Acme Corp appears twice identically)
  - Near-duplicates (Beta Ltd, Zeta Partners — same data, different formats)
  - Mixed date formats (DD/MM/YYYY, YYYY-MM-DD, "March 2024", "22 Apr 2024", "10th January 2024")
  - Inconsistent region capitalisation (london, LONDON, London, MANCHESTER, leeds)
  - Missing values (Gamma Inc revenue, Eta/Lambda emails)
  - Mixed currency symbols ($, £, and plain numbers)
  - Inconsistent status capitalisation (Active, active, ACTIVE)

## 3. Large Operations Data (`03-large-operations-data.csv`)
- **45 rows** — Employee performance data across 3 quarters, 5 departments
- **Use for:** Analysis exercise, Board Room Challenge, executive summary writing
- **Columns:** Employee_ID, Department, Quarter, Tasks_Completed, Hours_Worked, Satisfaction_Score, Training_Hours, Remote_Days, Overtime_Hours, Performance_Rating
- **Interesting patterns to discover:**
  - Marketing consistently has highest satisfaction scores
  - Operations has highest overtime hours
  - Two employees (EMP004, EMP015) are persistent "Needs Improvement"
  - Training hours correlate with satisfaction scores
  - Remote days correlate negatively with overtime
  - Q3 shows improvement trends across most employees

## How to Use

### For students:
- Download or copy-paste into a spreadsheet (Google Sheets, Excel)
- Paste into AI chat tools for analysis
- Remember Module 4: these are SAMPLE datasets — safe to use with AI tools (no real PII)

### For the facilitator:
- Dataset 1 → Formula exercises (slides 11-12)
- Dataset 2 → Cleaning exercise (slide 17)
- Dataset 3 → Analysis, verification, and Board Room Challenge (slides 22-28)
