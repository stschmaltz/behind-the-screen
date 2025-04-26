# API Documentation

## Overview

Behind-the-screen uses GraphQL for its API layer. This document outlines the available queries, mutations, and types for the encounter management system.

## Authentication

All API requests require authentication using Auth0. The API expects a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## GraphQL Endpoint

All GraphQL requests are sent to the following endpoint:

```
POST /api/graphql
```

## Types

### Encounter

```graphql
type Encounter {
  _id: ID!
  name: String!
  description: String
  notes: [String!]!
  enemies: [EncounterCharacter!]!
  status: EncounterStatus!
  players: [Player!]!
  npcs: [EncounterCharacter!]!
  initiativeOrder: [InitiativeOrderCharacter!]!
  currentRound: Int!
  currentTurn: Int!
  userId: ID!
  createdAt: DateTime!
}

enum EncounterStatus {
  ACTIVE
  INACTIVE
  COMPLETED
}
```

### EncounterCharacter

```graphql
type EncounterCharacter {
  _id: ID!
  name: String!
  maxHP: Int!
  armorClass: Int!
}
```

### InitiativeOrderCharacter

```graphql
type InitiativeOrderCharacter {
  _id: ID!
  name: String!
  armorClass: Int
  maxHP: Int
  currentHP: Int
  initiative: Int
  conditions: [Condition!]!
  type: CharacterType!
}

enum CharacterType {
  PLAYER
  NPC
  ENEMY
}

enum Condition {
  BLINDED
  CHARMED
  DEAFENED
  FRIGHTENED
  GRAPPLED
  INCAPACITATED
  INVISIBLE
  PARALYZED
  PETRIFIED
  POISONED
  PRONE
  RESTRAINED
  STUNNED
  UNCONSCIOUS
}
```

### Player

```graphql
type Player {
  _id: ID!
}
```

## Queries

### Get All Encounters

Retrieves all encounters for the current user.

```graphql
query GetAllEncounters {
  encounters {
    _id
    name
    description
    status
    createdAt
  }
}
```

### Get Encounter By ID

Retrieves a specific encounter by ID.

```graphql
query GetEncounterById($id: ID!) {
  encounter(id: $id) {
    _id
    name
    description
    notes
    enemies {
      _id
      name
      maxHP
      armorClass
    }
    status
    players {
      _id
    }
    npcs {
      _id
      name
      maxHP
      armorClass
    }
    initiativeOrder {
      _id
      name
      armorClass
      maxHP
      currentHP
      initiative
      conditions
      type
    }
    currentRound
    currentTurn
    createdAt
  }
}
```

## Mutations

### Create Encounter

Creates a new encounter.

```graphql
mutation CreateEncounter($input: CreateEncounterInput!) {
  createEncounter(input: $input) {
    _id
    name
    description
    status
  }
}

input CreateEncounterInput {
  name: String!
  description: String
  enemies: [EncounterCharacterInput!]
  notes: [String!]
}

input EncounterCharacterInput {
  name: String!
  maxHP: Int!
  armorClass: Int!
}
```

### Update Encounter

Updates an existing encounter.

```graphql
mutation UpdateEncounter($id: ID!, $input: UpdateEncounterInput!) {
  updateEncounter(id: $id, input: $input) {
    _id
    name
    description
    status
  }
}

input UpdateEncounterInput {
  name: String
  description: String
  enemies: [EncounterCharacterInput!]
  notes: [String!]
  status: EncounterStatus
}
```

### Delete Encounter

Deletes an encounter.

```graphql
mutation DeleteEncounter($id: ID!) {
  deleteEncounter(id: $id)
}
```

### Start Encounter

Starts an encounter and initializes the initiative order.

```graphql
mutation StartEncounter($id: ID!, $initiatives: [InitiativeInput!]!) {
  startEncounter(id: $id, initiatives: $initiatives) {
    _id
    status
    initiativeOrder {
      _id
      name
      initiative
      type
    }
    currentRound
    currentTurn
  }
}

input InitiativeInput {
  characterId: ID!
  initiative: Int!
}
```

