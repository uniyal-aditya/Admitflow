# AdmitFlow — Phase 1 Migration Report

Generated: 2026-09-29T04:40:52.434Z · Mode: **apply** · Target session year: 2026
DB reachable: **true**

## 1. Source dataset found
| Record | Count |
|---|---|
| Colleges | 74 |
| Notices | 20 |
| Course rows | 228 |
| Timeline colleges | 33 |
| Timeline stages | 196 |
| dataSources entries | 35 |

## 2. Planned target rows
| Table | Rows |
|---|---|
| Source | 135 |
| Program | 27 |
| Branch | 15 |
| College | 74 |
| CourseOffering | 228 |
| FeeStructure | 228 |
| AdmissionNotice | 20 |
| AdmissionNoticeDate | 64 |
| LegacyTimelineStage | 196 |

## 2b. Applied to DB
| Key | Writes (create+update) |
|---|---|
| academicSessions | 2 |
| programs | 27 |
| branches | 15 |
| sources | 135 |
| colleges | 74 |
| attributions | 396 |
| offerings | 228 |
| fees | 228 |
| admissionNotices | 20 |
| noticeDates | 64 |
| timelineStages | 196 |

## 3. Fields with missing information (left NULL — never defaulted)
| Field | Affected |
|---|---|
| College.website missing | 0  |
| College contact missing | 56 |
| College established missing | 0 |
| College accreditation missing | 43 |
| College without any dataset source URL | 39 amrapali-institute-management-haldwani, amrapali-university, apb-govt-post-graduate-college-agastyamuni, college-of-nursing-aiims-rishikesh, doon-business-school, dronacharya-group … |
| Courses without fees | 0 |
| Courses without seats | 0 |
| Courses without eligibility | 0 |
| Notices without officialUrl | 0 |
| Notices whose pdfUrl is a dead path (public/notices does not exist) | 20 |

## 4. Structure transformations required
- College.courses JSON[] → CourseOffering(+Program/Branch/FeeStructure) rows
- course.name free text → (Program, Branch) classification + residual reported
- course.fees ₹ integer → FeeStructure.amountPaise (tuition, per_year)
- course.duration text → durationYears numeric + durationLabel verbatim
- Notice.publishedDate/lastDate strings → DateTime (publishedAt / AdmissionNoticeDate rows)
- Notice.importantDates+deadlines JSON[] → AdmissionNoticeDate rows (kind: important_date|deadline)
- Notice.status 'active|upcoming|expired' → EditorialStatus 'published' (time-derived status removed; re-derived in Phase 4)
- collegeTimelines stages → LegacyTimelineStage rows (rawStageKey/rawStatus preserved losslessly)
- dataSources{collegeId: urls} → Source rows attributed per college

## 5. Provenance policy applied
- ALL imported facts are marked `unverified`. Nothing was labeled "AI extracted" — the dataset predates any AI extraction pipeline.
- NO source URLs were invented. College official-website URLs and dataset-declared notice URLs are stored verbatim; pattern-generated `admission.<domain>` portals were DROPPED, not copied.
- Every imported college row and attributed URL points at one internal Source record documenting the bulk-import provenance.

## 6. Unmapped / unclassified tokens (preserved, not guessed)
- Program names not matching any rule: none
- Branch tokens not matching any alias: none

## 7. Conflicts & duplicates
- Duplicate college ids in source: none
- Duplicate notice ids in source: none
- Conflicts: none

