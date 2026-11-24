# AdmitFlow data audit (Phase 3), 24 Nov 2026

## What the seed data (src/data/colleges.ts) contains

| Check | Result |
|---|---|
| Colleges | 74, no duplicate ids or websites |
| Districts covered | All 13. Dehradun has 39. Rudraprayag, Bageshwar, Champawat and Pithoragarh have 1 each |
| Missing accreditation | 43 of 74 |
| Missing principal | 72 of 74 |
| Missing phone and email | 56 of 74 |
| Courses | 228, and every one has non-zero seats and fees (see below) |
| "admission.<website>" portal links | 73 of 74 are the college domain with `admission.` added. They look generated. Your Phase 5 migration already dropped this column, so they do not reach the database |
| Outdated body "MCI" | AIIMS Rishikesh and SRHU |
| Non-official sources in `dataSources` | 2 (a Careers360 article, and a Collegedunia page for Doon University that actually points at UKTech) |

All 228 courses have seats and fees filled in. Research on AIIMS Rishikesh found its MBBS fee
(₹16,000 a year in the data) and nursing seats (60) do not match any source, and listing sites disagree
with each other. Treat the seat and fee numbers for the other colleges as unverified until each is checked.

## Researched and loaded in Phase 3 (src/data/verified-facts.ts)

| College | What | Source type |
|---|---|---|
| AIIMS Rishikesh | Website, admission phone and email. Outdated "MCI" removed, unverified "NAAC A+" hidden | Official PDF on aiimsrishikesh.edu.in |
| IIT Roorkee (new) | Established 1847, Roorkee, Haridwar district, website | gov.in notice, WHED, Grace's Guide |
| NIT Uttarakhand (new) | Established 2009, Srinagar (Garhwal), Pauri Garhwal, website | gov.in compendium, official NITUK pages |

Loaded as "researched, awaiting admin confirmation". Nothing counts as verified on the public site until an admin confirms it.

## Still to research (queue, not yet verified)

These are well-known Uttarakhand institutions that are not in the 74. They come from general knowledge, so
confirm each one on its official site before adding it.

| Institution | Likely district |
|---|---|
| IIM Kashipur | Udham Singh Nagar |
| IIIT Kotdwar | Pauri Garhwal |
| G.B. Pant University of Agriculture and Technology, Pantnagar | Udham Singh Nagar |
| H.N.B. Garhwal University | Pauri Garhwal |
| Gurukula Kangri (Deemed University) | Haridwar |
| Dev Sanskriti Vishwavidyalaya | Haridwar |
| Uttarakhand Ayurved University | Dehradun |
| Forest Research Institute (Deemed University) | Dehradun |
| Kumaon Engineering College, Dwarahat | Almora |
| Graphic Era Hill University | Dehradun, Bhimtal |
| IMS Unison University | Dehradun |
| Government PG colleges in Pithoragarh, Champawat and Rudraprayag | those districts |

## Course-level problems (fix in the admin course editor)

See `courseIssues` in src/data/verified-facts.ts.
