// graphql/encounter/encounter.typeDefs.ts
const encounterTypeDefs = /* GraphQL */ `
  type EncounterCharacter {
    name: String!
    maxHP: Int!
    currentHP: Int!
    armorClass: Int!
    conditions: [String!]!
  }

  type Encounter {
    _id: String!
    name: String!
    description: String
    notes: [String!]!
    enemies: [EncounterCharacter!]!
    status: String!
    # etc...
  }

  input NewEncounterInput {
    name: String!
    description: String
    # etc... match your "NewEncounter" fields
  }
`;

export { encounterTypeDefs };