// the HTTP header name we expect to contain the user id
export const HMIS_SESSION_UID_HEADER = 'X-app-user-id';
// event fired by request handler for HMIS_SESSION_UID_HEADER
export const HMIS_REMOTE_SESSION_UID_EVENT = 'HmisRemoteSessionUserId';
// event fired to update the application
export const HMIS_APP_SESSION_UID_EVENT = 'HmisAppSessionUserId';
