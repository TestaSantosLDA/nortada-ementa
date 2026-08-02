## ADDED Requirements

### Requirement: Mandatory Google sign-in gate
The system SHALL require a signed-in Google account before rendering the schedule, ementas, or any feedback. Anonymous access SHALL NOT be available.

#### Scenario: First visit, not signed in
- **WHEN** a person opens the site without an active session
- **THEN** the site shows a login screen with an "Entrar com Google" button and no schedule content

#### Scenario: Successful sign-in
- **WHEN** a person completes Google sign-in
- **THEN** the login screen is replaced by the full schedule, and the session persists across page reloads on that device

#### Scenario: Sign-in fails or Firebase is unreachable
- **WHEN** the Google sign-in popup fails, or Firebase is not configured
- **THEN** the site shows a clear error message and does NOT fall back to local/anonymous access

### Requirement: Household profile on first login
The system SHALL prompt a newly signed-in account, exactly once, to declare a default household size (number of people that account represents), and SHALL persist that value for future visits.

#### Scenario: Brand-new account
- **WHEN** an account signs in for the first time (no existing profile)
- **THEN** the app asks "Quantas pessoas vais representar habitualmente?" before showing the schedule, and stores the answer as that account's profile

#### Scenario: Returning account
- **WHEN** an account that already has a profile signs in again
- **THEN** the app skips the household-size prompt and goes straight to the schedule
