# Primordium

Primordium is a Valorant companion app focused on letting a player keep and switch between multiple Riot identities on one device.

## Language

**Stored Riot Account**:
One authenticated Riot identity paired with its selected Valorant Region on this device.
_Avoid_: Account, profile, user

**Region**:
The user-facing Valorant routing choice used by the app to call Riot/Valorant APIs for a Stored Riot Account.
_Avoid_: Shard in user-facing copy, server

**Profile Snapshot**:
Cached Valorant profile facts for a Stored Riot Account, such as level, XP, and currency balances.
_Avoid_: Profile, account data

## Relationships

- A **Stored Riot Account** has exactly one **Region**.
- A **Stored Riot Account** can have zero or one **Profile Snapshot**.
- A **Profile Snapshot** belongs to exactly one **Stored Riot Account**.

## Example dialogue

> **Dev:** "When the player switches accounts, are they switching the Profile Snapshot?"
> **Domain expert:** "No — they switch the Stored Riot Account; the Profile Snapshot is just cached data for that account."

## Flagged ambiguities

- "account" was used to mean both the Riot login identity and the visible Valorant profile — resolved: the canonical term is **Stored Riot Account**, and the visible profile details are a **Profile Snapshot**.
- "region" maps to Valorant API routing shards in implementation — resolved: use **Region** in domain language and user-facing copy.
