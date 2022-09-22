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
  GENDER_CLIENT_DOESN_T_KNOW: "(8) Client doesn't know",
  GENDER_CLIENT_REFUSED: '(9) Client refused',
  GENDER_DATA_NOT_COLLECTED: '(99) Data not collected',
  GENDER_FEMALE: '(0) Female',
  GENDER_MALE: '(1) Male',
  GENDER_NO_SINGLE_GENDER:
    '(4) A gender other than singularly female or male (e.g., non-binary, genderfluid, agender, culturally specific gender)',
  GENDER_QUESTIONING: '(6) Questioning',
  GENDER_TRANSGENDER: '(5) Transgender',
};
export const HOPWAMedAssistedLivingFacEnum = {
  NO: '(0) No',
  NON_HOPWA_FUNDED_PROJECT: '(2) Non-HOPWA Funded Project',
  YES: '(1) Yes',
};
export const HousingTypeEnum = {
  SITE_BASED_CLUSTERED_MULTIPLE_SITES:
    '(2) Site-based - clustered / multiple sites',
  SITE_BASED_SINGLE_SITE: '(1) Site-based - single site',
  TENANT_BASED_SCATTERED_SITE: '(3) Tenant-based - scattered site',
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
  RACE_AM_IND_AK_NATIVE:
    '(AmIndAKNative) American Indian, Alaska Native, or Indigenous',
  RACE_ASIAN: '(Asian) Asian or Asian American',
  RACE_BLACK_AF_AMERICAN:
    '(BlackAfAmerican) Black, African American, or African',
  RACE_NATIVE_HI_PACIFIC:
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
    '(12) Child care',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__DAILY_LIVING_SERVICES:
    '(2) Daily living services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__FIDUCIARY_AND_REPRESENTATIVE_PAYEE_SERVICES:
    '(6) Fiduciary and representative payee services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__HEALTH_CARE_SERVICES:
    '(1) Health care services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__HOUSING_COUNSELING:
    '(13) Housing counseling',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__INCOME_SUPPORT_SERVICES:
    '(5) Income support services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_CHILD_SUPPORT:
    '(7) Legal services - child support',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_EVICTION_PREVENTION:
    '(8) Legal services - eviction prevention',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OTHER:
    '(11) Legal services - other',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OUTSTANDING_FINES_AND_PENALTIES:
    '(9) Legal services - outstanding fines and penalties',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_RESTORE_ACQUIRE_DRIVER_S_LICENSE:
    "(10) Legal services - restore / acquire driver's license",
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__PERSONAL_FINANCIAL_PLANNING_SERVICES:
    '(3) Personal financial planning services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__TRANSPORTATION_SERVICES:
    '(4) Transportation services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__EDUCATIONAL_ASSISTANCE:
    '(3) Educational assistance',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__EMPLOYMENT_AND_TRAINING_SERVICES:
    '(2) Employment and training services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__HEALTH_CARE_SERVICES:
    '(4) Health care services',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__VA_VOCATIONAL_AND_REHABILITATION_COUNSELING:
    '(1) VA vocational and rehabilitation counseling',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__CHILD_CARE:
    '(10) Child care',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__FIDUCIARY_AND_REPRESENTATIVE_PAYEE_SERVICES:
    '(4) Fiduciary and representative payee services',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__HOUSING_COUNSELING:
    '(11) Housing counseling',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__INCOME_SUPPORT_SERVICES:
    '(3) Income support services',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_CHILD_SUPPORT:
    '(5) Legal services - child support',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_EVICTION_PREVENTION:
    '(6) Legal services - eviction prevention',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OTHER:
    '(9) Legal services - other',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OUTSTANDING_FINES_AND_PENALTIES:
    '(7) Legal services - outstanding fines and penalties',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_RESTORE_ACQUIRE_DRIVER_S_LICENSE:
    "(8) Legal services - restore / acquire driver's license",
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__PERSONAL_FINANCIAL_PLANNING_SERVICES:
    '(1) Personal financial planning services',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__TRANSPORTATION_SERVICES:
    '(2) Transportation services',
};
export const ServiceTypeProvidedEnum = {
  BED_NIGHT__BED_NIGHT: '(200) BedNight',
  C2_MOVING_ON_ASSISTANCE_PROVIDED__FINANCIAL_ASSISTANCE_FOR_MOVING_ON_E_G_SECURITY_DEPOSIT_MOVING_EXPENSES_:
    '(2) Financial assistance for Moving On (e.g., security deposit, moving expenses)',
  C2_MOVING_ON_ASSISTANCE_PROVIDED__HOUSING_REFERRAL_PLACEMENT:
    '(4) Housing referral/placement',
  C2_MOVING_ON_ASSISTANCE_PROVIDED__NON_FINANCIAL_ASSISTANCE_FOR_MOVING_ON_E_G_HOUSING_NAVIGATION_TRANSITION_SUPPORT_:
    '(3) Non-financial assistance for Moving On (e.g., housing navigation, transition support)',
  C2_MOVING_ON_ASSISTANCE_PROVIDED__OTHER_PLEASE_SPECIFY_:
    '(5) Other (please specify)',
  C2_MOVING_ON_ASSISTANCE_PROVIDED__SUBSIDIZED_HOUSING_APPLICATION_ASSISTANCE:
    '(1) Subsidized housing application assistance',
  HOPWA_FINANCIAL_ASSISTANCE__MORTGAGE_ASSISTANCE: '(7) Mortgage assistance',
  HOPWA_FINANCIAL_ASSISTANCE__RENTAL_ASSISTANCE: '(1) Rental assistance',
  HOPWA_FINANCIAL_ASSISTANCE__SECURITY_DEPOSITS: '(2) Security deposits',
  HOPWA_FINANCIAL_ASSISTANCE__UTILITY_DEPOSITS: '(3) Utility deposits',
  HOPWA_FINANCIAL_ASSISTANCE__UTILITY_PAYMENTS: '(4) Utility payments',
  HOPWA_SERVICE__ADULT_DAY_CARE_AND_PERSONAL_ASSISTANCE:
    '(1) Adult day care and personal assistance',
  HOPWA_SERVICE__CASE_MANAGEMENT: '(2) Case management',
  HOPWA_SERVICE__CHILD_CARE: '(3) Child care',
  HOPWA_SERVICE__CRIMINAL_JUSTICE_LEGAL_SERVICES:
    '(4) Criminal justice/legal services',
  HOPWA_SERVICE__EDUCATION: '(5) Education',
  HOPWA_SERVICE__EMPLOYMENT_AND_TRAINING_SERVICES:
    '(6) Employment and training services',
  HOPWA_SERVICE__FOOD_MEALS_NUTRITIONAL_SERVICES:
    '(7) Food/meals/nutritional services',
  HOPWA_SERVICE__HEALTH_MEDICAL_CARE: '(8) Health/medical care',
  HOPWA_SERVICE__LIFE_SKILLS_TRAINING: '(9) Life skills training',
  HOPWA_SERVICE__MENTAL_HEALTH_CARE_COUNSELING:
    '(10) Mental health care/counseling',
  HOPWA_SERVICE__OTHER_HOPWA_FUNDED_SERVICE: '(14) Other HOPWA funded service',
  HOPWA_SERVICE__OUTREACH_AND_OR_ENGAGEMENT: '(11) Outreach and/or engagement',
  HOPWA_SERVICE__SUBSTANCE_ABUSE_SERVICES_TREATMENT:
    '(12) Substance abuse services/treatment',
  HOPWA_SERVICE__TRANSPORTATION: '(13) Transportation',
  HUD_VASH_OTH_VOUCHER_TRACKING__OTHER: '(12) Other',
  HUD_VASH_OTH_VOUCHER_TRACKING__REFERRAL_PACKAGE_FORWARDED_TO_PHA:
    '(1) Referral package forwarded to PHA',
  HUD_VASH_OTH_VOUCHER_TRACKING__VETERAN_EXITED_FAMILY_MAINTAINED_THE_VOUCHER:
    '(10) Veteran exited - family maintained the voucher',
  HUD_VASH_OTH_VOUCHER_TRACKING__VETERAN_EXITED_PRIOR_TO_EVER_RECEIVING_A_VOUCHER:
    '(11) Veteran exited - prior to ever receiving a voucher',
  HUD_VASH_OTH_VOUCHER_TRACKING__VETERAN_EXITED_VOUCHER_WAS_RETURNED:
    '(9) Veteran exited - voucher was returned',
  HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_DENIED_BY_PHA:
    '(2) Voucher denied by PHA',
  HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_IN_USE_VETERAN_MOVED_INTO_HOUSING:
    '(5) Voucher in use - veteran moved into housing',
  HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_ISSUED_BY_PHA:
    '(3) Voucher issued by PHA',
  HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_REVOKED_OR_EXPIRED:
    '(4) Voucher revoked or expired',
  HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_WAS_ADMINISTRATIVELY_ABSORBED_BY_NEW_PHA:
    '(7) Voucher was administratively absorbed by new PHA',
  HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_WAS_CONVERTED_TO_HOUSING_CHOICE_VOUCHER:
    '(8) Voucher was converted to Housing Choice Voucher',
  HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_WAS_PORTED_LOCALLY:
    '(6) Voucher was ported locally',
  PATH_REFERRAL__COMMUNITY_MENTAL_HEALTH: '(1) Community mental health',
  PATH_REFERRAL__EDUCATIONAL_SERVICES: '(5) Educational services',
  PATH_REFERRAL__EMPLOYMENT_ASSISTANCE: '(9) Employment assistance',
  PATH_REFERRAL__HOUSING_SERVICES: '(6) Housing services',
  PATH_REFERRAL__INCOME_ASSISTANCE: '(8) Income assistance',
  PATH_REFERRAL__JOB_TRAINING: '(4) Job training',
  PATH_REFERRAL__MEDICAL_INSURANCE: '(10) Medical insurance',
  PATH_REFERRAL__PERMANENT_HOUSING: '(7) Permanent housing',
  PATH_REFERRAL__PRIMARY_HEALTH_DENTAL_CARE: '(3) Primary health/dental care',
  PATH_REFERRAL__SUBSTANCE_USE_TREATMENT: '(2) Substance use treatment',
  PATH_REFERRAL__TEMPORARY_HOUSING: '(11) Temporary housing',
  PATH_SERVICE__CASE_MANAGEMENT: '(6) Case management',
  PATH_SERVICE__CLINICAL_ASSESSMENT: '(14) Clinical assessment',
  PATH_SERVICE__COMMUNITY_MENTAL_HEALTH: '(4) Community mental health',
  PATH_SERVICE__HABILITATION_REHABILITATION: '(3) Habilitation/rehabilitation',
  PATH_SERVICE__HOUSING_ELIGIBILITY_DETERMINATION:
    '(10) Housing eligibility determination',
  PATH_SERVICE__HOUSING_MINOR_RENOVATION: '(8) Housing minor renovation',
  PATH_SERVICE__HOUSING_MOVING_ASSISTANCE: '(9) Housing moving assistance',
  PATH_SERVICE__ONE_TIME_RENT_FOR_EVICTION_PREVENTION:
    '(12) One-time rent for eviction prevention',
  PATH_SERVICE__RESIDENTIAL_SUPPORTIVE_SERVICES:
    '(7) Residential supportive services',
  PATH_SERVICE__RE_ENGAGEMENT: '(1) Re-engagement',
  PATH_SERVICE__SCREENING: '(2) Screening',
  PATH_SERVICE__SECURITY_DEPOSITS: '(11) Security deposits',
  PATH_SERVICE__SUBSTANCE_USE_TREATMENT: '(5) Substance use treatment',
  RHY_SERVICE_CONNECTIONS__COMMUNITY_SERVICE_SERVICE_LEARNING_CSL_:
    '(2) Community service/service learning (CSL)',
  RHY_SERVICE_CONNECTIONS__CRIMINAL_JUSTICE_LEGAL_SERVICES:
    '(7) Criminal justice /legal services',
  RHY_SERVICE_CONNECTIONS__EDUCATION: '(5) Education',
  RHY_SERVICE_CONNECTIONS__EMPLOYMENT_AND_TRAINING_SERVICES:
    '(6) Employment and training services',
  RHY_SERVICE_CONNECTIONS__HEALTH_MEDICAL_CARE: '(14) Health/medical care',
  RHY_SERVICE_CONNECTIONS__HOME_BASED_SERVICES: '(26) Home-based Services',
  RHY_SERVICE_CONNECTIONS__LIFE_SKILLS_TRAINING: '(8) Life skills training',
  RHY_SERVICE_CONNECTIONS__PARENTING_EDUCATION_FOR_YOUTH_WITH_CHILDREN:
    '(10) Parenting education for youth with children',
  RHY_SERVICE_CONNECTIONS__POST_NATAL_CARE: '(12) Post-natal care',
  RHY_SERVICE_CONNECTIONS__POST_NATAL_NEWBORN_CARE_WELLNESS_EXAMS_IMMUNIZATIONS_:
    '(27) Post-natal newborn care (wellness exams; immunizations)',
  RHY_SERVICE_CONNECTIONS__PRE_NATAL_CARE: '(13) Pre-natal care',
  RHY_SERVICE_CONNECTIONS__STD_TESTING: '(28) STD Testing',
  RHY_SERVICE_CONNECTIONS__STREET_BASED_SERVICES: '(29) Street-based Services',
  RHY_SERVICE_CONNECTIONS__SUBSTANCE_USE_DISORDER_PREVENTION_SERVICES:
    '(18) Substance use disorder/Prevention Services',
  RHY_SERVICE_CONNECTIONS__SUBSTANCE_USE_DISORDER_TREATMENT:
    '(17) Substance use disorder treatment',
  SSVF_FINANCIAL_ASSISTANCE__CHILD_CARE: '(10) Child care',
  SSVF_FINANCIAL_ASSISTANCE__EMERGENCY_HOUSING_ASSISTANCE:
    '(14) Emergency housing assistance',
  SSVF_FINANCIAL_ASSISTANCE__EXTENDED_SHALLOW_SUBSIDY_RENTAL_ASSISTANCE:
    '(15) Extended Shallow Subsidy - Rental Assistance',
  SSVF_FINANCIAL_ASSISTANCE__FOOD_ASSISTANCE: '(16) Food Assistance',
  SSVF_FINANCIAL_ASSISTANCE__GENERAL_HOUSING_STABILITY_ASSISTANCE:
    '(12) General housing stability assistance',
  SSVF_FINANCIAL_ASSISTANCE__GENERAL_HOUSING_STABILITY_ASSISTANCE_EMERGENCY_SUPPLIES:
    '(11) General housing stability assistance - emergency supplies',
  SSVF_FINANCIAL_ASSISTANCE__MOVING_COSTS: '(5) Moving costs',
  SSVF_FINANCIAL_ASSISTANCE__RENTAL_ASSISTANCE: '(1) Rental assistance',
  SSVF_FINANCIAL_ASSISTANCE__SECURITY_DEPOSIT: '(2) Security deposit',
  SSVF_FINANCIAL_ASSISTANCE__TRANSPORTATION_SERVICES_TOKENS_VOUCHERS:
    '(8) Transportation services: tokens/vouchers',
  SSVF_FINANCIAL_ASSISTANCE__TRANSPORTATION_SERVICES_VEHICLE_REPAIR_MAINTENANCE:
    '(9) Transportation services: vehicle repair/maintenance',
  SSVF_FINANCIAL_ASSISTANCE__UTILITY_DEPOSIT: '(3) Utility deposit',
  SSVF_FINANCIAL_ASSISTANCE__UTILITY_FEE_PAYMENT_ASSISTANCE:
    '(4) Utility fee payment assistance',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS:
    '(4) Assistance obtaining/coordinating other public benefits',
  SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS:
    '(3) Assistance obtaining VA benefits',
  SSVF_SERVICE__CASE_MANAGEMENT_SERVICES: '(2) Case management services',
  SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS:
    '(5) Direct provision of other public benefits',
  SSVF_SERVICE__OTHER_NON_TFA_SUPPORTIVE_SERVICE_APPROVED_BY_VA:
    '(6) Other (non-TFA) supportive service approved by VA',
  SSVF_SERVICE__OUTREACH_SERVICES: '(1) Outreach services',
};
export const TargetPopulationEnum = {
  DOMESTIC_VIOLENCE_VICTIMS: '(1) Domestic violence victims',
  NOT_APPLICABLE: '(4) Not applicable',
  PERSONS_WITH_HIV_AIDS: '(3) Persons with HIV/AIDS',
};
export const TrackingMethodEnum = {
  ENTRY_EXIT_DATE: '(0) Entry/Exit Date',
  NIGHT_BY_NIGHT: '(3) Night-by-Night',
};
export const VeteranStatusEnum = {
  VETERAN_STATUS_CLIENT_DOESN_T_KNOW: "(8) Client doesn't know",
  VETERAN_STATUS_CLIENT_REFUSED: '(9) Client refused',
  VETERAN_STATUS_DATA_NOT_COLLECTED: '(99) Data not collected',
  VETERAN_STATUS_NO: '(0) No',
  VETERAN_STATUS_YES: '(1) Yes',
};
