export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** An ISO 8601-encoded date */
  ISO8601Date: string;
  /** An ISO 8601-encoded datetime */
  ISO8601DateTime: string;
};

/** HUD Client */
export type Client = {
  __typename?: 'Client';
  dateUpdated: Scalars['ISO8601DateTime'];
  /** Date of birth as format yyyy-mm-dd */
  dob?: Maybe<Scalars['ISO8601Date']>;
  endDate?: Maybe<Scalars['ISO8601DateTime']>;
  enrollments: Array<Enrollment>;
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  personalId: Scalars['String'];
  preferredName?: Maybe<Scalars['String']>;
  pronouns?: Maybe<Scalars['String']>;
  ssnSerial?: Maybe<Scalars['String']>;
  startDate?: Maybe<Scalars['ISO8601DateTime']>;
};

/** HMIS Client search input */
export type ClientSearchInput = {
  /** Date of birth as format yyyy-mm-dd */
  dob?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  /** Client primary key */
  id?: InputMaybe<Scalars['ID']>;
  lastName?: InputMaybe<Scalars['String']>;
  organizations?: InputMaybe<Array<Scalars['ID']>>;
  personalId?: InputMaybe<Scalars['String']>;
  preferredName?: InputMaybe<Scalars['String']>;
  projects?: InputMaybe<Array<Scalars['ID']>>;
  /** Last 4 digits of SSN */
  ssnSerial?: InputMaybe<Scalars['String']>;
  /** Omnisearch string */
  textSearch?: InputMaybe<Scalars['String']>;
  warehouseId?: InputMaybe<Scalars['String']>;
};

/** HUD Client Sorting Options */
export enum ClientSortOption {
  LastNameAsc = 'LAST_NAME_ASC',
  LastNameDesc = 'LAST_NAME_DESC',
}

export type ClientsPaginated = {
  __typename?: 'ClientsPaginated';
  hasMoreAfter: Scalars['Boolean'];
  hasMoreBefore: Scalars['Boolean'];
  limit: Scalars['Int'];
  nodes: Array<Client>;
  nodesCount: Scalars['Int'];
  offset: Scalars['Int'];
  pagesCount: Scalars['Int'];
};

/** HUD Enrollment */
export type Enrollment = {
  __typename?: 'Enrollment';
  entryDate?: Maybe<Scalars['ISO8601DateTime']>;
  exitDate?: Maybe<Scalars['ISO8601DateTime']>;
  id: Scalars['ID'];
  project: Project;
};

/** HUD Organization */
export type Organization = {
  __typename?: 'Organization';
  id: Scalars['ID'];
  organizationName: Scalars['String'];
  /** Get a list of projects for this organization */
  projects: Array<Project>;
};

/** HUD Organization */
export type OrganizationProjectsArgs = {
  projectTypes?: InputMaybe<Array<ProjectType>>;
  sortOrder?: InputMaybe<ProjectSortOption>;
};

/** HUD Organization Sorting Options */
export enum OrganizationSortOption {
  Name = 'NAME',
}

/** HUD Project */
export type Project = {
  __typename?: 'Project';
  id: Scalars['ID'];
  organization: Organization;
  projectName: Scalars['String'];
  projectType: ProjectType;
};

/** HUD Project Sorting Options */
export enum ProjectSortOption {
  Name = 'NAME',
  OrganizationAndName = 'ORGANIZATION_AND_NAME',
}

/** HUD Project Types */
export enum ProjectType {
  /** Coordinated Entry */
  Ce = 'CE',
  /** Day Shelter */
  DayShelter = 'DAY_SHELTER',
  /** Emergency Shelter */
  Es = 'ES',
  /** Permanent Housing Only */
  Oph = 'OPH',
  /** Other */
  Other = 'OTHER',
  /** Permanent Housing */
  Ph = 'PH',
  /** Homelessness Prevention */
  Prevention = 'PREVENTION',
  /** Permanent Supportive Housing */
  Psh = 'PSH',
  /** Rapid Re-Housing */
  Rrh = 'RRH',
  /** Services Only */
  ServicesOnly = 'SERVICES_ONLY',
  /** Safe Haven */
  Sh = 'SH',
  /** Street Outreach */
  So = 'SO',
  /** Transitional Housing */
  Th = 'TH',
}

export type Query = {
  __typename?: 'Query';
  /** Search for clients */
  clientSearch: ClientsPaginated;
  /** Get a list of organizations */
  organizations: Array<Organization>;
  /** Get a list of projects */
  projects: Array<Project>;
};

export type QueryClientSearchArgs = {
  input: ClientSearchInput;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  sortOrder?: InputMaybe<ClientSortOption>;
};

export type QueryOrganizationsArgs = {
  sortOrder?: InputMaybe<OrganizationSortOption>;
};

export type QueryProjectsArgs = {
  projectTypes?: InputMaybe<Array<ProjectType>>;
  sortOrder?: InputMaybe<ProjectSortOption>;
};
