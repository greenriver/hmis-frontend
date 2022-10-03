export const HmisEnums = {
  AssessmentLevel: {
    CRISIS_NEEDS_ASSESSMENT: 'Crisis Needs Assessment',
    HOUSING_NEEDS_ASSESSMENT: 'Housing Needs Assessment',
  },
  AssessmentType: {
    PHONE: 'Phone',
    VIRTUAL: 'Virtual',
    IN_PERSON: 'In Person',
  },
  DOBDataQuality: {
    DOB_FULL_DOB_REPORTED: 'Full DOB reported',
    DOB_APPROXIMATE_OR_PARTIAL_DOB_REPORTED:
      'Approximate or partial DOB reported',
    DOB_CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DOB_CLIENT_REFUSED: 'Client refused',
    DOB_DATA_NOT_COLLECTED: 'Data not collected',
  },
  Ethnicity: {
    ETHNICITY_NON_HISPANIC_NON_LATIN_A_O_X_: 'Non-Hispanic/Non-Latin(a)(o)(x)',
    ETHNICITY_HISPANIC_LATIN_A_O_X_: 'Hispanic/Latin(a)(o)(x)',
    ETHNICITY_UNKNOWN: "Client doesn't know",
    ETHNICITY_REFUSED: 'Client refused',
    ETHNICITY_NOT_COLLECTED: 'Data not collected',
  },
  EventType: {
    REFERRAL_TO_PREVENTION_ASSISTANCE_PROJECT:
      'Referral to Prevention Assistance project',
    PROBLEM_SOLVING_DIVERSION_RAPID_RESOLUTION_INTERVENTION_OR_SERVICE:
      'Problem Solving/Diversion/Rapid Resolution intervention or service',
    REFERRAL_TO_SCHEDULED_COORDINATED_ENTRY_CRISIS_NEEDS_ASSESSMENT:
      'Referral to scheduled Coordinated Entry Crisis Needs Assessment',
    REFERRAL_TO_SCHEDULED_COORDINATED_ENTRY_HOUSING_NEEDS_ASSESSMENT:
      'Referral to scheduled Coordinated Entry Housing Needs Assessment',
    REFERRAL_TO_POST_PLACEMENT_FOLLOW_UP_CASE_MANAGEMENT:
      'Referral to Post-placement/ follow-up case management',
    REFERRAL_TO_STREET_OUTREACH_PROJECT_OR_SERVICES:
      'Referral to Street Outreach project or services',
    REFERRAL_TO_HOUSING_NAVIGATION_PROJECT_OR_SERVICES:
      'Referral to Housing Navigation project or services',
    REFERRAL_TO_NON_CONTINUUM_SERVICES_INELIGIBLE_FOR_CONTINUUM_SERVICES:
      'Referral to Non-continuum services: Ineligible for continuum services',
    REFERRAL_TO_NON_CONTINUUM_SERVICES_NO_AVAILABILITY_IN_CONTINUUM_SERVICES:
      'Referral to Non-continuum services: No availability in continuum services',
    REFERRAL_TO_EMERGENCY_SHELTER_BED_OPENING:
      'Referral to Emergency Shelter bed opening',
    REFERRAL_TO_TRANSITIONAL_HOUSING_BED_UNIT_OPENING:
      'Referral to Transitional Housing bed/unit opening',
    REFERRAL_TO_JOINT_TH_RRH_PROJECT_UNIT_RESOURCE_OPENING:
      'Referral to Joint TH-RRH project/unit/resource opening',
    REFERRAL_TO_RRH_PROJECT_RESOURCE_OPENING:
      'Referral to RRH project resource opening',
    REFERRAL_TO_PSH_PROJECT_RESOURCE_OPENING:
      'Referral to PSH project resource opening',
    REFERRAL_TO_OTHER_PH_PROJECT_UNIT_RESOURCE_OPENING:
      'Referral to Other PH project/unit/resource opening',
    REFERRAL_TO_EMERGENCY_ASSISTANCE_FLEX_FUND_FURNITURE_ASSISTANCE:
      'Referral to emergency assistance/flex fund/furniture assistance',
    REFERRAL_TO_EMERGENCY_HOUSING_VOUCHER_EHV_:
      'Referral to Emergency Housing Voucher (EHV)',
    REFERRAL_TO_A_HOUSING_STABILITY_VOUCHER:
      'Referral to a Housing Stability Voucher',
  },
  Gender: {
    GENDER_FEMALE: 'Female',
    GENDER_MALE: 'Male',
    GENDER_NO_SINGLE_GENDER:
      'A gender other than singularly female or male (e.g., non-binary, genderfluid, agender, culturally specific gender)',
    GENDER_TRANSGENDER: 'Transgender',
    GENDER_QUESTIONING: 'Questioning',
    GENDER_CLIENT_DOESN_T_KNOW: "Client doesn't know",
    GENDER_CLIENT_REFUSED: 'Client refused',
    GENDER_DATA_NOT_COLLECTED: 'Data not collected',
  },
  HOPWAMedAssistedLivingFac: {
    NO: 'No',
    YES: 'Yes',
    NON_HOPWA_FUNDED_PROJECT: 'Non-HOPWA Funded Project',
  },
  HousingType: {
    SITE_BASED_SINGLE_SITE: 'Site-based - single site',
    SITE_BASED_CLUSTERED_MULTIPLE_SITES:
      'Site-based - clustered / multiple sites',
    TENANT_BASED_SCATTERED_SITE: 'Tenant-based - scattered site',
  },
  NameDataQuality: {
    NAME_FULL_NAME_REPORTED: 'Full name reported',
    NAME_PARTIAL_STREET_NAME_OR_CODE_NAME_REPORTED:
      'Partial, street name, or code name reported',
    NAME_CLIENT_DOESN_T_KNOW: "Client doesn't know",
    NAME_CLIENT_REFUSED: 'Client refused',
    NAME_DATA_NOT_COLLECTED: 'Data not collected',
  },
  PATHReferralOutcome: {
    ATTAINED: 'Attained',
    NOT_ATTAINED: 'Not attained',
    UNKNOWN: 'Unknown',
  },
  PrioritizationStatus: {
    PLACED_ON_PRIORITIZATION_LIST: 'Placed on prioritization list',
    NOT_PLACED_ON_PRIORITIZATION_LIST: 'Not placed on prioritization list',
  },
  ProbSolDivRRResult: {
    NO: 'No',
    YES: 'Yes',
    DATA_NOT_COLLECTED: 'Data not collected',
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
    RACE_AM_IND_AK_NATIVE: 'American Indian, Alaska Native, or Indigenous',
    RACE_ASIAN: 'Asian or Asian American',
    RACE_BLACK_AF_AMERICAN: 'Black, African American, or African',
    RACE_NATIVE_HI_PACIFIC: 'Native Hawaiian or Pacific Islander',
    RACE_WHITE: 'White',
    RACE_UNKNOWN: "Client doesn't know",
    RACE_REFUSED: 'Client refused',
    RACE_NOT_COLLECTED: 'Data not collected',
  },
  RecordType: {
    PATH_SERVICE: 'PATH service',
    RHY_SERVICE_CONNECTIONS: 'RHY service connections',
    HOPWA_SERVICE: 'HOPWA service',
    SSVF_SERVICE: 'SSVF service',
    HOPWA_FINANCIAL_ASSISTANCE: 'HOPWA financial assistance',
    SSVF_FINANCIAL_ASSISTANCE: 'SSVF financial assistance',
    PATH_REFERRAL: 'PATH referral',
    RHY_REFERRAL: 'RHY referral',
    BED_NIGHT: 'Bed night',
    HUD_VASH_OTH_VOUCHER_TRACKING: 'HUD-VASH OTH voucher tracking',
    C2_MOVING_ON_ASSISTANCE_PROVIDED: 'C2 Moving On Assistance Provided',
  },
  ReferralCaseManageAfter: {
    NO: 'No',
    YES: 'Yes',
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  ReferralResult: {
    SUCCESSFUL_REFERRAL_CLIENT_ACCEPTED: 'Successful referral: client accepted',
    UNSUCCESSFUL_REFERRAL_CLIENT_REJECTED:
      'Unsuccessful referral: client rejected',
    UNSUCCESSFUL_REFERRAL_PROVIDER_REJECTED:
      'Unsuccessful referral: provider rejected',
  },
  RelationshipToHoH: {
    SELF_HEAD_OF_HOUSEHOLD_: 'Self (head of household)',
    CHILD: 'Child',
    SPOUSE_OR_PARTNER: 'Spouse or partner',
    OTHER_RELATIVE: 'Other relative',
    UNRELATED_HOUSEHOLD_MEMBER: 'Unrelated household member',
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  SSNDataQuality: {
    SSN_FULL_SSN_REPORTED: 'Full SSN reported',
    SSN_APPROXIMATE_OR_PARTIAL_SSN_REPORTED:
      'Approximate or partial SSN reported',
    SSN_CLIENT_DOESN_T_KNOW: "Client doesn't know",
    SSN_CLIENT_REFUSED: 'Client refused',
    SSN_DATA_NOT_COLLECTED: 'Data not collected',
  },
  ServiceSubTypeProvided: {
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__HEALTH_CARE_SERVICES:
      'Health care services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__VA_VOCATIONAL_AND_REHABILITATION_COUNSELING:
      'VA vocational and rehabilitation counseling',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__PERSONAL_FINANCIAL_PLANNING_SERVICES:
      'Personal financial planning services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__DAILY_LIVING_SERVICES:
      'Daily living services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__EMPLOYMENT_AND_TRAINING_SERVICES:
      'Employment and training services',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__TRANSPORTATION_SERVICES:
      'Transportation services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__PERSONAL_FINANCIAL_PLANNING_SERVICES:
      'Personal financial planning services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__EDUCATIONAL_ASSISTANCE:
      'Educational assistance',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__INCOME_SUPPORT_SERVICES:
      'Income support services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__TRANSPORTATION_SERVICES:
      'Transportation services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__HEALTH_CARE_SERVICES:
      'Health care services',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__FIDUCIARY_AND_REPRESENTATIVE_PAYEE_SERVICES:
      'Fiduciary and representative payee services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__INCOME_SUPPORT_SERVICES:
      'Income support services',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_CHILD_SUPPORT:
      'Legal services - child support',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__FIDUCIARY_AND_REPRESENTATIVE_PAYEE_SERVICES:
      'Fiduciary and representative payee services',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_EVICTION_PREVENTION:
      'Legal services - eviction prevention',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_CHILD_SUPPORT:
      'Legal services - child support',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OUTSTANDING_FINES_AND_PENALTIES:
      'Legal services - outstanding fines and penalties',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_EVICTION_PREVENTION:
      'Legal services - eviction prevention',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_RESTORE_ACQUIRE_DRIVER_S_LICENSE:
      "Legal services - restore / acquire driver's license",
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OUTSTANDING_FINES_AND_PENALTIES:
      'Legal services - outstanding fines and penalties',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OTHER:
      'Legal services - other',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_RESTORE_ACQUIRE_DRIVER_S_LICENSE:
      "Legal services - restore / acquire driver's license",
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__CHILD_CARE:
      'Child care',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OTHER:
      'Legal services - other',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__HOUSING_COUNSELING:
      'Housing counseling',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__CHILD_CARE:
      'Child care',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__HOUSING_COUNSELING:
      'Housing counseling',
  },
  ServiceTypeProvided: {
    C2_MOVING_ON_ASSISTANCE_PROVIDED__SUBSIDIZED_HOUSING_APPLICATION_ASSISTANCE:
      'Subsidized housing application assistance',
    HOPWA_FINANCIAL_ASSISTANCE__RENTAL_ASSISTANCE: 'Rental assistance',
    HOPWA_SERVICE__ADULT_DAY_CARE_AND_PERSONAL_ASSISTANCE:
      'Adult day care and personal assistance',
    HUD_VASH_OTH_VOUCHER_TRACKING__REFERRAL_PACKAGE_FORWARDED_TO_PHA:
      'Referral package forwarded to PHA',
    PATH_REFERRAL__COMMUNITY_MENTAL_HEALTH: 'Community mental health',
    PATH_SERVICE__RE_ENGAGEMENT: 'Re-engagement',
    SSVF_FINANCIAL_ASSISTANCE__RENTAL_ASSISTANCE: 'Rental assistance',
    SSVF_SERVICE__OUTREACH_SERVICES: 'Outreach services',
    C2_MOVING_ON_ASSISTANCE_PROVIDED__FINANCIAL_ASSISTANCE_FOR_MOVING_ON_E_G_SECURITY_DEPOSIT_MOVING_EXPENSES_:
      'Financial assistance for Moving On (e.g., security deposit, moving expenses)',
    HOPWA_FINANCIAL_ASSISTANCE__SECURITY_DEPOSITS: 'Security deposits',
    HOPWA_SERVICE__CASE_MANAGEMENT: 'Case management',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_DENIED_BY_PHA:
      'Voucher denied by PHA',
    PATH_REFERRAL__SUBSTANCE_USE_TREATMENT: 'Substance use treatment',
    PATH_SERVICE__SCREENING: 'Screening',
    RHY_SERVICE_CONNECTIONS__COMMUNITY_SERVICE_SERVICE_LEARNING_CSL_:
      'Community service/service learning (CSL)',
    SSVF_FINANCIAL_ASSISTANCE__SECURITY_DEPOSIT: 'Security deposit',
    SSVF_SERVICE__CASE_MANAGEMENT_SERVICES: 'Case management services',
    C2_MOVING_ON_ASSISTANCE_PROVIDED__NON_FINANCIAL_ASSISTANCE_FOR_MOVING_ON_E_G_HOUSING_NAVIGATION_TRANSITION_SUPPORT_:
      'Non-financial assistance for Moving On (e.g., housing navigation, transition support)',
    HOPWA_FINANCIAL_ASSISTANCE__UTILITY_DEPOSITS: 'Utility deposits',
    HOPWA_SERVICE__CHILD_CARE: 'Child care',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_ISSUED_BY_PHA:
      'Voucher issued by PHA',
    PATH_REFERRAL__PRIMARY_HEALTH_DENTAL_CARE: 'Primary health/dental care',
    PATH_SERVICE__HABILITATION_REHABILITATION: 'Habilitation/rehabilitation',
    SSVF_FINANCIAL_ASSISTANCE__UTILITY_DEPOSIT: 'Utility deposit',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS:
      'Assistance obtaining VA benefits',
    C2_MOVING_ON_ASSISTANCE_PROVIDED__HOUSING_REFERRAL_PLACEMENT:
      'Housing referral/placement',
    HOPWA_FINANCIAL_ASSISTANCE__UTILITY_PAYMENTS: 'Utility payments',
    HOPWA_SERVICE__CRIMINAL_JUSTICE_LEGAL_SERVICES:
      'Criminal justice/legal services',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_REVOKED_OR_EXPIRED:
      'Voucher revoked or expired',
    PATH_REFERRAL__JOB_TRAINING: 'Job training',
    PATH_SERVICE__COMMUNITY_MENTAL_HEALTH: 'Community mental health',
    SSVF_FINANCIAL_ASSISTANCE__UTILITY_FEE_PAYMENT_ASSISTANCE:
      'Utility fee payment assistance',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS:
      'Assistance obtaining/coordinating other public benefits',
    C2_MOVING_ON_ASSISTANCE_PROVIDED__OTHER_PLEASE_SPECIFY_:
      'Other (please specify)',
    HOPWA_SERVICE__EDUCATION: 'Education',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_IN_USE_VETERAN_MOVED_INTO_HOUSING:
      'Voucher in use - veteran moved into housing',
    PATH_REFERRAL__EDUCATIONAL_SERVICES: 'Educational services',
    PATH_SERVICE__SUBSTANCE_USE_TREATMENT: 'Substance use treatment',
    RHY_SERVICE_CONNECTIONS__EDUCATION: 'Education',
    SSVF_FINANCIAL_ASSISTANCE__MOVING_COSTS: 'Moving costs',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS:
      'Direct provision of other public benefits',
    HOPWA_SERVICE__EMPLOYMENT_AND_TRAINING_SERVICES:
      'Employment and training services',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_WAS_PORTED_LOCALLY:
      'Voucher was ported locally',
    PATH_REFERRAL__HOUSING_SERVICES: 'Housing services',
    PATH_SERVICE__CASE_MANAGEMENT: 'Case management',
    RHY_SERVICE_CONNECTIONS__EMPLOYMENT_AND_TRAINING_SERVICES:
      'Employment and training services',
    SSVF_SERVICE__OTHER_NON_TFA_SUPPORTIVE_SERVICE_APPROVED_BY_VA:
      'Other (non-TFA) supportive service approved by VA',
    HOPWA_FINANCIAL_ASSISTANCE__MORTGAGE_ASSISTANCE: 'Mortgage assistance',
    HOPWA_SERVICE__FOOD_MEALS_NUTRITIONAL_SERVICES:
      'Food/meals/nutritional services',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_WAS_ADMINISTRATIVELY_ABSORBED_BY_NEW_PHA:
      'Voucher was administratively absorbed by new PHA',
    PATH_REFERRAL__PERMANENT_HOUSING: 'Permanent housing',
    PATH_SERVICE__RESIDENTIAL_SUPPORTIVE_SERVICES:
      'Residential supportive services',
    RHY_SERVICE_CONNECTIONS__CRIMINAL_JUSTICE_LEGAL_SERVICES:
      'Criminal justice /legal services',
    HOPWA_SERVICE__HEALTH_MEDICAL_CARE: 'Health/medical care',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_WAS_CONVERTED_TO_HOUSING_CHOICE_VOUCHER:
      'Voucher was converted to Housing Choice Voucher',
    PATH_REFERRAL__INCOME_ASSISTANCE: 'Income assistance',
    PATH_SERVICE__HOUSING_MINOR_RENOVATION: 'Housing minor renovation',
    RHY_SERVICE_CONNECTIONS__LIFE_SKILLS_TRAINING: 'Life skills training',
    SSVF_FINANCIAL_ASSISTANCE__TRANSPORTATION_SERVICES_TOKENS_VOUCHERS:
      'Transportation services: tokens/vouchers',
    HOPWA_SERVICE__LIFE_SKILLS_TRAINING: 'Life skills training',
    HUD_VASH_OTH_VOUCHER_TRACKING__VETERAN_EXITED_VOUCHER_WAS_RETURNED:
      'Veteran exited - voucher was returned',
    PATH_REFERRAL__EMPLOYMENT_ASSISTANCE: 'Employment assistance',
    PATH_SERVICE__HOUSING_MOVING_ASSISTANCE: 'Housing moving assistance',
    SSVF_FINANCIAL_ASSISTANCE__TRANSPORTATION_SERVICES_VEHICLE_REPAIR_MAINTENANCE:
      'Transportation services: vehicle repair/maintenance',
    HOPWA_SERVICE__MENTAL_HEALTH_CARE_COUNSELING:
      'Mental health care/counseling',
    HUD_VASH_OTH_VOUCHER_TRACKING__VETERAN_EXITED_FAMILY_MAINTAINED_THE_VOUCHER:
      'Veteran exited - family maintained the voucher',
    PATH_REFERRAL__MEDICAL_INSURANCE: 'Medical insurance',
    PATH_SERVICE__HOUSING_ELIGIBILITY_DETERMINATION:
      'Housing eligibility determination',
    RHY_SERVICE_CONNECTIONS__PARENTING_EDUCATION_FOR_YOUTH_WITH_CHILDREN:
      'Parenting education for youth with children',
    SSVF_FINANCIAL_ASSISTANCE__CHILD_CARE: 'Child care',
    HOPWA_SERVICE__OUTREACH_AND_OR_ENGAGEMENT: 'Outreach and/or engagement',
    HUD_VASH_OTH_VOUCHER_TRACKING__VETERAN_EXITED_PRIOR_TO_EVER_RECEIVING_A_VOUCHER:
      'Veteran exited - prior to ever receiving a voucher',
    PATH_REFERRAL__TEMPORARY_HOUSING: 'Temporary housing',
    PATH_SERVICE__SECURITY_DEPOSITS: 'Security deposits',
    SSVF_FINANCIAL_ASSISTANCE__GENERAL_HOUSING_STABILITY_ASSISTANCE_EMERGENCY_SUPPLIES:
      'General housing stability assistance - emergency supplies',
    HOPWA_SERVICE__SUBSTANCE_ABUSE_SERVICES_TREATMENT:
      'Substance abuse services/treatment',
    HUD_VASH_OTH_VOUCHER_TRACKING__OTHER: 'Other',
    PATH_SERVICE__ONE_TIME_RENT_FOR_EVICTION_PREVENTION:
      'One-time rent for eviction prevention',
    RHY_SERVICE_CONNECTIONS__POST_NATAL_CARE: 'Post-natal care',
    SSVF_FINANCIAL_ASSISTANCE__GENERAL_HOUSING_STABILITY_ASSISTANCE:
      'General housing stability assistance',
    HOPWA_SERVICE__TRANSPORTATION: 'Transportation',
    RHY_SERVICE_CONNECTIONS__PRE_NATAL_CARE: 'Pre-natal care',
    HOPWA_SERVICE__OTHER_HOPWA_FUNDED_SERVICE: 'Other HOPWA funded service',
    PATH_SERVICE__CLINICAL_ASSESSMENT: 'Clinical assessment',
    RHY_SERVICE_CONNECTIONS__HEALTH_MEDICAL_CARE: 'Health/medical care',
    SSVF_FINANCIAL_ASSISTANCE__EMERGENCY_HOUSING_ASSISTANCE:
      'Emergency housing assistance',
    SSVF_FINANCIAL_ASSISTANCE__EXTENDED_SHALLOW_SUBSIDY_RENTAL_ASSISTANCE:
      'Extended Shallow Subsidy - Rental Assistance',
    SSVF_FINANCIAL_ASSISTANCE__FOOD_ASSISTANCE: 'Food Assistance',
    RHY_SERVICE_CONNECTIONS__SUBSTANCE_USE_DISORDER_TREATMENT:
      'Substance use disorder treatment',
    RHY_SERVICE_CONNECTIONS__SUBSTANCE_USE_DISORDER_PREVENTION_SERVICES:
      'Substance use disorder/Prevention Services',
    RHY_SERVICE_CONNECTIONS__HOME_BASED_SERVICES: 'Home-based Services',
    RHY_SERVICE_CONNECTIONS__POST_NATAL_NEWBORN_CARE_WELLNESS_EXAMS_IMMUNIZATIONS_:
      'Post-natal newborn care (wellness exams; immunizations)',
    RHY_SERVICE_CONNECTIONS__STD_TESTING: 'STD Testing',
    RHY_SERVICE_CONNECTIONS__STREET_BASED_SERVICES: 'Street-based Services',
    BED_NIGHT__BED_NIGHT: 'BedNight',
  },
  TargetPopulation: {
    DOMESTIC_VIOLENCE_VICTIMS: 'Domestic violence victims',
    PERSONS_WITH_HIV_AIDS: 'Persons with HIV/AIDS',
    NOT_APPLICABLE: 'Not applicable',
  },
  TrackingMethod: {
    ENTRY_EXIT_DATE: 'Entry/Exit Date',
    NIGHT_BY_NIGHT: 'Night-by-Night',
  },
  VeteranStatus: {
    VETERAN_STATUS_NO: 'No',
    VETERAN_STATUS_YES: 'Yes',
    VETERAN_STATUS_CLIENT_DOESN_T_KNOW: "Client doesn't know",
    VETERAN_STATUS_CLIENT_REFUSED: 'Client refused',
    VETERAN_STATUS_DATA_NOT_COLLECTED: 'Data not collected',
  },
};