### Next Turn

Advances to the next turn in the initiative order.

```graphql
mutation NextTurn($id: ID!) {
  nextTurn(id: $id) {
    currentRound
    currentTurn
  }
}
```

### Update Character HP

Updates a character's current hit points.

```graphql
mutation UpdateCharacterHP($encounterId: ID!, $characterId: ID!, $hp: Int!) {
  updateCharacterHP(
    encounterId: $encounterId
    characterId: $characterId
    hp: $hp
  ) {
    _id
    currentHP
  }
}
```

### Add Condition

Adds a condition to a character.

```graphql
mutation AddCondition(
  $encounterId: ID!
  $characterId: ID!
  $condition: Condition!
) {
  addCondition(
    encounterId: $encounterId
    characterId: $characterId
    condition: $condition
  ) {
    _id
    conditions
  }
}
```

### Remove Condition

Removes a condition from a character.

```graphql
mutation RemoveCondition(
  $encounterId: ID!
  $characterId: ID!
  $condition: Condition!
) {
  removeCondition(
    encounterId: $encounterId
    characterId: $characterId
    condition: $condition
  ) {
    _id
    conditions
  }
}
```

## Example Usage

### Creating a New Encounter

Request:

```graphql
mutation {
  createEncounter(
    input: {
      name: "Goblin Ambush"
      description: "A surprise attack by goblins in the forest"
      enemies: [
        { name: "Goblin 1", maxHP: 7, armorClass: 15 }
        { name: "Goblin 2", maxHP: 7, armorClass: 15 }
        { name: "Goblin Boss", maxHP: 21, armorClass: 17 }
      ]
      notes: ["Goblins are hiding in trees", "Boss has a +1 shortsword"]
    }
  ) {
    _id
    name
    status
  }
}
```

Response:

```json
{
  "data": {
    "createEncounter": {
      "_id": "60f8a5b9c1d2e34567890123",
      "name": "Goblin Ambush",
      "status": "INACTIVE"
    }
  }
}
```

### Starting an Encounter

Request:

```graphql
mutation {
  startEncounter(
    id: "60f8a5b9c1d2e34567890123"
    initiatives: [
      { characterId: "player1", initiative: 18 }
      { characterId: "player2", initiative: 15 }
      { characterId: "goblin1", initiative: 12 }
      { characterId: "goblin2", initiative: 9 }
      { characterId: "goblinBoss", initiative: 16 }
    ]
  ) {
    _id
    status
    initiativeOrder {
      _id
      name
      initiative
    }
    currentRound
    currentTurn
  }
}
```

Response:

```json
{
  "data": {
    "startEncounter": {
      "_id": "60f8a5b9c1d2e34567890123",
      "status": "ACTIVE",
      "initiativeOrder": [
        { "_id": "player1", "name": "Aragorn", "initiative": 18 },
        { "_id": "goblinBoss", "name": "Goblin Boss", "initiative": 16 },
        { "_id": "player2", "name": "Gandalf", "initiative": 15 },
        { "_id": "goblin1", "name": "Goblin 1", "initiative": 12 },
        { "_id": "goblin2", "name": "Goblin 2", "initiative": 9 }
      ],
      "currentRound": 1,
      "currentTurn": 0
    }
  }
}
```

## Error Handling

GraphQL errors are returned in the standard format:

```json
{
  "errors": [
    {
      "message": "Error message",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["encounter"],
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

Common error codes include:

- `NOT_FOUND`: The requested resource was not found
- `UNAUTHORIZED`: Authentication is required
- `FORBIDDEN`: The user does not have permission for this action
- `BAD_USER_INPUT`: The input provided is invalid
- `INTERNAL_SERVER_ERROR`: An internal server error occurred
