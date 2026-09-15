import { matchRoutes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import {
  AdminDashboardRoutes,
  allRoutes,
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
  ReferralRoutes,
  Routes,
} from './routes';

// Mirrors useCurrentPath, which returns the matched route template.
const matchedPath = (pathname: string) =>
  matchRoutes(allRoutes, { pathname })?.[0]?.route.path;

// Mirrors the pathHeaderLink in apolloClient, which reads params off the match.
const matchedParams = (pathname: string) =>
  matchRoutes(allRoutes, { pathname })?.[0]?.params;

describe('allRoutes', () => {
  it('builds absolute, singly-prefixed paths', () => {
    expect(allRoutes.length).toBeGreaterThan(0);
    allRoutes.forEach(({ path }) => {
      expect(path.startsWith('/')).toBe(true);
      expect(path).not.toContain('//');
    });
  });
});

describe('matchRoutes against allRoutes', () => {
  it('matches top-level routes', () => {
    expect(matchedPath('/')).toBe(Routes.CLIENT_SEARCH);
    expect(matchedPath('/projects')).toBe(Routes.ALL_PROJECTS);
    expect(matchedPath('/referrals')).toBe(Routes.REFERRALS);
  });

  it('matches dashboard roots', () => {
    expect(matchedPath('/client/abc123')).toBe(Routes.CLIENT_DASHBOARD);
    expect(matchedPath('/projects/p1')).toBe(Routes.PROJECT);
    expect(matchedPath('/client/abc123/enrollments/e1')).toBe(
      Routes.ENROLLMENT_DASHBOARD
    );
  });

  it('matches nested dashboard routes', () => {
    expect(matchedPath('/client/abc123/profile')).toBe(
      ClientDashboardRoutes.PROFILE
    );
    expect(matchedPath('/client/abc123/enrollments/e1/overview')).toBe(
      EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW
    );
    expect(matchedPath('/projects/p1/enrollments/households')).toBe(
      ProjectDashboardRoutes.PROJECT_ENROLLMENTS_HOUSEHOLDS
    );
    expect(matchedPath('/admin/forms/some-identifier')).toBe(
      AdminDashboardRoutes.VIEW_FORM
    );
  });

  // allRoutes is a flat list, so these only resolve correctly because of
  // matchRoutes' ranking. A change in ranking would silently reroute them.
  it('prefers static segments over dynamic ones', () => {
    expect(matchedPath('/client/new')).toBe(Routes.CREATE_CLIENT);
    expect(matchedPath('/projects/new-organization')).toBe(
      Routes.CREATE_ORGANIZATION
    );
    expect(matchedPath('/client/abc123/enrollments/new')).toBe(
      ClientDashboardRoutes.NEW_ENROLLMENT
    );
    expect(matchedPath('/referrals/eligible-clients')).toBe(
      ReferralRoutes.ELIGIBLE_CLIENTS
    );
    expect(matchedPath('/admin/rules/global/new')).toBe(
      AdminDashboardRoutes.CE_RULE_GLOBAL_NEW
    );
  });

  it('matches an optional trailing param with and without the segment', () => {
    expect(matchedPath('/projects/p1/add-household')).toBe(
      ProjectDashboardRoutes.ADD_HOUSEHOLD
    );
    expect(matchedPath('/projects/p1/add-household/h1')).toBe(
      ProjectDashboardRoutes.ADD_HOUSEHOLD
    );
  });

  it('extracts params used to build the X-Hmis-Path header', () => {
    expect(matchedParams('/client/abc123/enrollments/e1')).toEqual({
      clientId: 'abc123',
      enrollmentId: 'e1',
    });
    expect(matchedParams('/projects/p1/ce/referrals/r1/tasks/s1')).toEqual({
      projectId: 'p1',
      referralId: 'r1',
      stepId: 's1',
    });
  });

  it('returns no match for an unknown path', () => {
    expect(matchedPath('/not/a/real/route')).toBeUndefined();
  });
});
