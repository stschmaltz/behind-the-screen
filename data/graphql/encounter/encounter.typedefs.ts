export const encounterTypeDefs = /* GraphQL */ `
  type EncounterCharacter {
    _id: String!
    name: String!
    maxHP: Int!
    armorClass: Int!
  }

  type EncounterTemplate {
    _id: ID!
    name: String!
    description: String
    notes: [String!]!
    enemies: [EncounterCharacter!]!
    status: String!
    createdAt: Date!
    userId: String!
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
    createdAt: Date!
    userId: String!
  }

  type EncounterPlayerId {
    _id: ID!
  }

  type InitiativeOrder {
    _id: String!
    name: String!
    armorClass: Int
    maxHP: Int
    currentHP: Int
    conditions: [String!]!
    initiative: Int
    type: String!
  }

  input NewEncounterTemplateInput {
    name: String!
    description: String
    notes: [String!] = []
    enemies: [NewEncounterCharacterInput!]!
    status: String = "inactive"
  }

  input NewEncounterInput {
    _id: String
    name: String!
    description: String
    notes: [String!] = []
    enemies: [NewEncounterCharacterInput!]!
    status: String = "inactive"
    players: [EncounterPlayerIdInput!] = []
    npcs: [NewEncounterCharacterInput!] = []
    initiativeOrder: [InitiativeOrderInput!] = []
    currentRound: Int = 1
    currentTurn: Int = 1
    createdAt: Date
    userId: String
  }

  input NewEncounterCharacterInput {
    _id: String!
    name: String!
    maxHP: Int!
    armorClass: Int!
  }

  input EncounterPlayerIdInput {
    _id: String!
  }

  input InitiativeOrderInput {
    _id: String!
    name: String!
    armorClass: Int
    maxHP: Int
    currentHP: Int
    conditions: [String!]!
    initiative: Int
    type: String!
  }

  input DeleteEncounterInput {
    id: String!
  }
`;
