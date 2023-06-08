// **** THIS FILE IS GENERATED, DO NOT EDIT DIRECTLY ****

export const HmisEnums = {
  AgeRange: {
    Under5: 'Under 5',
    Ages5to12: '5-12',
    Ages13to17: '13-17',
    Ages18to24: '18-24',
    Ages25to34: '25-34',
    Ages35to44: '35-44',
    Ages45to54: '45-54',
    Ages55to61: '55-61',
    Ages55to64: '55-64',
    Age62Plus: '62+',
    Age65Plus: '65+',
  },
  AssessmentLevel: {
    INVALID: 'Invalid Value',
    CRISIS_NEEDS_ASSESSMENT: 'Crisis Needs Assessment',
    HOUSING_NEEDS_ASSESSMENT: 'Housing Needs Assessment',
  },
  AssessmentRole: {
    ANNUAL: 'Annual Assessment',
    CE: 'Coordinated Entry',
    EXIT: 'Exit Assessment',
    INTAKE: 'Intake Assessment',
    POST_EXIT: 'Post-Exit Assessment',
    UPDATE: 'Update Assessment',
  },
  AssessmentSortOption: {
    ASSESSMENT_DATE: 'Assessment Date: Most Recent First',
    DATE_UPDATED: 'Last Updated: Most Recent First',
  },
  AssessmentType: {
    INVALID: 'Invalid Value',
    PHONE: 'Phone',
    VIRTUAL: 'Virtual',
    IN_PERSON: 'In Person',
  },
  AuditEventType: { create: 'create', destroy: 'destroy', update: 'update' },
  Availability: {
    INVALID: 'Invalid Value',
    YEAR_ROUND: 'Year-round',
    SEASONAL: 'Seasonal',
    OVERFLOW: 'Overflow',
  },
  BedType: {
    INVALID: 'Invalid Value',
    FACILITY_BASED: 'Facility-based',
    VOUCHER: 'Voucher',
    OTHER: 'Other',
  },
  BoundType: { MAX: 'MAX', MIN: 'MIN' },
  ClientAddressType: { both: 'Both', physical: 'Physical', postal: 'Postal' },
  ClientAddressUse: {
    home: 'Home',
    mail: 'Mail',
    old: 'Old',
    temp: 'Temp',
    work: 'Work',
  },
  ClientContactPointSystem: { email: 'Email', phone: 'Phone', url: 'Url' },
  ClientContactPointUse: {
    home: 'Home',
    mobile: 'Mobile',
    old: 'Old',
    temp: 'Temp',
    work: 'Work',
  },
  ClientNameUse: {
    anonymous: 'Anonymous',
    maiden: 'Maiden',
    nickname: 'Nickname',
    official: 'Official',
    old: 'Old',
    temp: 'Temp',
    usual: 'Usual',
  },
  ClientSortOption: {
    FIRST_NAME_A_TO_Z: 'First Name: A-Z',
    FIRST_NAME_Z_TO_A: 'First Name: Z-A',
    LAST_NAME_A_TO_Z: 'Last Name: A-Z',
    LAST_NAME_Z_TO_A: 'Last Name: Z-A',
    AGE_OLDEST_TO_YOUNGEST: 'Age: Oldest to Youngest',
    AGE_YOUNGEST_TO_OLDEST: 'Age: Youngest to Oldest',
  },
  Component: {
    ADDRESS: 'Client Address input',
    ALERT_ERROR: 'Display text as an error alert',
    ALERT_INFO: 'Display text as an info alert',
    ALERT_SUCCESS: 'Display text as a success alert',
    ALERT_WARNING: 'Display text as a warning alert',
    CHECKBOX: 'Render a boolean input item as a checkbox',
    DISABILITY_TABLE:
      'Specialized component for rendering disabilities in a table',
    EMAIL: 'Email address input for ContactPoint',
    HORIZONTAL_GROUP: 'Render a group of inputs horizontally',
    INFO_GROUP: 'Render contents in an info box',
    INPUT_GROUP:
      'Render a group that contains children of the same type (e.g. all booleans)',
    MCI: 'MCI linking component',
    NAME: 'Client Name input',
    PHONE: 'Phone number input for ContactPoint',
    RADIO_BUTTONS: 'Render a choice input item as radio buttons',
    RADIO_BUTTONS_VERTICAL:
      'Render a choice input item as vertical radio buttons',
    SSN: 'SSN input component',
  },
  DOBDataQuality: {
    INVALID: 'Invalid Value',
    FULL_DOB_REPORTED: 'Full DOB',
    APPROXIMATE_OR_PARTIAL_DOB_REPORTED: 'Partial DOB',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  DataCollectedAbout: {
    ALL_CLIENTS: 'ALL_CLIENTS',
    ALL_CLIENTS_RECEIVING_SSVF_FINANCIAL_ASSISTANCE:
      'ALL_CLIENTS_RECEIVING_SSVF_FINANCIAL_ASSISTANCE',
    ALL_CLIENTS_RECEIVING_SSVF_SERVICES: 'ALL_CLIENTS_RECEIVING_SSVF_SERVICES',
    ALL_VETERANS: 'ALL_VETERANS',
    HOH: 'HOH',
    HOH_AND_ADULTS: 'HOH_AND_ADULTS',
    VETERAN_HOH: 'VETERAN_HOH',
  },
  DataCollectionStage: {
    INVALID: 'Invalid Value',
    PROJECT_ENTRY: 'Project entry',
    UPDATE: 'Update',
    PROJECT_EXIT: 'Project exit',
    ANNUAL_ASSESSMENT: 'Annual assessment',
    POST_EXIT: 'Post-exit',
  },
  Destination: {
    INVALID: 'Invalid Value',
    EMERGENCY_SHELTER_INCLUDING_HOTEL_OR_MOTEL_PAID_FOR_WITH_EMERGENCY_SHELTER_VOUCHER_OR_RHY_FUNDED_HOST_HOME_SHELTER:
      'Emergency shelter, including hotel or motel paid for with emergency shelter voucher, or RHY-funded Host Home shelter',
    TRANSITIONAL_HOUSING_FOR_HOMELESS_PERSONS_INCLUDING_HOMELESS_YOUTH:
      'Transitional housing for homeless persons (including homeless youth)',
    PERMANENT_HOUSING_OTHER_THAN_RRH_FOR_FORMERLY_HOMELESS_PERSONS:
      'Permanent housing (other than RRH) for formerly homeless persons',
    PSYCHIATRIC_HOSPITAL_OR_OTHER_PSYCHIATRIC_FACILITY:
      'Psychiatric hospital or other psychiatric facility',
    SUBSTANCE_ABUSE_TREATMENT_FACILITY_OR_DETOX_CENTER:
      'Substance abuse treatment facility or detox center',
    HOSPITAL_OR_OTHER_RESIDENTIAL_NON_PSYCHIATRIC_MEDICAL_FACILITY:
      'Hospital or other residential non-psychiatric medical facility',
    JAIL_PRISON_OR_JUVENILE_DETENTION_FACILITY:
      'Jail, prison or juvenile detention facility',
    RENTAL_BY_CLIENT_NO_ONGOING_HOUSING_SUBSIDY:
      'Rental by client, no ongoing housing subsidy',
    OWNED_BY_CLIENT_NO_ONGOING_HOUSING_SUBSIDY:
      'Owned by client, no ongoing housing subsidy',
    STAYING_OR_LIVING_WITH_FAMILY_TEMPORARY_TENURE_E_G_ROOM_APARTMENT_OR_HOUSE:
      'Staying or living with family, temporary tenure (e.g. room, apartment or house)',
    STAYING_OR_LIVING_WITH_FRIENDS_TEMPORARY_TENURE_E_G_ROOM_APARTMENT_OR_HOUSE:
      'Staying or living with friends, temporary tenure (e.g. room apartment or house)',
    HOTEL_OR_MOTEL_PAID_FOR_WITHOUT_EMERGENCY_SHELTER_VOUCHER:
      'Hotel or motel paid for without emergency shelter voucher',
    FOSTER_CARE_HOME_OR_FOSTER_CARE_GROUP_HOME:
      'Foster care home or foster care group home',
    PLACE_NOT_MEANT_FOR_HABITATION_E_G_A_VEHICLE_AN_ABANDONED_BUILDING_BUS_TRAIN_SUBWAY_STATION_AIRPORT_OR_ANYWHERE_OUTSIDE:
      'Place not meant for habitation (e.g., a vehicle, an abandoned building, bus/train/subway station/airport or anywhere outside)',
    OTHER: 'Other',
    SAFE_HAVEN: 'Safe Haven',
    RENTAL_BY_CLIENT_WITH_VASH_HOUSING_SUBSIDY:
      'Rental by client, with VASH housing subsidy',
    RENTAL_BY_CLIENT_WITH_OTHER_ONGOING_HOUSING_SUBSIDY:
      'Rental by client, with other ongoing housing subsidy',
    OWNED_BY_CLIENT_WITH_ONGOING_HOUSING_SUBSIDY:
      'Owned by client, with ongoing housing subsidy',
    STAYING_OR_LIVING_WITH_FAMILY_PERMANENT_TENURE:
      'Staying or living with family, permanent tenure',
    STAYING_OR_LIVING_WITH_FRIENDS_PERMANENT_TENURE:
      'Staying or living with friends, permanent tenure',
    DECEASED: 'Deceased',
    LONG_TERM_CARE_FACILITY_OR_NURSING_HOME:
      'Long-term care facility or nursing home',
    MOVED_FROM_ONE_HOPWA_FUNDED_PROJECT_TO_HOPWA_PH:
      'Moved from one HOPWA funded project to HOPWA PH',
    MOVED_FROM_ONE_HOPWA_FUNDED_PROJECT_TO_HOPWA_TH:
      'Moved from one HOPWA funded project to HOPWA TH',
    RENTAL_BY_CLIENT_WITH_GPD_TIP_HOUSING_SUBSIDY:
      'Rental by client, with GPD TIP housing subsidy',
    RESIDENTIAL_PROJECT_OR_HALFWAY_HOUSE_WITH_NO_HOMELESS_CRITERIA:
      'Residential project or halfway house with no homeless criteria',
    NO_EXIT_INTERVIEW_COMPLETED: 'No exit interview completed',
    RENTAL_BY_CLIENT_WITH_RRH_OR_EQUIVALENT_SUBSIDY:
      'Rental by client, with RRH or equivalent subsidy',
    HOST_HOME_NON_CRISIS: 'Host Home (non-crisis)',
    RENTAL_BY_CLIENT_WITH_HCV_VOUCHER_TENANT_OR_PROJECT_BASED:
      'Rental by client, with HCV voucher (tenant or project based)',
    RENTAL_BY_CLIENT_IN_A_PUBLIC_HOUSING_UNIT:
      'Rental by client in a public housing unit',
    STAYING_OR_LIVING_IN_A_FAMILY_MEMBER_S_ROOM_APARTMENT_OR_HOUSE:
      "Staying or living in a family member's room, apartment or house",
    STAYING_OR_LIVING_IN_A_FRIEND_S_ROOM_APARTMENT_OR_HOUSE:
      "Staying or living in a friend's room, apartment or house",
    WORKER_UNABLE_TO_DETERMINE: 'Worker unable to determine',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  DisabilityResponse: {
    INVALID: 'Invalid Value',
    NO: 'No',
    ALCOHOL_USE_DISORDER: 'Alcohol use disorder',
    DRUG_USE_DISORDER: 'Drug use disorder',
    BOTH_ALCOHOL_AND_DRUG_USE_DISORDERS: 'Both alcohol and drug use disorders',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  DisabilityType: {
    INVALID: 'Invalid Value',
    PHYSICAL_DISABILITY: 'Physical disability',
    DEVELOPMENTAL_DISABILITY: 'Developmental disability',
    CHRONIC_HEALTH_CONDITION: 'Chronic health condition',
    SUBSTANCE_USE_DISORDER: 'Substance use disorder',
    HIV_AIDS: 'HIV/AIDS',
    MENTAL_HEALTH_DISORDER: 'Mental health disorder',
  },
  DisabledDisplay: { HIDDEN: 'HIDDEN', PROTECTED: 'PROTECTED' },
  EnableBehavior: { ALL: 'ALL', ANY: 'ANY' },
  EnableOperator: {
    ENABLED:
      'Use with answerBoolean to specify is the item should be enabled or not.',
    EQUAL: 'EQUAL',
    EXISTS:
      'Use with answerBoolean to specify if an answer should exist or not.',
    GREATER_THAN: 'GREATER_THAN',
    GREATER_THAN_EQUAL: 'GREATER_THAN_EQUAL',
    IN: 'Whether the value is in the answerCodes array.',
    LESS_THAN: 'LESS_THAN',
    LESS_THAN_EQUAL: 'LESS_THAN_EQUAL',
    NOT_EQUAL: 'NOT_EQUAL',
  },
  EnrollmentFilterOptionStatus: {
    INCOMPLETE: 'Incomplete',
    ACTIVE: 'Active',
    EXITED: 'Exited',
  },
  EnrollmentSortOption: {
    HOUSEHOLD_ID: 'Household ID',
    MOST_RECENT: 'Most Recent',
  },
  EnrollmentStatus: {
    ACTIVE: 'Active',
    ANY_ENTRY_INCOMPLETE: 'Household Entry Incomplete',
    ANY_EXIT_INCOMPLETE: 'Household Exit Incomplete',
    EXITED: 'Exited',
    OWN_ENTRY_INCOMPLETE: 'Entry Incomplete',
    OWN_EXIT_INCOMPLETE: 'Exit Incomplete',
  },
  Ethnicity: {
    INVALID: 'Invalid Value',
    NON_HISPANIC_NON_LATIN_A_O_X: 'Non-Hispanic/Non-Latin(a)(o)(x)',
    HISPANIC_LATIN_A_O_X: 'Hispanic/Latin(a)(o)(x)',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  EventSortOption: { EVENT_DATE: 'EVENT_DATE' },
  EventType: {
    INVALID: 'Invalid Value',
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
    REFERRAL_TO_EMERGENCY_HOUSING_VOUCHER_EHV:
      'Referral to Emergency Housing Voucher (EHV)',
    REFERRAL_TO_A_HOUSING_STABILITY_VOUCHER:
      'Referral to a Housing Stability Voucher',
    REFERRAL_TO_NON_CONTINUUM_SERVICES_INELIGIBLE_FOR_CONTINUUM_SERVICES:
      'Referral to Non-continuum services: Ineligible for continuum services',
    REFERRAL_TO_NON_CONTINUUM_SERVICES_NO_AVAILABILITY_IN_CONTINUUM_SERVICES:
      'Referral to Non-continuum services: No availability in continuum services',
  },
  FeelingFrequency: {
    INVALID: 'Invalid Value',
    NOT_AT_ALL: 'Not at all',
    ONCE_A_MONTH: 'Once a month',
    SEVERAL_TIMES_A_MONTH: 'Several times a month',
    SEVERAL_TIMES_A_WEEK: 'Several times a week',
    AT_LEAST_EVERY_DAY: 'At least every day',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  FileSortOption: {
    DATE_CREATED: 'DATE_CREATED',
    DATE_UPDATED: 'DATE_UPDATED',
  },
  FormRole: {
    ANNUAL: 'Annual Assessment',
    CE: 'Coordinated Entry',
    CLIENT: 'Client',
    CUSTOM: 'Custom Assessment',
    EXIT: 'Exit Assessment',
    FILE: 'File',
    FUNDER: 'Funder',
    INTAKE: 'Intake Assessment',
    INVENTORY: 'Inventory',
    ORGANIZATION: 'Organization',
    POST_EXIT: 'Post-Exit Assessment',
    PROJECT: 'Project',
    PROJECT_COC: 'Project CoC',
    REFERRAL_REQUEST: 'Referral Request',
    SERVICE: 'Service',
    UPDATE: 'Update Assessment',
  },
  FunderSortOption: { START_DATE: 'START_DATE' },
  FundingSource: {
    HHS_PATH_STREET_OUTREACH_SUPPORTIVE_SERVICES_ONLY:
      'HHS: PATH - Street Outreach & Supportive Services Only',
    HHS_RHY_BASIC_CENTER_PROGRAM_PREVENTION_AND_SHELTER:
      'HHS: RHY - Basic Center Program (prevention and shelter)',
    HHS_RHY_DEMONSTRATION_PROJECT: 'HHS: RHY - Demonstration Project',
    HHS_RHY_MATERNITY_GROUP_HOME_FOR_PREGNANT_AND_PARENTING_YOUTH:
      'HHS: RHY - Maternity Group Home for Pregnant and Parenting Youth',
    HHS_RHY_STREET_OUTREACH_PROJECT: 'HHS: RHY - Street Outreach Project',
    HHS_RHY_TRANSITIONAL_LIVING_PROGRAM:
      'HHS: RHY - Transitional Living Program',
    HUD_COC_HOMELESSNESS_PREVENTION_HIGH_PERFORMING_COMMUNITIES_ONLY:
      'HUD: CoC - Homelessness Prevention (High Performing Communities Only)',
    HUD_COC_JOINT_COMPONENT_RRH_PSH: 'HUD: CoC - Joint Component RRH/PSH',
    HUD_COC_JOINT_COMPONENT_TH_RRH: 'HUD: CoC - Joint Component TH/RRH',
    HUD_COC_PERMANENT_SUPPORTIVE_HOUSING:
      'HUD: CoC - Permanent Supportive Housing',
    HUD_COC_RAPID_RE_HOUSING: 'HUD: CoC - Rapid Re-Housing',
    HUD_COC_SAFE_HAVEN: 'HUD: CoC - Safe Haven',
    HUD_COC_SINGLE_ROOM_OCCUPANCY_SRO: 'HUD: CoC - Single Room Occupancy (SRO)',
    HUD_COC_SUPPORTIVE_SERVICES_ONLY: 'HUD: CoC - Supportive Services Only',
    HUD_COC_TRANSITIONAL_HOUSING: 'HUD: CoC - Transitional Housing',
    HUD_COC_YOUTH_HOMELESS_DEMONSTRATION_PROGRAM_YHDP:
      'HUD: CoC - Youth Homeless Demonstration Program (YHDP)',
    HUD_ESG_CV: 'HUD: ESG - CV',
    HUD_ESG_EMERGENCY_SHELTER_OPERATING_AND_OR_ESSENTIAL_SERVICES:
      'HUD: ESG - Emergency Shelter (operating and/or essential services)',
    HUD_ESG_HOMELESSNESS_PREVENTION: 'HUD: ESG - Homelessness Prevention',
    HUD_ESG_RAPID_REHOUSING: 'HUD: ESG - Rapid Rehousing',
    HUD_ESG_RUSH: 'HUD: ESG - RUSH',
    HUD_ESG_STREET_OUTREACH: 'HUD: ESG - Street Outreach',
    HUD_HOME: 'HUD: HOME',
    HUD_HOME_ARP: 'HUD: HOME (ARP)',
    HUD_HOPWA_CV: 'HUD: HOPWA - CV',
    HUD_HOPWA_HOTEL_MOTEL_VOUCHERS: 'HUD: HOPWA - Hotel/Motel Vouchers',
    HUD_HOPWA_HOUSING_INFORMATION: 'HUD: HOPWA - Housing Information',
    HUD_HOPWA_PERMANENT_HOUSING_FACILITY_BASED_OR_TBRA:
      'HUD: HOPWA - Permanent Housing (facility based or TBRA)',
    HUD_HOPWA_PERMANENT_HOUSING_PLACEMENT:
      'HUD: HOPWA - Permanent Housing Placement',
    HUD_HOPWA_SHORT_TERM_RENT_MORTGAGE_UTILITY_ASSISTANCE:
      'HUD: HOPWA - Short-Term Rent, Mortgage, Utility assistance',
    HUD_HOPWA_SHORT_TERM_SUPPORTIVE_FACILITY:
      'HUD: HOPWA - Short-Term Supportive Facility',
    HUD_HOPWA_TRANSITIONAL_HOUSING_FACILITY_BASED_OR_TBRA:
      'HUD: HOPWA - Transitional Housing (facility based or TBRA)',
    HUD_HUD_VASH: 'HUD: HUD/VASH',
    HUD_PAY_FOR_SUCCESS: 'HUD: Pay for Success',
    HUD_PIH_EMERGENCY_HOUSING_VOUCHER: 'HUD: PIH (Emergency Housing Voucher)',
    HUD_PUBLIC_AND_INDIAN_HOUSING_PIH_PROGRAMS:
      'HUD: Public and Indian Housing (PIH) Programs',
    HUD_RURAL_HOUSING_STABILITY_ASSISTANCE_PROGRAM:
      'HUD: Rural Housing Stability Assistance Program',
    VA_COMMUNITY_CONTRACT_SAFE_HAVEN_PROGRAM:
      'VA: Community Contract Safe Haven Program',
    VA_COMPENSATED_WORK_THERAPY_TRANSITIONAL_RESIDENCE:
      'VA: Compensated Work Therapy Transitional Residence',
    VA_CRS_CONTRACT_RESIDENTIAL_SERVICES:
      'VA: CRS Contract Residential Services',
    VA_GRANT_PER_DIEM_BRIDGE_HOUSING: 'VA: Grant Per Diem - Bridge Housing',
    VA_GRANT_PER_DIEM_CASE_MANAGEMENT_HOUSING_RETENTION:
      'VA: Grant Per Diem - Case Management/Housing Retention',
    VA_GRANT_PER_DIEM_CLINICAL_TREATMENT:
      'VA: Grant Per Diem - Clinical Treatment',
    VA_GRANT_PER_DIEM_HOSPITAL_TO_HOUSING:
      'VA: Grant Per Diem - Hospital to Housing',
    VA_GRANT_PER_DIEM_LOW_DEMAND: 'VA: Grant Per Diem - Low Demand',
    VA_GRANT_PER_DIEM_SERVICE_INTENSIVE_TRANSITIONAL_HOUSING:
      'VA: Grant Per Diem - Service Intensive Transitional Housing',
    VA_GRANT_PER_DIEM_TRANSITION_IN_PLACE:
      'VA: Grant Per Diem - Transition in Place',
    VA_SUPPORTIVE_SERVICES_FOR_VETERAN_FAMILIES:
      'VA: Supportive Services for Veteran Families',
    INVALID: 'Invalid Value',
    LOCAL_OR_OTHER_FUNDING_SOURCE: 'Local or Other Funding Source',
    N_A: 'N/A',
  },
  Gender: {
    FEMALE: 'Female',
    MALE: 'Male',
    NO_SINGLE_GENDER:
      'A gender other than singularly female or male (e.g., non-binary, genderfluid, agender, culturally specific gender)',
    TRANSGENDER: 'Transgender',
    QUESTIONING: 'Questioning',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  GeographyType: {
    INVALID: 'Invalid Value',
    URBAN: 'Urban',
    SUBURBAN: 'Suburban',
    RURAL: 'Rural',
    DATA_NOT_COLLECTED: 'Unknown / data not collected',
  },
  HOPWAMedAssistedLivingFac: {
    INVALID: 'Invalid Value',
    NO: 'No',
    YES: 'Yes',
    NON_HOPWA_FUNDED_PROJECT: 'Non-HOPWA Funded Project',
  },
  HealthStatus: {
    INVALID: 'Invalid Value',
    EXCELLENT: 'Excellent',
    VERY_GOOD: 'Very good',
    GOOD: 'Good',
    FAIR: 'Fair',
    POOR: 'Poor',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  HouseholdSortOption: { MOST_RECENT: 'Most Recent' },
  HouseholdType: {
    INVALID: 'Invalid Value',
    HOUSEHOLDS_WITHOUT_CHILDREN: 'Households without children',
    HOUSEHOLDS_WITH_AT_LEAST_ONE_ADULT_AND_ONE_CHILD:
      'Households with at least one adult and one child',
    HOUSEHOLDS_WITH_ONLY_CHILDREN: 'Households with only children',
  },
  HousingType: {
    INVALID: 'Invalid Value',
    SITE_BASED_SINGLE_SITE: 'Site-based - single site',
    SITE_BASED_CLUSTERED_MULTIPLE_SITES:
      'Site-based - clustered / multiple sites',
    TENANT_BASED_SCATTERED_SITE: 'Tenant-based - scattered site',
  },
  InitialBehavior: {
    IF_EMPTY:
      'When loading the form, only set the specified initial value if there is no existing value.',
    OVERWRITE:
      'When loading the form, always overwrite the existing value with specified initial value.',
  },
  InputSize: {
    LARGE: 'LARGE',
    MEDIUM: 'MEDIUM',
    SMALL: 'SMALL',
    XSMALL: 'XSMALL',
  },
  InventoryBedType: {
    CHRONIC: 'Chronic',
    CHRONIC_VETERAN: 'Chronic Veteran',
    CHRONIC_YOUTH: 'Chronic Youth',
    OTHER: 'Other',
    VETERAN: 'Veteran',
    YOUTH: 'Youth',
    YOUTH_VETERAN: 'Youth Veteran',
  },
  InventorySortOption: { START_DATE: 'START_DATE' },
  ItemType: {
    BOOLEAN: 'BOOLEAN',
    CHOICE: 'CHOICE',
    CURRENCY: 'CURRENCY',
    DATE: 'DATE',
    DISPLAY: 'DISPLAY',
    FILE: 'FILE',
    GROUP: 'GROUP',
    IMAGE: 'IMAGE',
    INTEGER: 'INTEGER',
    OBJECT: 'OBJECT',
    OPEN_CHOICE: 'OPEN_CHOICE',
    STRING: 'STRING',
    TEXT: 'TEXT',
  },
  LivingSituation: {
    INVALID: 'Invalid Value',
    EMERGENCY_SHELTER_INCLUDING_HOTEL_OR_MOTEL_PAID_FOR_WITH_EMERGENCY_SHELTER_VOUCHER_OR_RHY_FUNDED_HOST_HOME_SHELTER:
      'Emergency shelter, including hotel or motel paid for with emergency shelter voucher, or RHY-funded Host Home shelter',
    TRANSITIONAL_HOUSING_FOR_HOMELESS_PERSONS_INCLUDING_HOMELESS_YOUTH:
      'Transitional housing for homeless persons (including homeless youth)',
    PERMANENT_HOUSING_OTHER_THAN_RRH_FOR_FORMERLY_HOMELESS_PERSONS:
      'Permanent housing (other than RRH) for formerly homeless persons',
    PSYCHIATRIC_HOSPITAL_OR_OTHER_PSYCHIATRIC_FACILITY:
      'Psychiatric hospital or other psychiatric facility',
    SUBSTANCE_ABUSE_TREATMENT_FACILITY_OR_DETOX_CENTER:
      'Substance abuse treatment facility or detox center',
    HOSPITAL_OR_OTHER_RESIDENTIAL_NON_PSYCHIATRIC_MEDICAL_FACILITY:
      'Hospital or other residential non-psychiatric medical facility',
    JAIL_PRISON_OR_JUVENILE_DETENTION_FACILITY:
      'Jail, prison or juvenile detention facility',
    RENTAL_BY_CLIENT_NO_ONGOING_HOUSING_SUBSIDY:
      'Rental by client, no ongoing housing subsidy',
    OWNED_BY_CLIENT_NO_ONGOING_HOUSING_SUBSIDY:
      'Owned by client, no ongoing housing subsidy',
    STAYING_OR_LIVING_WITH_FAMILY_TEMPORARY_TENURE_E_G_ROOM_APARTMENT_OR_HOUSE:
      'Staying or living with family, temporary tenure (e.g. room, apartment or house)',
    STAYING_OR_LIVING_WITH_FRIENDS_TEMPORARY_TENURE_E_G_ROOM_APARTMENT_OR_HOUSE:
      'Staying or living with friends, temporary tenure (e.g. room apartment or house)',
    HOTEL_OR_MOTEL_PAID_FOR_WITHOUT_EMERGENCY_SHELTER_VOUCHER:
      'Hotel or motel paid for without emergency shelter voucher',
    FOSTER_CARE_HOME_OR_FOSTER_CARE_GROUP_HOME:
      'Foster care home or foster care group home',
    PLACE_NOT_MEANT_FOR_HABITATION_E_G_A_VEHICLE_AN_ABANDONED_BUILDING_BUS_TRAIN_SUBWAY_STATION_AIRPORT_OR_ANYWHERE_OUTSIDE:
      'Place not meant for habitation (e.g., a vehicle, an abandoned building, bus/train/subway station/airport or anywhere outside)',
    OTHER: 'Other',
    SAFE_HAVEN: 'Safe Haven',
    RENTAL_BY_CLIENT_WITH_VASH_HOUSING_SUBSIDY:
      'Rental by client, with VASH housing subsidy',
    RENTAL_BY_CLIENT_WITH_OTHER_ONGOING_HOUSING_SUBSIDY:
      'Rental by client, with other ongoing housing subsidy',
    OWNED_BY_CLIENT_WITH_ONGOING_HOUSING_SUBSIDY:
      'Owned by client, with ongoing housing subsidy',
    STAYING_OR_LIVING_WITH_FAMILY_PERMANENT_TENURE:
      'Staying or living with family, permanent tenure',
    STAYING_OR_LIVING_WITH_FRIENDS_PERMANENT_TENURE:
      'Staying or living with friends, permanent tenure',
    DECEASED: 'Deceased',
    LONG_TERM_CARE_FACILITY_OR_NURSING_HOME:
      'Long-term care facility or nursing home',
    MOVED_FROM_ONE_HOPWA_FUNDED_PROJECT_TO_HOPWA_PH:
      'Moved from one HOPWA funded project to HOPWA PH',
    INTERIM_HOUSING: 'Interim Housing',
    RENTAL_BY_CLIENT_WITH_GPD_TIP_HOUSING_SUBSIDY:
      'Rental by client, with GPD TIP housing subsidy',
    RESIDENTIAL_PROJECT_OR_HALFWAY_HOUSE_WITH_NO_HOMELESS_CRITERIA:
      'Residential project or halfway house with no homeless criteria',
    NO_EXIT_INTERVIEW_COMPLETED: 'No exit interview completed',
    RENTAL_BY_CLIENT_WITH_RRH_OR_EQUIVALENT_SUBSIDY:
      'Rental by client, with RRH or equivalent subsidy',
    HOST_HOME_NON_CRISIS: 'Host Home (non-crisis)',
    RENTAL_BY_CLIENT_WITH_HCV_VOUCHER_TENANT_OR_PROJECT_BASED:
      'Rental by client, with HCV voucher (tenant or project based)',
    RENTAL_BY_CLIENT_IN_A_PUBLIC_HOUSING_UNIT:
      'Rental by client in a public housing unit',
    STAYING_OR_LIVING_IN_A_FAMILY_MEMBER_S_ROOM_APARTMENT_OR_HOUSE:
      "Staying or living in a family member's room, apartment or house",
    STAYING_OR_LIVING_IN_A_FRIEND_S_ROOM_APARTMENT_OR_HOUSE:
      "Staying or living in a friend's room, apartment or house",
    WORKER_UNABLE_TO_DETERMINE: 'Worker unable to determine',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  MonthsHomelessPastThreeYears: {
    INVALID: 'Invalid Value',
    NUM_1: '1',
    NUM_2: '2',
    NUM_3: '3',
    NUM_4: '4',
    NUM_5: '5',
    NUM_6: '6',
    NUM_7: '7',
    NUM_8: '8',
    NUM_9: '9',
    NUM_10: '10',
    NUM_11: '11',
    NUM_12: '12',
    MORE_THAN_12_MONTHS: 'More than 12 months',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  NameDataQuality: {
    INVALID: 'Invalid Value',
    FULL_NAME_REPORTED: 'Full name',
    PARTIAL_STREET_NAME_OR_CODE_NAME_REPORTED:
      'Partial, street name, or code name',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  NoAssistanceReason: {
    INVALID: 'Invalid Value',
    APPLIED_DECISION_PENDING: 'Applied; decision pending',
    APPLIED_CLIENT_NOT_ELIGIBLE: 'Applied; client not eligible',
    CLIENT_DID_NOT_APPLY: 'Client did not apply',
    INSURANCE_TYPE_NOT_APPLICABLE_FOR_THIS_CLIENT:
      'Insurance type not applicable for this client',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  NoYesMissing: {
    INVALID: 'Invalid Value',
    NO: 'No',
    YES: 'Yes',
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  NoYesReasonsForMissingData: {
    YES: 'Yes',
    INVALID: 'Invalid Value',
    NO: 'No',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  OrganizationSortOption: { NAME: 'NAME' },
  PATHReferralOutcome: {
    INVALID: 'Invalid Value',
    ATTAINED: 'Attained',
    NOT_ATTAINED: 'Not attained',
    UNKNOWN: 'Unknown',
  },
  PickListType: {
    AVAILABLE_FILE_TYPES: 'AVAILABLE_FILE_TYPES',
    AVAILABLE_SERVICE_TYPES: 'AVAILABLE_SERVICE_TYPES',
    AVAILABLE_UNITS: 'Unoccupied units in the specified project',
    AVAILABLE_UNIT_TYPES:
      'Unit types that have unoccupied units in the specified project',
    CLIENT_ENROLLMENTS:
      'All Enrollments, including WIP and exited, for the client.',
    COC: 'COC',
    CURRENT_LIVING_SITUATION: 'CURRENT_LIVING_SITUATION',
    DESTINATION: 'DESTINATION',
    ENROLLABLE_PROJECTS: 'Projects that the User can enroll Clients in',
    GEOCODE: 'GEOCODE',
    ORGANIZATION: 'All Organizations that the User can see',
    PRIOR_LIVING_SITUATION: 'PRIOR_LIVING_SITUATION',
    PROJECT: 'All Projects that the User can see',
    REFERRAL_OUTCOME: 'REFERRAL_OUTCOME',
    REFERRAL_POSTING_DENIAL_REASON_TYPES: 'Referral Posting Status',
    REFERRAL_POSTING_STATUSES: 'Referral Posting Status',
    SERVICE_TYPE: 'SERVICE_TYPE',
    STATE: 'STATE',
    SUB_TYPE_PROVIDED_3: 'SUB_TYPE_PROVIDED_3',
    SUB_TYPE_PROVIDED_4: 'SUB_TYPE_PROVIDED_4',
    SUB_TYPE_PROVIDED_5: 'SUB_TYPE_PROVIDED_5',
    UNITS: 'Units in the specified project',
    UNIT_TYPES:
      'Unit types. If project is specified, limited to unit types in the project.',
  },
  PrioritizationStatus: {
    INVALID: 'Invalid Value',
    PLACED_ON_PRIORITIZATION_LIST: 'Placed on prioritization list',
    NOT_PLACED_ON_PRIORITIZATION_LIST: 'Not placed on prioritization list',
  },
  ProjectFilterOptionStatus: { CLOSED: 'Closed', OPEN: 'Open' },
  ProjectSortOption: {
    NAME: 'Name',
    ORGANIZATION_AND_NAME: 'Organization and Name',
  },
  ProjectType: {
    CE: 'Coordinated Entry',
    DAY_SHELTER: 'Day Shelter',
    ES: 'Emergency Shelter',
    INVALID: 'Invalid Value',
    OPH: 'Permanent Housing Only',
    PH: 'Permanent Housing',
    PREVENTION: 'Homelessness Prevention',
    PSH: 'Permanent Supportive Housing',
    RRH: 'Rapid Re-Housing',
    SERVICES_ONLY: 'Services Only',
    SH: 'Safe Haven',
    SO: 'Street Outreach',
    TH: 'Transitional Housing',
    OTHER: 'Other',
  },
  Race: {
    AM_IND_AK_NATIVE: 'American Indian, Alaska Native, or Indigenous',
    ASIAN: 'Asian or Asian American',
    BLACK_AF_AMERICAN: 'Black, African American, or African',
    NATIVE_HI_PACIFIC: 'Native Hawaiian or Pacific Islander',
    WHITE: 'White',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  ReasonNotInsured: {
    INVALID: 'Invalid Value',
    APPLIED_DECISION_PENDING: 'Applied; decision pending',
    APPLIED_CLIENT_NOT_ELIGIBLE: 'Applied; client not eligible',
    CLIENT_DID_NOT_APPLY: 'Client did not apply',
    INSURANCE_TYPE_N_A_FOR_THIS_CLIENT: 'Insurance type N/A for this client',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  RecentItemType: { Client: 'Client', Project: 'Project' },
  RecordType: {
    INVALID: 'Invalid Value',
    CONTACT_12: 'Contact 12',
    CONTACT_13: 'Contact 13',
    PATH_SERVICE: 'PATH Service',
    RHY_SERVICE_CONNECTIONS: 'RHY Service Connections',
    HOPWA_SERVICE: 'HOPWA Service',
    SSVF_SERVICE: 'SSVF Service',
    HOPWA_FINANCIAL_ASSISTANCE: 'HOPWA Financial Assistance',
    SSVF_FINANCIAL_ASSISTANCE: 'SSVF Financial Assistance',
    PATH_REFERRAL: 'PATH Referral',
    RHY_REFERRAL: 'RHY Referral',
    BED_NIGHT: 'Bed Night',
    HUD_VASH_OTH_VOUCHER_TRACKING: 'HUD-VASH OTH Voucher Tracking',
    MOVING_ON_ASSISTANCE: 'Moving On Assistance',
  },
  ReferralPostingStatus: {
    accepted_by_other_program_status: 'Accepted By Other Program',
    accepted_pending_status: 'Accepted Pending',
    accepted_status: 'Accepted',
    assigned_status: 'Assigned',
    assigned_to_other_program_status: 'Assigned To Other Program',
    closed_status: 'Closed',
    denied_pending_status: 'Denied Pending',
    denied_status: 'Denied',
    new_status: 'New',
    not_selected_status: 'Not Selected',
    void_status: 'Void',
  },
  ReferralResult: {
    INVALID: 'Invalid Value',
    SUCCESSFUL_REFERRAL_CLIENT_ACCEPTED: 'Successful referral: client accepted',
    UNSUCCESSFUL_REFERRAL_CLIENT_REJECTED:
      'Unsuccessful referral: client rejected',
    UNSUCCESSFUL_REFERRAL_PROVIDER_REJECTED:
      'Unsuccessful referral: provider rejected',
  },
  RelatedRecordType: {
    CURRENT_LIVING_SITUATION: 'CurrentLivingSituation',
    DISABILITY_GROUP: 'DisabilityGroup',
    EMPLOYMENT_EDUCATION: 'ExmploymentEducation',
    ENROLLMENT: 'Enrollment',
    ENROLLMENT_COC: 'EnrollmentCoc',
    EXIT: 'Exit',
    HEALTH_AND_DV: 'HealthAndDv',
    INCOME_BENEFIT: 'IncomeBenefit',
    YOUTH_EDUCATION_STATUS: 'YouthEducationStatus',
  },
  RelationshipToHoH: {
    INVALID: 'Invalid Value',
    SELF_HEAD_OF_HOUSEHOLD: 'Self (head of household)',
    CHILD: 'Child',
    SPOUSE_OR_PARTNER: 'Spouse or partner',
    OTHER_RELATIVE: 'Other relative',
    UNRELATED_HOUSEHOLD_MEMBER: 'Unrelated household member',
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  ResidencePriorLengthOfStay: {
    ONE_NIGHT_OR_LESS: 'One night or less',
    TWO_TO_SIX_NIGHTS: 'Two to six nights',
    INVALID: 'Invalid Value',
    ONE_WEEK_OR_MORE_BUT_LESS_THAN_ONE_MONTH:
      'One week or more, but less than one month',
    ONE_MONTH_OR_MORE_BUT_LESS_THAN_90_DAYS:
      'One month or more, but less than 90 days',
    NUM_90_DAYS_OR_MORE_BUT_LESS_THAN_ONE_YEAR:
      '90 days or more but less than one year',
    ONE_YEAR_OR_LONGER: 'One year or longer',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  SSNDataQuality: {
    INVALID: 'Invalid Value',
    FULL_SSN_REPORTED: 'Full SSN',
    APPROXIMATE_OR_PARTIAL_SSN_REPORTED: 'Partial SSN',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  ServiceDetailType: { BULK: 'BULK', CLIENT: 'CLIENT' },
  ServiceSortOption: { DATE_PROVIDED: 'DATE_PROVIDED' },
  ServiceSubTypeProvided: {
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__CHILD_CARE:
      'Child care',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__CHILD_CARE:
      'Child care',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__DAILY_LIVING_SERVICES:
      'Daily living services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__EDUCATIONAL_ASSISTANCE:
      'Educational assistance',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__EMPLOYMENT_AND_TRAINING_SERVICES:
      'Employment and training services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__FIDUCIARY_AND_REPRESENTATIVE_PAYEE_SERVICES:
      'Fiduciary and representative payee services',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__FIDUCIARY_AND_REPRESENTATIVE_PAYEE_SERVICES:
      'Fiduciary and representative payee services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__HEALTH_CARE_SERVICES:
      'Health care services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__HEALTH_CARE_SERVICES:
      'Health care services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__HOUSING_COUNSELING:
      'Housing counseling',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__HOUSING_COUNSELING:
      'Housing counseling',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__INCOME_SUPPORT_SERVICES:
      'Income support services',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__INCOME_SUPPORT_SERVICES:
      'Income support services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_CHILD_SUPPORT:
      'Legal services - child support',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_CHILD_SUPPORT:
      'Legal services - child support',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_EVICTION_PREVENTION:
      'Legal services - eviction prevention',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_EVICTION_PREVENTION:
      'Legal services - eviction prevention',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OTHER:
      'Legal services - other',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OTHER:
      'Legal services - other',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OUTSTANDING_FINES_AND_PENALTIES:
      'Legal services - outstanding fines and penalties',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_OUTSTANDING_FINES_AND_PENALTIES:
      'Legal services - outstanding fines and penalties',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_RESTORE_ACQUIRE_DRIVER_S_LICENSE:
      "Legal services - restore / acquire driver's license",
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__LEGAL_SERVICES_RESTORE_ACQUIRE_DRIVER_S_LICENSE:
      "Legal services - restore / acquire driver's license",
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__PERSONAL_FINANCIAL_PLANNING_SERVICES:
      'Personal financial planning services',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__PERSONAL_FINANCIAL_PLANNING_SERVICES:
      'Personal financial planning services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS__TRANSPORTATION_SERVICES:
      'Transportation services',
    SSVF_SERVICE__DIRECT_PROVISION_OF_OTHER_PUBLIC_BENEFITS__TRANSPORTATION_SERVICES:
      'Transportation services',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS__VA_VOCATIONAL_AND_REHABILITATION_COUNSELING:
      'VA vocational and rehabilitation counseling',
    INVALID: 'Invalid Value',
  },
  ServiceTypeProvided: {
    INVALID: 'Invalid Value',
    HOPWA_FINANCIAL_ASSISTANCE__RENTAL_ASSISTANCE: 'Rental assistance',
    HOPWA_SERVICE__ADULT_DAY_CARE_AND_PERSONAL_ASSISTANCE:
      'Adult day care and personal assistance',
    HUD_VASH_OTH_VOUCHER_TRACKING__REFERRAL_PACKAGE_FORWARDED_TO_PHA:
      'Referral package forwarded to PHA',
    MOVING_ON_ASSISTANCE__SUBSIDIZED_HOUSING_APPLICATION_ASSISTANCE:
      'Subsidized housing application assistance',
    PATH_REFERRAL__COMMUNITY_MENTAL_HEALTH: 'Community mental health',
    PATH_SERVICE__RE_ENGAGEMENT: 'Re-engagement',
    SSVF_FINANCIAL_ASSISTANCE__RENTAL_ASSISTANCE: 'Rental assistance',
    SSVF_SERVICE__OUTREACH_SERVICES: 'Outreach services',
    HOPWA_FINANCIAL_ASSISTANCE__SECURITY_DEPOSITS: 'Security deposits',
    HOPWA_SERVICE__CASE_MANAGEMENT: 'Case management',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_DENIED_BY_PHA:
      'Voucher denied by PHA',
    MOVING_ON_ASSISTANCE__FINANCIAL_ASSISTANCE_FOR_MOVING_ON_E_G_SECURITY_DEPOSIT_MOVING_EXPENSES:
      'Financial assistance for Moving On (e.g., security deposit, moving expenses)',
    PATH_REFERRAL__SUBSTANCE_USE_TREATMENT: 'Substance use treatment',
    PATH_SERVICE__SCREENING: 'Screening',
    RHY_SERVICE_CONNECTIONS__COMMUNITY_SERVICE_SERVICE_LEARNING_CSL:
      'Community service/service learning (CSL)',
    SSVF_FINANCIAL_ASSISTANCE__SECURITY_DEPOSIT: 'Security deposit',
    SSVF_SERVICE__CASE_MANAGEMENT_SERVICES: 'Case management services',
    HOPWA_FINANCIAL_ASSISTANCE__UTILITY_DEPOSITS: 'Utility deposits',
    HOPWA_SERVICE__CHILD_CARE: 'Child care',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_ISSUED_BY_PHA:
      'Voucher issued by PHA',
    MOVING_ON_ASSISTANCE__NON_FINANCIAL_ASSISTANCE_FOR_MOVING_ON_E_G_HOUSING_NAVIGATION_TRANSITION_SUPPORT:
      'Non-financial assistance for Moving On (e.g., housing navigation, transition support)',
    PATH_REFERRAL__PRIMARY_HEALTH_DENTAL_CARE: 'Primary health/dental care',
    PATH_SERVICE__HABILITATION_REHABILITATION: 'Habilitation/rehabilitation',
    SSVF_FINANCIAL_ASSISTANCE__UTILITY_DEPOSIT: 'Utility deposit',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_VA_BENEFITS:
      'Assistance obtaining VA benefits',
    HOPWA_FINANCIAL_ASSISTANCE__UTILITY_PAYMENTS: 'Utility payments',
    HOPWA_SERVICE__CRIMINAL_JUSTICE_LEGAL_SERVICES:
      'Criminal justice/legal services',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_REVOKED_OR_EXPIRED:
      'Voucher revoked or expired',
    MOVING_ON_ASSISTANCE__HOUSING_REFERRAL_PLACEMENT:
      'Housing referral/placement',
    PATH_REFERRAL__JOB_TRAINING: 'Job training',
    PATH_SERVICE__COMMUNITY_MENTAL_HEALTH: 'Community mental health',
    SSVF_FINANCIAL_ASSISTANCE__UTILITY_FEE_PAYMENT_ASSISTANCE:
      'Utility fee payment assistance',
    SSVF_SERVICE__ASSISTANCE_OBTAINING_COORDINATING_OTHER_PUBLIC_BENEFITS:
      'Assistance obtaining/coordinating other public benefits',
    HOPWA_SERVICE__EDUCATION: 'Education',
    HUD_VASH_OTH_VOUCHER_TRACKING__VOUCHER_IN_USE_VETERAN_MOVED_INTO_HOUSING:
      'Voucher in use - veteran moved into housing',
    MOVING_ON_ASSISTANCE__OTHER: 'Other',
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
    RHY_SERVICE_CONNECTIONS__POST_NATAL_NEWBORN_CARE_WELLNESS_EXAMS_IMMUNIZATIONS:
      'Post-natal newborn care (wellness exams; immunizations)',
    RHY_SERVICE_CONNECTIONS__STD_TESTING: 'STD Testing',
    RHY_SERVICE_CONNECTIONS__STREET_BASED_SERVICES: 'Street-based Services',
    BED_NIGHT__BED_NIGHT: 'BedNight',
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
  },
  TargetPopulation: {
    INVALID: 'Invalid Value',
    DOMESTIC_VIOLENCE_VICTIMS: 'Domestic violence victims',
    PERSONS_WITH_HIV_AIDS: 'Persons with HIV/AIDS',
    NOT_APPLICABLE: 'Not applicable',
  },
  TimesHomelessPastThreeYears: {
    INVALID: 'Invalid Value',
    ONE_TIME: 'One time',
    TWO_TIMES: 'Two times',
    THREE_TIMES: 'Three times',
    FOUR_OR_MORE_TIMES: 'Four or more times',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  TrackingMethod: {
    INVALID: 'Invalid Value',
    ENTRY_EXIT_DATE: 'Entry/Exit Date',
    NIGHT_BY_NIGHT: 'Night-by-Night',
  },
  ValidationSeverity: { error: 'error', warning: 'warning' },
  ValidationType: {
    data_not_collected: 'data_not_collected',
    information: 'information',
    invalid: 'invalid',
    not_allowed: 'not_allowed',
    not_found: 'not_found',
    out_of_range: 'out_of_range',
    required: 'required',
    server_error: 'server_error',
  },
  WellbeingAgreement: {
    INVALID: 'Invalid Value',
    STRONGLY_DISAGREE: 'Strongly disagree',
    SOMEWHAT_DISAGREE: 'Somewhat disagree',
    NEITHER_AGREE_NOR_DISAGREE: 'Neither agree nor disagree',
    SOMEWHAT_AGREE: 'Somewhat agree',
    STRONGLY_AGREE: 'Strongly agree',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
  WhenDVOccurred: {
    INVALID: 'Invalid Value',
    WITHIN_THE_PAST_THREE_MONTHS: 'Within the past three months',
    THREE_TO_SIX_MONTHS_AGO_EXCLUDING_SIX_MONTHS_EXACTLY:
      'Three to six months ago (excluding six months exactly)',
    SIX_MONTHS_TO_ONE_YEAR_AGO_EXCLUDING_ONE_YEAR_EXACTLY:
      'Six months to one year ago (excluding one year exactly)',
    ONE_YEAR_OR_MORE: 'One year or more',
    CLIENT_REFUSED: 'Client refused',
    CLIENT_DOESN_T_KNOW: "Client doesn't know",
    DATA_NOT_COLLECTED: 'Data not collected',
  },
};