## 8. Row-mapping trace (first 40)
| Source | Target |
|---|---|
| aiims-rishikesh.courses.MBBS | CourseOffering(program=mbbs, branch=null) |
| aiims-rishikesh.courses.B.Sc. Nursing | CourseOffering(program=bsc-nursing, branch=null) [residual: "B.Sc."] |
| aiims-rishikesh.courses.MD/MS | CourseOffering(program=md, branch=null) |
| amrapali-institute-management-haldwani.courses.BBA | CourseOffering(program=bba, branch=null) |
| amrapali-institute-management-haldwani.courses.BCA | CourseOffering(program=bca, branch=null) |
| amrapali-institute-management-haldwani.courses.MBA | CourseOffering(program=mba, branch=null) |
| amrapali-university.courses.B.Tech CSE | CourseOffering(program=btech, branch=cse) [residual: "CSE"] |
| amrapali-university.courses.BCA | CourseOffering(program=bca, branch=null) |
| amrapali-university.courses.BBA | CourseOffering(program=bba, branch=null) |
| amrapali-university.courses.MBA | CourseOffering(program=mba, branch=null) |
| apb-govt-post-graduate-college-agastyamuni.courses.BA | CourseOffering(program=ba, branch=null) |
| apb-govt-post-graduate-college-agastyamuni.courses.B.Sc. | CourseOffering(program=bsc, branch=null) |
| apb-govt-post-graduate-college-agastyamuni.courses.MA | CourseOffering(program=ma, branch=null) |
| bfit.courses.B.Tech CSE | CourseOffering(program=btech, branch=cse) [residual: "CSE"] |
| bfit.courses.BCA | CourseOffering(program=bca, branch=null) |
| bfit.courses.BBA | CourseOffering(program=bba, branch=null) |
| bfit.courses.B.Sc. Nursing | CourseOffering(program=bsc-nursing, branch=null) [residual: "B.Sc."] |
| college-of-nursing-aiims-rishikesh.courses.B.Sc. Nursing | CourseOffering(program=bsc-nursing, branch=null) [residual: "B.Sc."] |
| college-of-nursing-aiims-rishikesh.courses.M.Sc. Nursing | CourseOffering(program=msc-nursing, branch=null) |
| devbhoomi-uk.courses.B.Tech CSE | CourseOffering(program=btech, branch=cse) [residual: "CSE"] |
| devbhoomi-uk.courses.BCA | CourseOffering(program=bca, branch=null) |
| devbhoomi-uk.courses.BBA | CourseOffering(program=bba, branch=null) |
| devbhoomi-uk.courses.MBA | CourseOffering(program=mba, branch=null) |
| dit-university.courses.B.Tech CSE | CourseOffering(program=btech, branch=cse) [residual: "CSE"] |
| dit-university.courses.B.Tech ME | CourseOffering(program=btech, branch=me) [residual: "ME"] |
| dit-university.courses.BCA | CourseOffering(program=bca, branch=null) |
| dit-university.courses.MBA | CourseOffering(program=mba, branch=null) |
| doon-business-school.courses.BBA | CourseOffering(program=bba, branch=null) |
| doon-business-school.courses.MBA | CourseOffering(program=mba, branch=null) |
| doon-business-school.courses.BCA | CourseOffering(program=bca, branch=null) |
| doon-medical-college.courses.MBBS | CourseOffering(program=mbbs, branch=null) |
| doon-university.courses.B.Tech CSE | CourseOffering(program=btech, branch=cse) [residual: "CSE"] |
| doon-university.courses.BCA | CourseOffering(program=bca, branch=null) |
| doon-university.courses.B.Sc. | CourseOffering(program=bsc, branch=null) |
| doon-university.courses.MBA | CourseOffering(program=mba, branch=null) |
| doon-university.courses.LLB | CourseOffering(program=llb, branch=null) |
| dronacharya-group.courses.B.Tech CSE | CourseOffering(program=btech, branch=cse) [residual: "CSE"] |
| dronacharya-group.courses.B.Tech ME | CourseOffering(program=btech, branch=me) [residual: "ME"] |
| dronacharya-group.courses.BCA | CourseOffering(program=bca, branch=null) |
| gautam-buddha-chikitsa-mahavidyalaya.courses.MBBS | CourseOffering(program=mbbs, branch=null) |

## 9. Apply instructions (run when DATABASE_URL is reachable)
```bash
npx prisma migrate dev --name phase1_normalized_domain   # dev: create migration from schema
npx prisma migrate deploy                                # prod-safe apply of existing migrations
npm run data:seed                                        # idempotent seed (this script, without --dry-run)
npm run data:verify                                      # post-apply consistency assertions
```

Rollback: the migration is additive — `npx prisma migrate resolve --rolled-back` + drop of the new tables restores the pre-Phase-1 DB. `src/data/*` remains untouched and continues to back the live UI.