export const encounterTypeDefs = /* GraphQL */ `
  type EncounterCharacter {
    name: String!
    maxHP: Int!
    currentHP: Int!
    conditions: [String!]!
    armorClass: Int!
  }

  type EncounterTemplate {
    _id: ID!
    name: String!
    description: String
    notes: [String!]!
    enemies: [EncounterCharacter!]!
    status: String!
    createdAt: String!
  }

  type Encounter {
    _id: ID!
    name: String!
    description: String
    notes: [String!]!
    enemies: [EncounterCharacter!]!
    status: String!
    players: [EncounterPlayerId!]!
    npcs: [EncounterCharacter!]!
    initiativeOrder: [InitiativeOrder!]!
    currentRound: Int!
    currentTurn: Int!
  }

  type EncounterPlayerId {
    _id: String!
  }

  type InitiativeOrder {
    characterId: Int!
    initiative: Int!
  }

  input NewEncounterTemplateInput {
    name: String!
    description: String
    notes: [String!] = []
    enemies: [NewEncounterCharacterInput!]!
    status: String = "inactive"
  }

  input NewEncounterInput {
    name: String!
    description: String
    notes: [String!] = []
    enemies: [NewEncounterCharacterInput!]!
    status: String = "inactive"
    players: [EncounterPlayerIdInput!] = []
    npcs: [NewEncounterCharacterInput!] = []
    initiativeOrder: [InitiativeOrderInput!] = []
    currentRound: Int = 0
    currentTurn: Int = 0
  }

  input NewEncounterCharacterInput {
    name: String!
    maxHP: Int!
    currentHP: Int!
    conditions: [String!]!
    armorClass: Int!
  }

  input EncounterPlayerIdInput {
    _id: String!
  }

  input InitiativeOrderInput {
    characterId: Int!
    initiative: Int!
  }
`;
