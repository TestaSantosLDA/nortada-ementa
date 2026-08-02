## Purpose

Presenças por dia: quantas pessoas vêm com cada conta, com totais por jantar.

## Requirements

### Requirement: Default attendance count
Each signed-in account SHALL contribute its household size to every day's attendance total by default, without requiring any per-day action.

#### Scenario: No overrides for a day
- **WHEN** three accounts with household sizes 2, 1, and 3 have never adjusted a specific day
- **THEN** that day's total attendance count is 6

### Requirement: Per-day attendance override
An account SHALL be able to override its own contribution for a specific day to any non-negative number, distinct from its default household size.

#### Scenario: Declining a day entirely
- **WHEN** an account with household size 3 sets its count to 0 for a specific day
- **THEN** that account contributes 0 to that day's total, and its default household size is unaffected for other days

#### Scenario: Reducing partial attendance
- **WHEN** an account with household size 3 sets its count to 1 for a specific day (only one of them is going)
- **THEN** that account contributes 1 to that day's total

#### Scenario: Bringing extra guests
- **WHEN** an account with household size 2 sets its count to 4 for a specific day (bringing 2 extra guests)
- **THEN** that account contributes 4 to that day's total

#### Scenario: An account can only change its own count
- **WHEN** an account attempts to set the attendance count for a different account's uid
- **THEN** the write is rejected

### Requirement: Aggregated total shown on the day card
Each day's card SHALL display a single summed attendance total: the sum, across all accounts that have created a profile, of each account's per-day count (its override if set, otherwise its default household size).

#### Scenario: Total updates in real time
- **WHEN** one account changes its count for a day while another device has that day's card open
- **THEN** the displayed total updates on the other device without a page reload

### Requirement: Real-time sync with mandatory auth
Attendance data SHALL sync in real time via Firebase for signed-in accounts. There is no local/anonymous fallback for attendance, consistent with the mandatory sign-in gate.

#### Scenario: Attendance write while offline
- **WHEN** a signed-in account tries to change its count while the connection to Firebase is unavailable
- **THEN** the app shows an error and does not silently store the change locally
