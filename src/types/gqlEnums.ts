export const HmisEnums = {
  AssessmentLevel: {
    CRISIS_NEEDS_ASSESSMENT: '(1) Crisis Needs Assessment',
    HOUSING_NEEDS_ASSESSMENT: '(2) Housing Needs Assessment',
  },
  AssessmentType: {
    PHONE: '(1) Phone',
    VIRTUAL: '(2) Virtual',
    IN_PERSON: '(3) In Person',
  },
  DOBDataQuality: {
    DOB_FULL_DOB_REPORTED: '(1) Full DOB reported',
    DOB_APPROXIMATE_OR_PARTIAL_DOB_REPORTED:
      '(2) Approximate or partial DOB reported',
    DOB_CLIENT_DOESN_T_KNOW: "(8) Client doesn't know",
    DOB_CLIENT_REFUSED: '(9) Client refused',
    DOB_DATA_NOT_COLLECTED: '(99) Data not collected',
  },
  Ethnicity: {
    ETHNICITY_NON_HISPANIC_NON_LATIN_A_O_X_:
      '(0) Non-Hispanic/Non-Latin(a)(o)(x)',
    ETHNICITY_HISPANIC_LATIN_A_O_X_: '(1) Hispanic/Latin(a)(o)(x)',
    ETHNICITY_UNKNOWN: "(8) Client doesn't know",
    ETHNICITY_REFUSED: '(9) Client refused',
    ETHNICITY_NOT_COLLECTED: '(99) Data not collected',
  },
  EventType: {
    REFERRAL_TO_PREVENTION_ASSISTANCE_PROJECT:
      '(1) Referral to Prevention Assistance project',
    PROBLEM_SOLVING_DIVERSION_RAPID_RESOLUTION_INTERVENTION_OR_SERVICE:
      '(2) Problem Solving/Diversion/Rapid Resolution intervention or service',
    REFERRAL_TO_SCHEDULED_COORDINATED_ENTRY_CRISIS_NEEDS_ASSESSMENT:
      '(3) Referral to scheduled Coordinated Entry Crisis Needs Assessment',
    REFERRAL_TO_SCHEDULED_COORDINATED_ENTRY_HOUSING_NEEDS_ASSESSMENT:
      '(4) Referral to scheduled Coordinated Entry Housing Needs Assessment',
    REFERRAL_TO_POST_PLACEMENT_FOLLOW_UP_CASE_MANAGEMENT:
      '(5) Referral to Post-placement/ follow-up case management',
    REFERRAL_TO_STREET_OUTREACH_PROJECT_OR_SERVICES:
      '(6) Referral to Street Outreach project or services',
    REFERRAL_TO_HOUSING_NAVIGATION_PROJECT_OR_SERVICES:
      '(7) Referral to Housing Navigation project or services',
    REFERRAL_TO_NON_CONTINUUM_SERVICES_INELIGIBLE_FOR_CONTINUUM_SERVICES:
      '(8) Referral to Non-continuum services: Ineligible for continuum services',
    REFERRAL_TO_NON_CONTINUUM_SERVICES_NO_AVAILABILITY_IN_CONTINUUM_SERVICES:
      '(9) Referral to Non-continuum services: No availability in continuum services',
    REFERRAL_TO_EMERGENCY_SHELTER_BED_OPENING:
      '(10) Referral to Emergency Shelter bed opening',
    REFERRAL_TO_TRANSITIONAL_HOUSING_BED_UNIT_OPENING:
      '(11) Referral to Transitional Housing bed/unit opening',
    REFERRAL_TO_JOINT_TH_RRH_PROJECT_UNIT_RESOURCE_OPENING:
      '(12) Referral to Joint TH-RRH project/unit/resource opening',
    REFERRAL_TO_RRH_PROJECT_RESOURCE_OPENING:
      '(13) Referral to RRH project resource opening',
    REFERRAL_TO_PSH_PROJECT_RESOURCE_OPENING:
      '(14) Referral to PSH project resource opening',
    REFERRAL_TO_OTHER_PH_PROJECT_UNIT_RESOURCE_OPENING:
      '(15) Referral to Other PH project/unit/resource opening',
    REFERRAL_TO_EMERGENCY_ASSISTANCE_FLEX_FUND_FURNITURE_ASSISTANCE:
      '(16) Referral to emergency assistance/flex fund/furniture assistance',
    REFERRAL_TO_EMERGENCY_HOUSING_VOUCHER_EHV_:
      '(17) Referral to Emergency Housing Voucher (EHV)',
    REFERRAL_TO_A_HOUSING_STABILITY_VOUCHER:
      '(18) Referral to a Housing Stability Voucher',
  },
  Gender: {
    GENDER_FEMALE: '(0) Female',
    GENDER_MALE: '(1) Male',
    GENDER_NO_SINGLE_GENDER:
      '(4) A gender other than singularly female or male (e.g., non-binary, genderfluid, agender, culturally specific gender)',
    GENDER_TRANSGENDER: '(5) Transgender',
    GENDER_QUESTIONING: '(6) Questioning',
    GENDER_CLIENT_DOESN_T_KNOW: "(8) Client doesn't know",
    GENDER_CLIENT_REFUSED: '(9) Client refused',
    GENDER_DATA_NOT_COLLECTED: '(99) Data not collected',
  },
  HOPWAMedAssistedLivingFac: {
    NO: '(0) No',
    YES: '(1) Yes',
    NON_HOPWA_FUNDED_PROJECT: '(2) Non-HOPWA Funded Project',
  },
  HousingType: {
    SITE_BASED_SINGLE_SITE: '(1) Site-based - single site',
    SITE_BASED_CLUSTERED_MULTIPLE_SITES:
      '(2) Site-based - clustered / multiple sites',
    TENANT_BASED_SCATTERED_SITE: '(3) Tenant-based - scattered site',
  },
  NameDataQuality: {
    NAME_FULL_NAME_REPORTED: '(1) Full name reported',
    NAME_PARTIAL_STREET_NAME_OR_CODE_NAME_REPORTED:
      '(2) Partial, street name, or code name reported',
    NAME_CLIENT_DOESN_T_KNOW: "(8) Client doesn't know",
    NAME_CLIENT_REFUSED: '(9) Client refused',
    NAME_DATA_NOT_COLLECTED: '(99) Data not collected',
  },
  PATHReferralOutcome: {
    ATTAINED: '(1) Attained',
    NOT_ATTAINED: '(2) Not attained',
    UNKNOWN: '(3) Unknown',
  },
  PrioritizationStatus: {
    PLACED_ON_PRIORITIZATION_LIST: '(1) Placed on prioritization list',
    NOT_PLACED_ON_PRIORITIZATION_LIST: '(2) Not placed on prioritization list',
  },
  ProbSolDivRRResult: {
    NO: '(0) No',
    YES: '(1) Yes',
    DATA_NOT_COLLECTED: '(99) Data not collected',
  },
  ProjectType: {
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
  },
  Race: {
    RACE_AM_IND_AK_NATIVE:
      '(AmIndAKNative) American Indian, Alaska Native, or Indigenous',
    RACE_ASIAN: '(Asian) Asian or Asian American',
    RACE_BLACK_AF_AMERICAN:
      '(BlackAfAmerican) Black, African American, or African',
    RACE_NATIVE_HI_PACIFIC:
      '(NativeHIPacific) Native Hawaiian or Pacific Islander',
    RACE_WHITE: '(White) White',
    RACE_UNKNOWN: "(8) Client doesn't know",
    RACE_REFUSED: '(9) Client refused',
    RACE_NOT_COLLECTED: '(99) Data not collected',
  },
  RecordType: {
    PATH_SERVICE: '(141) PATH service',
    RHY_SERVICE_CONNECTIONS: '(142) RHY service connections',
    HOPWA_SERVICE: '(143) HOPWA service',
    SSVF_SERVICE: '(144) SSVF service',
    HOPWA_FINANCIAL_ASSISTANCE: '(151) HOPWA financial assistance',
    SSVF_FINANCIAL_ASSISTANCE: '(152) SSVF financial assistance',
    PATH_REFERRAL: '(161) PATH referral',
    RHY_REFERRAL: '(162) RHY referral',
    BED_NIGHT: '(200) Bed night',
    HUD_VASH_OTH_VOUCHER_TRACKING: '(210) HUD-VASH OTH voucher tracking',
    C2_MOVING_ON_ASSISTANCE_PROVIDED: '(300) C2 Moving On Assistance Provided',
  },
  ReferralCaseManageAfter: {
    NO: '(0) No',
    YES: '(1) Yes',
    DATA_NOT_COLLECTED: '(99) Data not collected',
  },
  ReferralResult: {
    SUCCESSFUL_REFERRAL_CLIENT_ACCEPTED:
      '(1) Successful referral: client accepted',
    UNSUCCESSFUL_REFERRAL_CLIENT_REJECTED:
      '(2) Unsuccessful referral: client rejected',
    UNSUCCESSFUL_REFERRAL_PROVIDER_REJECTED:
      '(3) Unsuccessful referral: provider rejected',
  },
  RelationshipToHoH: {
    SELF_HEAD_OF_HOUSEHOLD_: '(1) Self (head of household)',
    CHILD: '(2) Child',
    SPOUSE_OR_PARTNER: '(3) Spouse or partner',
    OTHER_RELATIVE: '(4) Other relative',
    UNRELATED_HOUSEHOLD_MEMBER: '(5) Unrelated household member',
    DATA_NOT_COLLECTED: '(99) Data not collected',
  },
  SSNDataQuality: {
    SSN_FULL_SSN_REPORTED: '(1) Full SSN reported',
    SSN_APPROXIMATE_OR_PARTIAL_SSN_REPORTED:
      '(2) Approximate or partial SSN reported',
    SSN_CLIENT_DOESN_T_KNOW: "(8) Client doesn't know",
    SSN_CLIENT_REFUSED: '(9) Client refused',
    SSN_DATA_NOT_COLLECTED: '(99) Data not collected',
  },
  ServiceSubTypeProvided: {
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__HEALTH_CARE_SERVICES:
      '(1) Health care services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__VA_VOCATIONAL_AND_REHABILITATION_COUNSELING:
      '(1) VA vocational and rehabilitation counseling',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__PERSONAL_FINANCIAL_PLANNING_SERVICES:
      '(1) Personal financial planning services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__DAILY_LIVING_SERVICES:
      '(2) Daily living services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__EMPLOYMENT_AND_TRAINING_SERVICES:
      '(2) Employment and training services',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__TRANSPORTATION_SERVICES:
      '(2) Transportation services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__PERSONAL_FINANCIAL_PLANNING_SERVICES:
      '(3) Personal financial planning services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__EDUCATIONAL_ASSISTANCE:
      '(3) Educational assistance',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__INCOME_SUPPORT_SERVICES:
      '(3) Income support services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__TRANSPORTATION_SERVICES:
      '(4) Transportation services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__HEALTH_CARE_SERVICES:
      '(4) Health care services',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__FIDUCIARY_AND_REPRESENTATIVE_PAYEE_SERVICES:
      '(4) Fiduciary and representative payee services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__INCOME_SUPPORT_SERVICES:
      '(5) Income support services',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_CHILD_SUPPORT:
      '(5) Legal services - child support',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__FIDUCIARY_AND_REPRESENTATIVE_PAYEE_SERVICES:
      '(6) Fiduciary and representative payee services',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_EVICTION_PREVENTION:
      '(6) Legal services - eviction prevention',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_CHILD_SUPPORT:
      '(7) Legal services - child support',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OUTSTANDING_FINES_AND_PENALTIES:
      '(7) Legal services - outstanding fines and penalties',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_EVICTION_PREVENTION:
      '(8) Legal services - eviction prevention',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_RESTORE_ACQUIRE_DRIVER_S_LICENSE:
      "(8) Legal services - restore / acquire driver's license",
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OUTSTANDING_FINES_AND_PENALTIES:
      '(9) Legal services - outstanding fines and penalties',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OTHER:
      '(9) Legal services - other',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_RESTORE_ACQUIRE_DRIVER_S_LICENSE:
      "(10) Legal services - restore / acquire driver's license",
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__CHILD_CARE:
      '(10) Child care',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OTHER:
      '(11) Legal services - other',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__HOUSING_COUNSELING:
      '(11) Housing counseling',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__CHILD_CARE:
      '(12) Child care',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__HOUSING_COUNSELING:
      '(13) Housing counseling',
  },
  ServiceTypeProvided: {
    C2_MOVING_ON_ASSISTANCE_PROVIDED__SUBSIDIZED_HOUSING_APPLICATION_ASSISTANCE:
      '(1) Subsidized housing application assistance',
    HOPWA_FINANCIAL_ASSISTANCE__RENTAL_ASSISTANCE: '(1) Rental assistance',
    HOPWA_SERVICE__ADULT_DAY_CARE_AND_PERSONAL_ASSISTANCE:
      '(1) Adult day care and personal assistance',
    HUD_VASH_OTH_VOUCHER_TRACKING__REFERRAL_PACKAGE_FORWARDED_TO_PHA:
      '(1) Referral package forwarded to PHA',
    PATH_REFERRAL__COMMUNITY_MENTAL_HEALTH: '(1) Community mental health',
    PATH_SERVICE__RE_ENGAGEMENT: '(1) Re-engagement',
    SSVF_FINANCIAL_ASSISTANCE__RENTAL_ASSISTANCE: '(1) Rental assistance',
    SSVF_SERVICE__OUTREACH_SERVICES: '(1) Outreach services',
    C2_MOVING_ON_ASSISTANCE_PROVIDED__FINANCIAL_ASSISTANCE_FOR_MOVING_ON_E_G_SECURITY_DEPOSIT_MOVING_EXPENSES_:
      '(2) Financial assistance for Moving On (e.g., security deposit, moving expenses)',
    HOPWA_FINANCIAL_ASSISTANCE__SECURITY_DEPOSITS: '(2) Security deposits',
    HOPWA_SERVICE__CASE_MANAGEMENT: '(2) Case management',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_DENIED_BY_PHA:
      '(2) Voucher denied by PHA',
    PATH_REFERRAL__SUBSTANCE_USE_TREATMENT: '(2) Substance use treatment',
    PATH_SERVICE__SCREENING: '(2) Screening',
    RHY_SERVICE_CONNECTIONS__COMMUNITY_SERVICE_SERVICE_LEARNING_CSL_:
      '(2) Community service/service learning (CSL)',
    SSVF_FINANCIAL_ASSISTANCE__SECURITY_DEPOSIT: '(2) Security deposit',
    SSVF_SERVICE__CASE_MANAGEMENT_SERVICES: '(2) Case management services',
    C2_MOVING_ON_ASSISTANCE_PROVIDED__NON_FINANCIAL_ASSISTANCE_FOR_MOVING_ON_E_G_HOUSING_NAVIGATION_TRANSITION_SUPPORT_:
      '(3) Non-financial assistance for Moving On (e.g., housing navigation, transition support)',
    HOPWA_FINANCIAL_ASSISTANCE__UTILITY_DEPOSITS: '(3) Utility deposits',
    HOPWA_SERVICE__CHILD_CARE: '(3) Child care',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_ISSUED_BY_PHA:
      '(3) Voucher issued by PHA',
    PATH_REFERRAL__PRIMARY_HEALTH_DENTAL_CARE: '(3) Primary health/dental care',
    PATH_SERVICE__HABILITATION_REHABILITATION:
      '(3) Habilitation/rehabilitation',
    SSVF_FINANCIAL_ASSISTANCE__UTILITY_DEPOSIT: '(3) Utility deposit',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS:
      '(3) Assistance obtaining VA benefits',
    C2_MOVING_ON_ASSISTANCE_PROVIDED__HOUSING_REFERRAL_PLACEMENT:
      '(4) Housing referral/placement',
    HOPWA_FINANCIAL_ASSISTANCE__UTILITY_PAYMENTS: '(4) Utility payments',
    HOPWA_SERVICE__CRIMINAL_JUSTICE_LEGAL_SERVICES:
      '(4) Criminal justice/legal services',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_REVOKED_OR_EXPIRED:
      '(4) Voucher revoked or expired',
    PATH_REFERRAL__JOB_TRAINING: '(4) Job training',
    PATH_SERVICE__COMMUNITY_MENTAL_HEALTH: '(4) Community mental health',
    SSVF_FINANCIAL_ASSISTANCE__UTILITY_FEE_PAYMENT_ASSISTANCE:
      '(4) Utility fee payment assistance',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS:
      '(4) Assistance obtaining/coordinating other public benefits',
    C2_MOVING_ON_ASSISTANCE_PROVIDED__OTHER_PLEASE_SPECIFY_:
      '(5) Other (please specify)',
    HOPWA_SERVICE__EDUCATION: '(5) Education',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_IN_USE_VETERAN_MOVED_INTO_HOUSING:
      '(5) Voucher in use - veteran moved into housing',
    PATH_REFERRAL__EDUCATIONAL_SERVICES: '(5) Educational services',
    PATH_SERVICE__SUBSTANCE_USE_TREATMENT: '(5) Substance use treatment',
    RHY_SERVICE_CONNECTIONS__EDUCATION: '(5) Education',
    SSVF_FINANCIAL_ASSISTANCE__MOVING_COSTS: '(5) Moving costs',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS:
      '(5) Direct provision of other public benefits',
    HOPWA_SERVICE__EMPLOYMENT_AND_TRAINING_SERVICES:
      '(6) Employment and training services',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_WAS_PORTED_LOCALLY:
      '(6) Voucher was ported locally',
    PATH_REFERRAL__HOUSING_SERVICES: '(6) Housing services',
    PATH_SERVICE__CASE_MANAGEMENT: '(6) Case management',
    RHY_SERVICE_CONNECTIONS__EMPLOYMENT_AND_TRAINING_SERVICES:
      '(6) Employment and training services',
    SSVF_SERVICE__OTHER_NON_TFA_SUPPORTIVE_SERVICE_APPROVED_BY_VA:
      '(6) Other (non-TFA) supportive service approved by VA',
    HOPWA_FINANCIAL_ASSISTANCE__MORTGAGE_ASSISTANCE: '(7) Mortgage assistance',
    HOPWA_SERVICE__FOOD_MEALS_NUTRITIONAL_SERVICES:
      '(7) Food/meals/nutritional services',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_WAS_ADMINISTRATIVELY_ABSORBED_BY_NEW_PHA:
      '(7) Voucher was administratively absorbed by new PHA',
    PATH_REFERRAL__PERMANENT_HOUSING: '(7) Permanent housing',
    PATH_SERVICE__RESIDENTIAL_SUPPORTIVE_SERVICES:
      '(7) Residential supportive services',
    RHY_SERVICE_CONNECTIONS__CRIMINAL_JUSTICE_LEGAL_SERVICES:
      '(7) Criminal justice /legal services',
    HOPWA_SERVICE__HEALTH_MEDICAL_CARE: '(8) Health/medical care',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_WAS_CONVERTED_TO_HOUSING_CHOICE_VOUCHER:
      '(8) Voucher was converted to Housing Choice Voucher',
    PATH_REFERRAL__INCOME_ASSISTANCE: '(8) Income assistance',
    PATH_SERVICE__HOUSING_MINOR_RENOVATION: '(8) Housing minor renovation',
    RHY_SERVICE_CONNECTIONS__LIFE_SKILLS_TRAINING: '(8) Life skills training',
    SSVF_FINANCIAL_ASSISTANCE__TRANSPORTATION_SERVICES_TOKENS_VOUCHERS:
      '(8) Transportation services: tokens/vouchers',
    HOPWA_SERVICE__LIFE_SKILLS_TRAINING: '(9) Life skills training',
    HUD_VASH_OTH_VOUCHER_TRACKING__VETERAN_EXITED_VOUCHER_WAS_RETURNED:
      '(9) Veteran exited - voucher was returned',
    PATH_REFERRAL__EMPLOYMENT_ASSISTANCE: '(9) Employment assistance',
    PATH_SERVICE__HOUSING_MOVING_ASSISTANCE: '(9) Housing moving assistance',
    SSVF_FINANCIAL_ASSISTANCE__TRANSPORTATION_SERVICES_VEHICLE_REPAIR_MAINTENANCE:
      '(9) Transportation services: vehicle repair/maintenance',
    HOPWA_SERVICE__MENTAL_HEALTH_CARE_COUNSELING:
      '(10) Mental health care/counseling',
    HUD_VASH_OTH_VOUCHER_TRACKING__VETERAN_EXITED_FAMILY_MAINTAINED_THE_VOUCHER:
      '(10) Veteran exited - family maintained the voucher',
    PATH_REFERRAL__MEDICAL_INSURANCE: '(10) Medical insurance',
    PATH_SERVICE__HOUSING_ELIGIBILITY_DETERMINATION:
      '(10) Housing eligibility determination',
    RHY_SERVICE_CONNECTIONS__PARENTING_EDUCATION_FOR_YOUTH_WITH_CHILDREN:
      '(10) Parenting education for youth with children',
    SSVF_FINANCIAL_ASSISTANCE__CHILD_CARE: '(10) Child care',
    HOPWA_SERVICE__OUTREACH_AND_OR_ENGAGEMENT:
      '(11) Outreach and/or engagement',
    HUD_VASH_OTH_VOUCHER_TRACKING__VETERAN_EXITED_PRIOR_TO_EVER_RECEIVING_A_VOUCHER:
      '(11) Veteran exited - prior to ever receiving a voucher',
    PATH_REFERRAL__TEMPORARY_HOUSING: '(11) Temporary housing',
    PATH_SERVICE__SECURITY_DEPOSITS: '(11) Security deposits',
    SSVF_FINANCIAL_ASSISTANCE__GENERAL_HOUSING_STABILITY_ASSISTANCE_EMERGENCY_SUPPLIES:
      '(11) General housing stability assistance - emergency supplies',
    HOPWA_SERVICE__SUBSTANCE_ABUSE_SERVICES_TREATMENT:
      '(12) Substance abuse services/treatment',
    HUD_VASH_OTH_VOUCHER_TRACKING__OTHER: '(12) Other',
    PATH_SERVICE__ONE_TIME_RENT_FOR_EVICTION_PREVENTION:
      '(12) One-time rent for eviction prevention',
    RHY_SERVICE_CONNECTIONS__POST_NATAL_CARE: '(12) Post-natal care',
    SSVF_FINANCIAL_ASSISTANCE__GENERAL_HOUSING_STABILITY_ASSISTANCE:
      '(12) General housing stability assistance',
    HOPWA_SERVICE__TRANSPORTATION: '(13) Transportation',
    RHY_SERVICE_CONNECTIONS__PRE_NATAL_CARE: '(13) Pre-natal care',
    HOPWA_SERVICE__OTHER_HOPWA_FUNDED_SERVICE:
      '(14) Other HOPWA funded service',
    PATH_SERVICE__CLINICAL_ASSESSMENT: '(14) Clinical assessment',
    RHY_SERVICE_CONNECTIONS__HEALTH_MEDICAL_CARE: '(14) Health/medical care',
    SSVF_FINANCIAL_ASSISTANCE__EMERGENCY_HOUSING_ASSISTANCE:
      '(14) Emergency housing assistance',
    SSVF_FINANCIAL_ASSISTANCE__EXTENDED_SHALLOW_SUBSIDY_RENTAL_ASSISTANCE:
      '(15) Extended Shallow Subsidy - Rental Assistance',
    SSVF_FINANCIAL_ASSISTANCE__FOOD_ASSISTANCE: '(16) Food Assistance',
    RHY_SERVICE_CONNECTIONS__SUBSTANCE_USE_DISORDER_TREATMENT:
      '(17) Substance use disorder treatment',
    RHY_SERVICE_CONNECTIONS__SUBSTANCE_USE_DISORDER_PREVENTION_SERVICES:
      '(18) Substance use disorder/Prevention Services',
    RHY_SERVICE_CONNECTIONS__HOME_BASED_SERVICES: '(26) Home-based Services',
    RHY_SERVICE_CONNECTIONS__POST_NATAL_NEWBORN_CARE_WELLNESS_EXAMS_IMMUNIZATIONS_:
      '(27) Post-natal newborn care (wellness exams; immunizations)',
    RHY_SERVICE_CONNECTIONS__STD_TESTING: '(28) STD Testing',
    RHY_SERVICE_CONNECTIONS__STREET_BASED_SERVICES:
      '(29) Street-based Services',
    BED_NIGHT__BED_NIGHT: '(200) BedNight',
  },
  TargetPopulation: {
    DOMESTIC_VIOLENCE_VICTIMS: '(1) Domestic violence victims',
    PERSONS_WITH_HIV_AIDS: '(3) Persons with HIV/AIDS',
    NOT_APPLICABLE: '(4) Not applicable',
  },
  TrackingMethod: {
    ENTRY_EXIT_DATE: '(0) Entry/Exit Date',
    NIGHT_BY_NIGHT: '(3) Night-by-Night',
  },
  VeteranStatus: {
    VETERAN_STATUS_NO: '(0) No',
    VETERAN_STATUS_YES: '(1) Yes',
    VETERAN_STATUS_CLIENT_DOESN_T_KNOW: "(8) Client doesn't know",
    VETERAN_STATUS_CLIENT_REFUSED: '(9) Client refused',
    VETERAN_STATUS_DATA_NOT_COLLECTED: '(99) Data not collected',
  },
};
