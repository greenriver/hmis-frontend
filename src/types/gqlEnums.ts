export const AssessmentLevelEnum = {
  CRISIS_NEEDS_ASSESSMENT: '(1) Crisis Needs Assessment',
  HOUSING_NEEDS_ASSESSMENT: '(2) Housing Needs Assessment',
};
export const AssessmentTypeEnum = {
  IN_PERSON: '(3) In Person',
  PHONE: '(1) Phone',
  VIRTUAL: '(2) Virtual',
};
export const DOBDataQualityEnum = {
  DOB_APPROXIMATE_OR_PARTIAL_DOB_REPORTED:
    '(2) Approximate or partial DOB reported',
  DOB_CLIENT_DOESN_T_KNOW: "(8) Client doesn't know",
  DOB_CLIENT_REFUSED: '(9) Client refused',
  DOB_DATA_NOT_COLLECTED: '(99) Data not collected',
  DOB_FULL_DOB_REPORTED: '(1) Full DOB reported',
};
export const EthnicityEnum = {
  ETHNICITY_HISPANIC_LATIN_A_O_X_: '(1) Hispanic/Latin(a)(o)(x)',
  ETHNICITY_NON_HISPANIC_NON_LATIN_A_O_X_:
    '(0) Non-Hispanic/Non-Latin(a)(o)(x)',
  ETHNICITY_NOT_COLLECTED: '(99) Data not collected',
  ETHNICITY_REFUSED: '(9) Client refused',
  ETHNICITY_UNKNOWN: "(8) Client doesn't know",
};
export const EventTypeEnum = {
  PROBLEM_SOLVING_DIVERSION_RAPID_RESOLUTION_INTERVENTION_OR_SERVICE:
    '(2) Problem Solving/Diversion/Rapid Resolution intervention or service',
  REFERRAL_TO_A_HOUSING_STABILITY_VOUCHER:
    '(18) Referral to a Housing Stability Voucher',
  REFERRAL_TO_EMERGENCY_ASSISTANCE_FLEX_FUND_FURNITURE_ASSISTANCE:
    '(16) Referral to emergency assistance/flex fund/furniture assistance',
  REFERRAL_TO_EMERGENCY_HOUSING_VOUCHER_EHV_:
    '(17) Referral to Emergency Housing Voucher (EHV)',
  REFERRAL_TO_EMERGENCY_SHELTER_BED_OPENING:
    '(10) Referral to Emergency Shelter bed opening',
  REFERRAL_TO_HOUSING_NAVIGATION_PROJECT_OR_SERVICES:
    '(7) Referral to Housing Navigation project or services',
  REFERRAL_TO_JOINT_TH_RRH_PROJECT_UNIT_RESOURCE_OPENING:
    '(12) Referral to Joint TH-RRH project/unit/resource opening',
  REFERRAL_TO_NON_CONTINUUM_SERVICES_INELIGIBLE_FOR_CONTINUUM_SERVICES:
    '(8) Referral to Non-continuum services: Ineligible for continuum services',
  REFERRAL_TO_NON_CONTINUUM_SERVICES_NO_AVAILABILITY_IN_CONTINUUM_SERVICES:
    '(9) Referral to Non-continuum services: No availability in continuum services',
  REFERRAL_TO_OTHER_PH_PROJECT_UNIT_RESOURCE_OPENING:
    '(15) Referral to Other PH project/unit/resource opening',
  REFERRAL_TO_POST_PLACEMENT_FOLLOW_UP_CASE_MANAGEMENT:
    '(5) Referral to Post-placement/ follow-up case management',
  REFERRAL_TO_PREVENTION_ASSISTANCE_PROJECT:
    '(1) Referral to Prevention Assistance project',
  REFERRAL_TO_PSH_PROJECT_RESOURCE_OPENING:
    '(14) Referral to PSH project resource opening',
  REFERRAL_TO_RRH_PROJECT_RESOURCE_OPENING:
    '(13) Referral to RRH project resource opening',
  REFERRAL_TO_SCHEDULED_COORDINATED_ENTRY_CRISIS_NEEDS_ASSESSMENT:
    '(3) Referral to scheduled Coordinated Entry Crisis Needs Assessment',
  REFERRAL_TO_SCHEDULED_COORDINATED_ENTRY_HOUSING_NEEDS_ASSESSMENT:
    '(4) Referral to scheduled Coordinated Entry Housing Needs Assessment',
  REFERRAL_TO_STREET_OUTREACH_PROJECT_OR_SERVICES:
    '(6) Referral to Street Outreach project or services',
  REFERRAL_TO_TRANSITIONAL_HOUSING_BED_UNIT_OPENING:
    '(11) Referral to Transitional Housing bed/unit opening',
};
export const GenderEnum = {
  GENDER_A_GENDER_OTHER_THAN_SINGULARLY_FEMALE_OR_MALE_E_G_NON_BINARY_GENDERFLUID_AGENDER_CULTURALLY_SPECIFIC_GENDER_:
    '(4) A gender other than singularly female or male (e.g., non-binary, genderfluid, agender, culturally specific gender)',
  GENDER_CLIENT_DOESN_T_KNOW: "(8) Client doesn't know",
  GENDER_CLIENT_REFUSED: '(9) Client refused',
  GENDER_DATA_NOT_COLLECTED: '(99) Data not collected',
  GENDER_FEMALE: '(0) Female',
  GENDER_MALE: '(1) Male',
  GENDER_QUESTIONING: '(6) Questioning',
  GENDER_TRANSGENDER: '(5) Transgender',
};
export const NameDataQualityEnum = {
  NAME_CLIENT_DOESN_T_KNOW: "(8) Client doesn't know",
  NAME_CLIENT_REFUSED: '(9) Client refused',
  NAME_DATA_NOT_COLLECTED: '(99) Data not collected',
  NAME_FULL_NAME_REPORTED: '(1) Full name reported',
  NAME_PARTIAL_STREET_NAME_OR_CODE_NAME_REPORTED:
    '(2) Partial, street name, or code name reported',
};
export const PATHReferralOutcomeEnum = {
  ATTAINED: '(1) Attained',
  NOT_ATTAINED: '(2) Not attained',
  UNKNOWN: '(3) Unknown',
};
export const PrioritizationStatusEnum = {
  NOT_PLACED_ON_PRIORITIZATION_LIST: '(2) Not placed on prioritization list',
  PLACED_ON_PRIORITIZATION_LIST: '(1) Placed on prioritization list',
};
export const ProbSolDivRRResultEnum = {
  DATA_NOT_COLLECTED: '(99) Data not collected',
  NO: '(0) No',
  YES: '(1) Yes',
};
export const ProjectTypeEnum = {
  CE: 'Coordinated Entry',
  DAY_SHELTER: 'Day Shelter',
  ES: 'Emergency Shelter',
  OPH: 'Permanent Housing Only',
  OTHER: 'Other',
  PH: 'Permanent Housing',
  PREVENTION: 'Homelessness Prevention',
  PSH: 'Permanent Supportive Housing',
  RRH: 'Rapid Re-Housing',
  SERVICES_ONLY: 'Services Only',
  SH: 'Safe Haven',
  SO: 'Street Outreach',
  TH: 'Transitional Housing',
};
export const RaceEnum = {
  RACE_AMERICAN_INDIAN_ALASKA_NATIVE_OR_INDIGENOUS:
    '(AmIndAKNative) American Indian, Alaska Native, or Indigenous',
  RACE_ASIAN_OR_ASIAN_AMERICAN: '(Asian) Asian or Asian American',
  RACE_BLACK_AFRICAN_AMERICAN_OR_AFRICAN:
    '(BlackAfAmerican) Black, African American, or African',
  RACE_NATIVE_HAWAIIAN_OR_PACIFIC_ISLANDER:
    '(NativeHIPacific) Native Hawaiian or Pacific Islander',
  RACE_NOT_COLLECTED: '(99) Data not collected',
  RACE_REFUSED: '(9) Client refused',
  RACE_UNKNOWN: "(8) Client doesn't know",
  RACE_WHITE: '(White) White',
};
export const RecordTypeEnum = {
  BED_NIGHT: '(200) Bed night',
  C2_MOVING_ON_ASSISTANCE_PROVIDED: '(300) C2 Moving On Assistance Provided',
  HOPWA_FINANCIAL_ASSISTANCE: '(151) HOPWA financial assistance',
  HOPWA_SERVICE: '(143) HOPWA service',
  HUD_VASH_OTH_VOUCHER_TRACKING: '(210) HUD-VASH OTH voucher tracking',
  PATH_REFERRAL: '(161) PATH referral',
  PATH_SERVICE: '(141) PATH service',
  RHY_REFERRAL: '(162) RHY referral',
  RHY_SERVICE_CONNECTIONS: '(142) RHY service connections',
  SSVF_FINANCIAL_ASSISTANCE: '(152) SSVF financial assistance',
  SSVF_SERVICE: '(144) SSVF service',
};
export const ReferralCaseManageAfterEnum = {
  DATA_NOT_COLLECTED: '(99) Data not collected',
  NO: '(0) No',
  YES: '(1) Yes',
};
export const ReferralResultEnum = {
  SUCCESSFUL_REFERRAL_CLIENT_ACCEPTED:
    '(1) Successful referral: client accepted',
  UNSUCCESSFUL_REFERRAL_CLIENT_REJECTED:
    '(2) Unsuccessful referral: client rejected',
  UNSUCCESSFUL_REFERRAL_PROVIDER_REJECTED:
    '(3) Unsuccessful referral: provider rejected',
};
export const RelationshipToHoHEnum = {
  CHILD: '(2) Child',
  DATA_NOT_COLLECTED: '(99) Data not collected',
  OTHER_RELATIVE: '(4) Other relative',
  SELF_HEAD_OF_HOUSEHOLD_: '(1) Self (head of household)',
  SPOUSE_OR_PARTNER: '(3) Spouse or partner',
  UNRELATED_HOUSEHOLD_MEMBER: '(5) Unrelated household member',
};
export const SSNDataQualityEnum = {
  SSN_APPROXIMATE_OR_PARTIAL_SSN_REPORTED:
    '(2) Approximate or partial SSN reported',
  SSN_CLIENT_DOESN_T_KNOW: "(8) Client doesn't know",
  SSN_CLIENT_REFUSED: '(9) Client refused',
  SSN_DATA_NOT_COLLECTED: '(99) Data not collected',
  SSN_FULL_SSN_REPORTED: '(1) Full SSN reported',
};
export const ServiceSubTypeProvidedEnum = {
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__CHILD_CARE:
    '(144) SSVF service – (4) Assistance obtaining/coordinating other public benefits – (12) Child care',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__DAILY_LIVING_SERVICES:
    '(144) SSVF service – (4) Assistance obtaining/coordinating other public benefits – (2) Daily living services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__FIDUCIARY_AND_REPRESENTATIVE_PAYEE_SERVICES:
    '(144) SSVF service – (4) Assistance obtaining/coordinating other publicbenefits – (6) Fiduciary and representative payee services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__HEALTH_CARE_SERVICES:
    '(144) SSVF service – (4) Assistance obtaining/coordinating other public benefits – (1) Health care services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__HOUSING_COUNSELING:
    '(144) SSVF service – (4) Assistance obtaining/coordinating other public benefits – (13) Housing counseling',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__INCOME_SUPPORT_SERVICES:
    '(144) SSVF service – (4) Assistance obtaining/coordinating other public benefits – (5) Income support services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES___CHILD_SUPPORT:
    '(144) SSVF service – (4) Assistance obtaining/coordinating other public benefits – (7) Legal services - child support',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES___EVICTION_PREVENTION:
    '(144) SSVF service – (4) Assistance obtaining/coordinating other publicbenefits – (8) Legal services - eviction prevention',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES___OTHER:
    '(144) SSVF service – (4) Assistance obtaining/coordinating other public benefits – (11) Legal services - other',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES___OUTSTANDING_FINES_AND_PENALTIES:
    '(144) SSVF service – (4) Assistance obtaining/coordinating other publicbenefits – (9) Legal services - outstanding fines and penalties',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES___RESTORE_ACQUIRE_DRIVER_S_LICENSE:
    "(144) SSVF service – (4) Assistance obtaining/coordinating other publicbenefits – (10) Legal services - restore / acquire driver's license",
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__PERSONAL_FINANCIAL_PLANNING_SERVICES:
    '(144) SSVF service – (4) Assistance obtaining/coordinating other publicbenefits – (3) Personal financial planning services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__TRANSPORTATION_SERVICES:
    '(144) SSVF service – (4) Assistance obtaining/coordinating other public benefits – (4) Transportation services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__EDUCATIONAL_ASSISTANCE:
    '(144) SSVF service – (3) Assistance obtaining VA benefits – (3) Educational assistance',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__EMPLOYMENT_AND_TRAINING_SERVICES:
    '(144) SSVF service – (3) Assistance obtaining VA benefits – (2) Employment and training services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__HEALTH_CARE_SERVICES:
    '(144) SSVF service – (3) Assistance obtaining VA benefits – (4) Health care services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__VA_VOCATIONAL_AND_REHABILITATION_COUNSELING:
    '(144) SSVF service – (3) Assistance obtaining VA benefits – (1) VA vocational and rehabilitation counseling',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__CHILD_CARE:
    '(144) SSVF service – (5) Direct provision of other public benefits – (10) Child care',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__FIDUCIARY_AND_REPRESENTATIVE_PAYEE_SERVICES:
    '(144) SSVF service – (5) Direct provision of other public benefits – (4) Fiduciary and representative payee services',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__HOUSING_COUNSELING:
    '(144) SSVF service – (5) Direct provision of other public benefits – (11) Housing counseling',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__INCOME_SUPPORT_SERVICES:
    '(144) SSVF service – (5) Direct provision of other public benefits – (3) Income support services',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES___CHILD_SUPPORT:
    '(144) SSVF service – (5) Direct provision of other public benefits – (5) Legal services - child support',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES___EVICTION_PREVENTION:
    '(144) SSVF service – (5) Direct provision of other public benefits – (6) Legal services - eviction prevention',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES___OTHER:
    '(144) SSVF service – (5) Direct provision of other public benefits – (9) Legal services - other',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES___OUTSTANDING_FINES_AND_PENALTIES:
    '(144) SSVF service – (5) Direct provision of other public benefits – (7) Legal services - outstanding fines and penalties',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES___RESTORE_ACQUIRE_DRIVER_S_LICENSE:
    "(144) SSVF service – (5) Direct provision of other public benefits – (8) Legalservices - restore / acquire driver's license",
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__PERSONAL_FINANCIAL_PLANNING_SERVICES:
    '(144) SSVF service – (5) Direct provision of other public benefits – (1) Personal financial planning services',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__TRANSPORTATION_SERVICES:
    '(144) SSVF service – (5) Direct provision of other public benefits – (2) Transportation services',
};
export const ServiceTypeProvidedEnum = {
  BED_NIGHT__BED_NIGHT: '(200) Bed night – (200) BedNight',
  C2_MOVING_ON_ASSISTANCE_PROVIDED__FINANCIAL_ASSISTANCE_FOR_MOVING_ON_E_G_SECURITY_DEPOSIT_MOVING_EXPENSES_:
    '(300) C2 Moving On Assistance Provided – (2) Financial assistance for Moving On (e.g., security deposit, moving expenses)',
  C2_MOVING_ON_ASSISTANCE_PROVIDED__HOUSING_REFERRAL_PLACEMENT:
    '(300) C2 Moving On Assistance Provided – (4) Housing referral/placement',
  C2_MOVING_ON_ASSISTANCE_PROVIDED__NON_FINANCIAL_ASSISTANCE_FOR_MOVING_ON_E_G_HOUSING_NAVIGATION_TRANSITION_SUPPORT_:
    '(300) C2 Moving On Assistance Provided – (3) Non-financial assistance forMoving On (e.g., housing navigation, transition support)',
  C2_MOVING_ON_ASSISTANCE_PROVIDED__OTHER_PLEASE_SPECIFY_:
    '(300) C2 Moving On Assistance Provided – (5) Other (please specify)',
  C2_MOVING_ON_ASSISTANCE_PROVIDED__SUBSIDIZED_HOUSING_APPLICATION_ASSISTANCE:
    '(300) C2 Moving On Assistance Provided – (1) Subsidized housing application assistance',
  HOPWA_FINANCIAL_ASSISTANCE__MORTGAGE_ASSISTANCE:
    '(151) HOPWA financial assistance – (7) Mortgage assistance',
  HOPWA_FINANCIAL_ASSISTANCE__RENTAL_ASSISTANCE:
    '(151) HOPWA financial assistance – (1) Rental assistance',
  HOPWA_FINANCIAL_ASSISTANCE__SECURITY_DEPOSITS:
    '(151) HOPWA financial assistance – (2) Security deposits',
  HOPWA_FINANCIAL_ASSISTANCE__UTILITY_DEPOSITS:
    '(151) HOPWA financial assistance – (3) Utility deposits',
  HOPWA_FINANCIAL_ASSISTANCE__UTILITY_PAYMENTS:
    '(151) HOPWA financial assistance – (4) Utility payments',
  HOPWA_SERVICE__ADULT_DAY_CARE_AND_PERSONAL_ASSISTANCE:
    '(143) HOPWA service – (1) Adult day care and personal assistance',
  HOPWA_SERVICE__CASE_MANAGEMENT: '(143) HOPWA service – (2) Case management',
  HOPWA_SERVICE__CHILD_CARE: '(143) HOPWA service – (3) Child care',
  HOPWA_SERVICE__CRIMINAL_JUSTICE_LEGAL_SERVICES:
    '(143) HOPWA service – (4) Criminal justice/legal services',
  HOPWA_SERVICE__EDUCATION: '(143) HOPWA service – (5) Education',
  HOPWA_SERVICE__EMPLOYMENT_AND_TRAINING_SERVICES:
    '(143) HOPWA service – (6) Employment and training services',
  HOPWA_SERVICE__FOOD_MEALS_NUTRITIONAL_SERVICES:
    '(143) HOPWA service – (7) Food/meals/nutritional services',
  HOPWA_SERVICE__HEALTH_MEDICAL_CARE:
    '(143) HOPWA service – (8) Health/medical care',
  HOPWA_SERVICE__LIFE_SKILLS_TRAINING:
    '(143) HOPWA service – (9) Life skills training',
  HOPWA_SERVICE__MENTAL_HEALTH_CARE_COUNSELING:
    '(143) HOPWA service – (10) Mental health care/counseling',
  HOPWA_SERVICE__OTHER_HOPWA_FUNDED_SERVICE:
    '(143) HOPWA service – (14) Other HOPWA funded service',
  HOPWA_SERVICE__OUTREACH_AND_OR_ENGAGEMENT:
    '(143) HOPWA service – (11) Outreach and/or engagement',
  HOPWA_SERVICE__SUBSTANCE_ABUSE_SERVICES_TREATMENT:
    '(143) HOPWA service – (12) Substance abuse services/treatment',
  HOPWA_SERVICE__TRANSPORTATION: '(143) HOPWA service – (13) Transportation',
  HUD_VASH_OTH_VOUCHER_TRACKING__OTHER:
    '(210) HUD-VASH OTH voucher tracking – (12) Other',
  HUD_VASH_OTH_VOUCHER_TRACKING__REFERRAL_PACKAGE_FORWARDED_TO_PHA:
    '(210) HUD-VASH OTH voucher tracking – (1) Referral package forwarded to PHA',
  HUD_VASH_OTH_VOUCHER_TRACKING__VETERAN_EXITED___FAMILY_MAINTAINED_THE_VOUCHER:
    '(210) HUD-VASH OTH voucher tracking – (10) Veteran exited - family maintained the voucher',
  HUD_VASH_OTH_VOUCHER_TRACKING__VETERAN_EXITED___PRIOR_TO_EVER_RECEIVING_A_VOUCHER:
    '(210) HUD-VASH OTH voucher tracking – (11) Veteran exited - prior to ever receiving a voucher',
  HUD_VASH_OTH_VOUCHER_TRACKING__VETERAN_EXITED___VOUCHER_WAS_RETURNED:
    '(210) HUD-VASH OTH voucher tracking – (9) Veteran exited - voucher was returned',
  HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_DENIED_BY_PHA:
    '(210) HUD-VASH OTH voucher tracking – (2) Voucher denied by PHA',
  HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_IN_USE___VETERAN_MOVED_INTO_HOUSING:
    '(210) HUD-VASH OTH voucher tracking – (5) Voucher in use - veteran moved into housing',
  HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_ISSUED_BY_PHA:
    '(210) HUD-VASH OTH voucher tracking – (3) Voucher issued by PHA',
  HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_REVOKED_OR_EXPIRED:
    '(210) HUD-VASH OTH voucher tracking – (4) Voucher revoked or expired',
  HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_WAS_ADMINISTRATIVELY_ABSORBED_BY_NEW_PHA:
    '(210) HUD-VASH OTH voucher tracking – (7) Voucher was administratively absorbed by new PHA',
  HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_WAS_CONVERTED_TO_HOUSING_CHOICE_VOUCHER:
    '(210) HUD-VASH OTH voucher tracking – (8) Voucher was converted to Housing Choice Voucher',
  HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_WAS_PORTED_LOCALLY:
    '(210) HUD-VASH OTH voucher tracking – (6) Voucher was ported locally',
  PATH_REFERRAL__COMMUNITY_MENTAL_HEALTH:
    '(161) PATH referral – (1) Community mental health',
  PATH_REFERRAL__EDUCATIONAL_SERVICES:
    '(161) PATH referral – (5) Educational services',
  PATH_REFERRAL__EMPLOYMENT_ASSISTANCE:
    '(161) PATH referral – (9) Employment assistance',
  PATH_REFERRAL__HOUSING_SERVICES: '(161) PATH referral – (6) Housing services',
  PATH_REFERRAL__INCOME_ASSISTANCE:
    '(161) PATH referral – (8) Income assistance',
  PATH_REFERRAL__JOB_TRAINING: '(161) PATH referral – (4) Job training',
  PATH_REFERRAL__MEDICAL_INSURANCE:
    '(161) PATH referral – (10) Medical insurance',
  PATH_REFERRAL__PERMANENT_HOUSING:
    '(161) PATH referral – (7) Permanent housing',
  PATH_REFERRAL__PRIMARY_HEALTH_DENTAL_CARE:
    '(161) PATH referral – (3) Primary health/dental care',
  PATH_REFERRAL__SUBSTANCE_USE_TREATMENT:
    '(161) PATH referral – (2) Substance use treatment',
  PATH_REFERRAL__TEMPORARY_HOUSING:
    '(161) PATH referral – (11) Temporary housing',
  PATH_SERVICE__CASE_MANAGEMENT: '(141) PATH service – (6) Case management',
  PATH_SERVICE__CLINICAL_ASSESSMENT:
    '(141) PATH service – (14) Clinical assessment',
  PATH_SERVICE__COMMUNITY_MENTAL_HEALTH:
    '(141) PATH service – (4) Community mental health',
  PATH_SERVICE__HABILITATION_REHABILITATION:
    '(141) PATH service – (3) Habilitation/rehabilitation',
  PATH_SERVICE__HOUSING_ELIGIBILITY_DETERMINATION:
    '(141) PATH service – (10) Housing eligibility determination',
  PATH_SERVICE__HOUSING_MINOR_RENOVATION:
    '(141) PATH service – (8) Housing minor renovation',
  PATH_SERVICE__HOUSING_MOVING_ASSISTANCE:
    '(141) PATH service – (9) Housing moving assistance',
  PATH_SERVICE__ONE_TIME_RENT_FOR_EVICTION_PREVENTION:
    '(141) PATH service – (12) One-time rent for eviction prevention',
  PATH_SERVICE__RESIDENTIAL_SUPPORTIVE_SERVICES:
    '(141) PATH service – (7) Residential supportive services',
  PATH_SERVICE__RE_ENGAGEMENT: '(141) PATH service – (1) Re-engagement',
  PATH_SERVICE__SCREENING: '(141) PATH service – (2) Screening',
  PATH_SERVICE__SECURITY_DEPOSITS:
    '(141) PATH service – (11) Security deposits',
  PATH_SERVICE__SUBSTANCE_USE_TREATMENT:
    '(141) PATH service – (5) Substance use treatment',
  RHY_SERVICE_CONNECTIONS__COMMUNITY_SERVICE_SERVICE_LEARNING_CSL_:
    '(142) RHY service connections – (2) Community service/service learning (CSL)',
  RHY_SERVICE_CONNECTIONS__CRIMINAL_JUSTICE_LEGAL_SERVICES:
    '(142) RHY service connections – (7) Criminal justice /legal services',
  RHY_SERVICE_CONNECTIONS__EDUCATION:
    '(142) RHY service connections – (5) Education',
  RHY_SERVICE_CONNECTIONS__EMPLOYMENT_AND_TRAINING_SERVICES:
    '(142) RHY service connections – (6) Employment and training services',
  RHY_SERVICE_CONNECTIONS__HEALTH_MEDICAL_CARE:
    '(142) RHY service connections – (14) Health/medical care',
  RHY_SERVICE_CONNECTIONS__HOME_BASED_SERVICES:
    '(142) RHY service connections – (26) Home-based Services',
  RHY_SERVICE_CONNECTIONS__LIFE_SKILLS_TRAINING:
    '(142) RHY service connections – (8) Life skills training',
  RHY_SERVICE_CONNECTIONS__PARENTING_EDUCATION_FOR_YOUTH_WITH_CHILDREN:
    '(142) RHY service connections – (10) Parenting education for youth with children',
  RHY_SERVICE_CONNECTIONS__POST_NATAL_CARE:
    '(142) RHY service connections – (12) Post-natal care',
  RHY_SERVICE_CONNECTIONS__POST_NATAL_NEWBORN_CARE_WELLNESS_EXAMS_IMMUNIZATIONS_:
    '(142) RHY service connections – (27) Post-natal newborn care (wellness exams; immunizations)',
  RHY_SERVICE_CONNECTIONS__PRE_NATAL_CARE:
    '(142) RHY service connections – (13) Pre-natal care',
  RHY_SERVICE_CONNECTIONS__STD_TESTING:
    '(142) RHY service connections – (28) STD Testing',
  RHY_SERVICE_CONNECTIONS__STREET_BASED_SERVICES:
    '(142) RHY service connections – (29) Street-based Services',
  RHY_SERVICE_CONNECTIONS__SUBSTANCE_USE_DISORDER_PREVENTION_SERVICES:
    '(142) RHY service connections – (18) Substance use disorder/Prevention Services',
  RHY_SERVICE_CONNECTIONS__SUBSTANCE_USE_DISORDER_TREATMENT:
    '(142) RHY service connections – (17) Substance use disorder treatment',
  SSVF_FINANCIAL_ASSISTANCE__CHILD_CARE:
    '(152) SSVF financial assistance – (10) Child care',
  SSVF_FINANCIAL_ASSISTANCE__EMERGENCY_HOUSING_ASSISTANCE:
    '(152) SSVF financial assistance – (14) Emergency housing assistance',
  SSVF_FINANCIAL_ASSISTANCE__EXTENDED_SHALLOW_SUBSIDY___RENTAL_ASSISTANCE:
    '(152) SSVF financial assistance – (15) Extended Shallow Subsidy - Rental Assistance',
  SSVF_FINANCIAL_ASSISTANCE__FOOD_ASSISTANCE:
    '(152) SSVF financial assistance – (16) Food Assistance',
  SSVF_FINANCIAL_ASSISTANCE__GENERAL_HOUSING_STABILITY_ASSISTANCE:
    '(152) SSVF financial assistance – (12) General housing stability assistance',
  SSVF_FINANCIAL_ASSISTANCE__GENERAL_HOUSING_STABILITY_ASSISTANCE___EMERGENCY_SUPPLIES:
    '(152) SSVF financial assistance – (11) General housing stability assistance - emergency supplies',
  SSVF_FINANCIAL_ASSISTANCE__MOVING_COSTS:
    '(152) SSVF financial assistance – (5) Moving costs',
  SSVF_FINANCIAL_ASSISTANCE__RENTAL_ASSISTANCE:
    '(152) SSVF financial assistance – (1) Rental assistance',
  SSVF_FINANCIAL_ASSISTANCE__SECURITY_DEPOSIT:
    '(152) SSVF financial assistance – (2) Security deposit',
  SSVF_FINANCIAL_ASSISTANCE__TRANSPORTATION_SERVICES_TOKENS_VOUCHERS:
    '(152) SSVF financial assistance – (8) Transportation services: tokens/vouchers',
  SSVF_FINANCIAL_ASSISTANCE__TRANSPORTATION_SERVICES_VEHICLE_REPAIR_MAINTENANCE:
    '(152) SSVF financial assistance – (9) Transportation services: vehicle repair/maintenance',
  SSVF_FINANCIAL_ASSISTANCE__UTILITY_DEPOSIT:
    '(152) SSVF financial assistance – (3) Utility deposit',
  SSVF_FINANCIAL_ASSISTANCE__UTILITY_FEE_PAYMENT_ASSISTANCE:
    '(152) SSVF financial assistance – (4) Utility fee payment assistance',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS:
    '(144) SSVF service – (4) Assistance obtaining/coordinating other public benefits',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS:
    '(144) SSVF service – (3) Assistance obtaining VA benefits',
  SSVF_SERVICE__CASE_MANAGEMENT_SERVICES:
    '(144) SSVF service – (2) Case management services',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS:
    '(144) SSVF service – (5) Direct provision of other public benefits',
  SSVF_SERVICE__OTHER_NON_TFA_SUPPORTIVE_SERVICE_APPROVED_BY_VA:
    '(144) SSVF service – (6) Other (non-TFA) supportive service approved by VA',
  SSVF_SERVICE__OUTREACH_SERVICES: '(144) SSVF service – (1) Outreach services',
};
export const VeteranStatusEnum = {
  VETERAN_STATUS_CLIENT_DOESN_T_KNOW: "(8) Client doesn't know",
  VETERAN_STATUS_CLIENT_REFUSED: '(9) Client refused',
  VETERAN_STATUS_DATA_NOT_COLLECTED: '(99) Data not collected',
  VETERAN_STATUS_NO: '(0) No',
  VETERAN_STATUS_YES: '(1) Yes',
};
