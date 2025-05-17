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
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: any; output: any };
};

export type Adventure = {
  __typename?: 'Adventure';
  _id: Scalars['ID']['output'];
  campaignId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  description: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  status: AdventureStatus;
  updatedAt: Scalars['String']['output'];
};

export enum AdventureStatus {
  Active = 'active',
  Archived = 'archived',
  Completed = 'completed',
}

export type Campaign = {
  __typename?: 'Campaign';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: Maybe<CampaignStatus>;
  updatedAt: Scalars['String']['output'];
};

export enum CampaignStatus {
  Active = 'active',
  Archived = 'archived',
  Completed = 'completed',
}

export type DeleteAdventureInput = {
  id: Scalars['ID']['input'];
};

export type DeleteCampaignInput = {
  id: Scalars['ID']['input'];
};

export type DeleteEncounterInput = {
  id: Scalars['String']['input'];
};

export type Encounter = {
  __typename?: 'Encounter';
  _id: Scalars['ID']['output'];
  adventureId: Maybe<Scalars['String']['output']>;
  campaignId: Scalars['String']['output'];
  createdAt: Scalars['Date']['output'];
  currentRound: Scalars['Int']['output'];
  currentTurn: Scalars['Int']['output'];
  description: Maybe<Scalars['String']['output']>;
  enemies: Array<EncounterCharacter>;
  initiativeOrder: Array<InitiativeOrder>;
  name: Scalars['String']['output'];
  notes: Array<Scalars['String']['output']>;
  npcs: Array<EncounterCharacter>;
  players: Array<EncounterPlayerId>;
  status: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type EncounterCharacter = {
  __typename?: 'EncounterCharacter';
  _id: Scalars['String']['output'];
  actions: Maybe<Scalars['String']['output']>;
  armorClass: Scalars['Int']['output'];
  challenge: Maybe<Scalars['String']['output']>;
  img_url: Maybe<Scalars['String']['output']>;
  legendaryActions: Maybe<Scalars['String']['output']>;
  maxHP: Scalars['Int']['output'];
  meta: Maybe<Scalars['String']['output']>;
  monsterSource: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  speed: Maybe<Scalars['String']['output']>;
  stats: Maybe<MonsterStats>;
  traits: Maybe<Scalars['String']['output']>;
};

export type EncounterPlayerId = {
  __typename?: 'EncounterPlayerId';
  _id: Scalars['ID']['output'];
};

export type EncounterPlayerIdInput = {
  _id: Scalars['String']['input'];
};

export enum EncounterStatus {
  Active = 'active',
  Completed = 'completed',
  Inactive = 'inactive',
}

export type EncounterTemplate = {
  __typename?: 'EncounterTemplate';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['Date']['output'];
  description: Maybe<Scalars['String']['output']>;
  enemies: Array<EncounterCharacter>;
  name: Scalars['String']['output'];
  notes: Array<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type InitiativeOrder = {
  __typename?: 'InitiativeOrder';
  _id: Scalars['String']['output'];
  armorClass: Maybe<Scalars['Int']['output']>;
  conditions: Array<Scalars['String']['output']>;
  currentHP: Maybe<Scalars['Int']['output']>;
  initiative: Maybe<Scalars['Int']['output']>;
  maxHP: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  tempHP: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
};

export type InitiativeOrderInput = {
  _id: Scalars['String']['input'];
  armorClass: InputMaybe<Scalars['Int']['input']>;
  conditions: Array<Scalars['String']['input']>;
  currentHP: InputMaybe<Scalars['Int']['input']>;
  initiative: InputMaybe<Scalars['Int']['input']>;
  maxHP: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  tempHP: InputMaybe<Scalars['Int']['input']>;
  type: Scalars['String']['input'];
};

export type MonsterStats = {
  __typename?: 'MonsterStats';
  CHA: Maybe<Scalars['Int']['output']>;
  CON: Maybe<Scalars['Int']['output']>;
  DEX: Maybe<Scalars['Int']['output']>;
  INT: Maybe<Scalars['Int']['output']>;
  STR: Maybe<Scalars['Int']['output']>;
  WIS: Maybe<Scalars['Int']['output']>;
};

export type MonsterStatsInput = {
  CHA: InputMaybe<Scalars['Int']['input']>;
  CON: InputMaybe<Scalars['Int']['input']>;
  DEX: InputMaybe<Scalars['Int']['input']>;
  INT: InputMaybe<Scalars['Int']['input']>;
  STR: InputMaybe<Scalars['Int']['input']>;
  WIS: InputMaybe<Scalars['Int']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createPlayer: Maybe<Player>;
  deleteAdventure: Maybe<Scalars['Boolean']['output']>;
  deleteCampaign: Maybe<Scalars['Boolean']['output']>;
  deleteEncounter: Maybe<Scalars['Boolean']['output']>;
  deletePlayer: Maybe<Scalars['Boolean']['output']>;
  saveAdventure: Maybe<Adventure>;
  saveCampaign: Maybe<Campaign>;
  saveEncounter: Maybe<Encounter>;
  setActiveCampaign: Maybe<UserPreferences>;
  setTheme: Maybe<UserPreferences>;
  updateEncounterDescription: Maybe<Encounter>;
  updatePlayer: Maybe<Player>;
  updatePlayers: Maybe<Scalars['Boolean']['output']>;
  userSignIn: Maybe<UserSignInResponse>;
};

export type MutationCreatePlayerArgs = {
  input: NewPlayerInput;
};

export type MutationDeleteAdventureArgs = {
  input: DeleteAdventureInput;
};

export type MutationDeleteCampaignArgs = {
  input: DeleteCampaignInput;
};

export type MutationDeleteEncounterArgs = {
  input: DeleteEncounterInput;
};

export type MutationDeletePlayerArgs = {
  id: Scalars['String']['input'];
};

export type MutationSaveAdventureArgs = {
  input: NewAdventureInput;
};

export type MutationSaveCampaignArgs = {
  input: NewCampaignInput;
};

export type MutationSaveEncounterArgs = {
  input: NewEncounterInput;
};

export type MutationSetActiveCampaignArgs = {
  input: SetActiveCampaignInput;
};

export type MutationSetThemeArgs = {
  input: SetThemeInput;
};

export type MutationUpdateEncounterDescriptionArgs = {
  input: UpdateEncounterDescriptionInput;
};

export type MutationUpdatePlayerArgs = {
  input: UpdatePlayerInput;
};

export type MutationUpdatePlayersArgs = {
  input: UpdatePlayersInput;
};

export type MutationUserSignInArgs = {
  input: UserSignInInput;
};

export type NewAdventureInput = {
  campaignId: Scalars['ID']['input'];
  description: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  status: AdventureStatus;
};

export type NewCampaignInput = {
  id: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  status: InputMaybe<CampaignStatus>;
};

export type NewEncounterCharacterInput = {
  _id: Scalars['String']['input'];
  actions: InputMaybe<Scalars['String']['input']>;
  armorClass: Scalars['Int']['input'];
  challenge: InputMaybe<Scalars['String']['input']>;
  img_url: InputMaybe<Scalars['String']['input']>;
  legendaryActions: InputMaybe<Scalars['String']['input']>;
  maxHP: Scalars['Int']['input'];
  meta: InputMaybe<Scalars['String']['input']>;
  monsterSource: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  speed: InputMaybe<Scalars['String']['input']>;
  stats: InputMaybe<MonsterStatsInput>;
  traits: InputMaybe<Scalars['String']['input']>;
};

export type NewEncounterInput = {
  _id: InputMaybe<Scalars['ID']['input']>;
  adventureId: InputMaybe<Scalars['ID']['input']>;
  campaignId: Scalars['ID']['input'];
  currentRound: InputMaybe<Scalars['Int']['input']>;
  currentTurn: InputMaybe<Scalars['Int']['input']>;
  description: InputMaybe<Scalars['String']['input']>;
  enemies: Array<NewEncounterCharacterInput>;
  initiativeOrder: InputMaybe<Array<InitiativeOrderInput>>;
  name: Scalars['String']['input'];
  notes: Array<Scalars['String']['input']>;
  npcs: InputMaybe<Array<NewEncounterCharacterInput>>;
  players: InputMaybe<Array<EncounterPlayerIdInput>>;
  status: InputMaybe<EncounterStatus>;
};

export type NewEncounterTemplateInput = {
  description: InputMaybe<Scalars['String']['input']>;
  enemies: Array<NewEncounterCharacterInput>;
  name: Scalars['String']['input'];
  notes: InputMaybe<Array<Scalars['String']['input']>>;
  status: InputMaybe<Scalars['String']['input']>;
};

export type NewPlayerInput = {
  armorClass: InputMaybe<Scalars['Int']['input']>;
  campaignId: Scalars['ID']['input'];
  level: InputMaybe<Scalars['Int']['input']>;
  maxHP: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
};

export type Player = {
  __typename?: 'Player';
  _id: Scalars['ID']['output'];
  armorClass: Maybe<Scalars['Int']['output']>;
  campaignId: Scalars['ID']['output'];
  createdAt: Scalars['Date']['output'];
  level: Maybe<Scalars['Int']['output']>;
  maxHP: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  allEncounters: Array<Encounter>;
  allPlayers: Array<Player>;
  encounterById: Maybe<Encounter>;
  getAdventure: Maybe<Adventure>;
  getAdventures: Maybe<Array<Maybe<Adventure>>>;
  getAdventuresByCampaign: Maybe<Array<Maybe<Adventure>>>;
  getCampaign: Maybe<Campaign>;
  getCampaigns: Maybe<Array<Maybe<Campaign>>>;
  getUserPreferences: Maybe<UserPreferences>;
  me: User;
  playersByIds: Array<Player>;
};

export type QueryEncounterByIdArgs = {
  id: Scalars['String']['input'];
};

export type QueryGetAdventureArgs = {
  id: Scalars['ID']['input'];
};

export type QueryGetAdventuresByCampaignArgs = {
  campaignId: Scalars['ID']['input'];
};

export type QueryGetCampaignArgs = {
  id: Scalars['ID']['input'];
};

export type QueryPlayersByIdsArgs = {
  ids: Array<Scalars['String']['input']>;
};

export type SetActiveCampaignInput = {
  campaignId: InputMaybe<Scalars['ID']['input']>;
};

export type SetThemeInput = {
  theme: Scalars['String']['input'];
};

export type UpdateEncounterDescriptionInput = {
  _id: Scalars['ID']['input'];
  description: Scalars['String']['input'];
};

export type UpdatePlayerInput = {
  _id: Scalars['String']['input'];
  armorClass: InputMaybe<Scalars['Int']['input']>;
  campaignId: InputMaybe<Scalars['String']['input']>;
  level: InputMaybe<Scalars['Int']['input']>;
  maxHP: InputMaybe<Scalars['Int']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePlayersInput = {
  armorClass: InputMaybe<Scalars['Int']['input']>;
  campaignId: Scalars['ID']['input'];
  level: InputMaybe<Scalars['Int']['input']>;
  levelUp: InputMaybe<Scalars['Boolean']['input']>;
  maxHP: InputMaybe<Scalars['Int']['input']>;
};

export type User = {
  __typename?: 'User';
  _id: Scalars['String']['output'];
  auth0Id: Scalars['String']['output'];
  email: Scalars['String']['output'];
  name: Maybe<Scalars['String']['output']>;
  picture: Maybe<Scalars['String']['output']>;
};

export type UserPreferences = {
  __typename?: 'UserPreferences';
  _id: Scalars['ID']['output'];
  activeCampaignId: Maybe<Scalars['ID']['output']>;
  theme: Maybe<Scalars['String']['output']>;
};

export type UserSignInInput = {
  auth0Id: Scalars['String']['input'];
  email: Scalars['String']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  picture: InputMaybe<Scalars['String']['input']>;
};

export type UserSignInResponse = {
  __typename?: 'UserSignInResponse';
  user: User;
};

export type AllAdventuresQueryVariables = Exact<{ [key: string]: never }>;

export type AllAdventuresQuery = {
  __typename?: 'Query';
  getAdventures: Array<{
    __typename?: 'Adventure';
    _id: string;
    campaignId: string;
    name: string;
    description: string | null;
    status: AdventureStatus;
    createdAt: string;
    updatedAt: string;
  } | null> | null;
};

export type AdventureByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type AdventureByIdQuery = {
  __typename?: 'Query';
  getAdventure: {
    __typename?: 'Adventure';
    _id: string;
    campaignId: string;
    name: string;
    description: string | null;
    status: AdventureStatus;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type AdventuresByCampaignQueryVariables = Exact<{
  campaignId: Scalars['ID']['input'];
}>;

export type AdventuresByCampaignQuery = {
  __typename?: 'Query';
  getAdventuresByCampaign: Array<{
    __typename?: 'Adventure';
    _id: string;
    campaignId: string;
    name: string;
    description: string | null;
    status: AdventureStatus;
    createdAt: string;
    updatedAt: string;
  } | null> | null;
};

export type SaveAdventureMutationVariables = Exact<{
  input: NewAdventureInput;
}>;

export type SaveAdventureMutation = {
  __typename?: 'Mutation';
  saveAdventure: {
    __typename?: 'Adventure';
    _id: string;
    campaignId: string;
    name: string;
    description: string | null;
    status: AdventureStatus;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type DeleteAdventureMutationVariables = Exact<{
  input: DeleteAdventureInput;
}>;

export type DeleteAdventureMutation = {
  __typename?: 'Mutation';
  deleteAdventure: boolean | null;
};

export type AllCampaignsQueryVariables = Exact<{ [key: string]: never }>;

export type AllCampaignsQuery = {
  __typename?: 'Query';
  getCampaigns: Array<{
    __typename?: 'Campaign';
    _id: string;
    name: string;
    status: CampaignStatus | null;
    createdAt: string;
    updatedAt: string;
  } | null> | null;
};

export type CampaignByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type CampaignByIdQuery = {
  __typename?: 'Query';
  getCampaign: {
    __typename?: 'Campaign';
    _id: string;
    name: string;
    status: CampaignStatus | null;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type SaveCampaignMutationVariables = Exact<{
  input: NewCampaignInput;
}>;

export type SaveCampaignMutation = {
  __typename?: 'Mutation';
  saveCampaign: {
    __typename?: 'Campaign';
    _id: string;
    name: string;
    status: CampaignStatus | null;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type DeleteCampaignMutationVariables = Exact<{
  input: DeleteCampaignInput;
}>;

export type DeleteCampaignMutation = {
  __typename?: 'Mutation';
  deleteCampaign: boolean | null;
};

export type FullEncounterFragment = {
  __typename?: 'Encounter';
  _id: string;
  name: string;
  description: string | null;
  notes: Array<string>;
  status: string;
  currentRound: number;
  currentTurn: number;
  createdAt: any;
  userId: string;
  campaignId: string;
  adventureId: string | null;
  enemies: Array<{
    __typename?: 'EncounterCharacter';
    _id: string;
    name: string;
    maxHP: number;
    armorClass: number;
    meta: string | null;
    speed: string | null;
    challenge: string | null;
    traits: string | null;
    actions: string | null;
    legendaryActions: string | null;
    img_url: string | null;
    monsterSource: string | null;
    stats: {
      __typename?: 'MonsterStats';
      STR: number | null;
      DEX: number | null;
      CON: number | null;
      INT: number | null;
      WIS: number | null;
      CHA: number | null;
    } | null;
  }>;
  players: Array<{ __typename?: 'EncounterPlayerId'; _id: string }>;
  npcs: Array<{
    __typename?: 'EncounterCharacter';
    _id: string;
    name: string;
    maxHP: number;
    armorClass: number;
    meta: string | null;
    speed: string | null;
    challenge: string | null;
    traits: string | null;
    actions: string | null;
    legendaryActions: string | null;
    img_url: string | null;
    monsterSource: string | null;
    stats: {
      __typename?: 'MonsterStats';
      STR: number | null;
      DEX: number | null;
      CON: number | null;
      INT: number | null;
      WIS: number | null;
      CHA: number | null;
    } | null;
  }>;
  initiativeOrder: Array<{
    __typename?: 'InitiativeOrder';
    _id: string;
    name: string;
    armorClass: number | null;
    maxHP: number | null;
    currentHP: number | null;
    tempHP: number | null;
    conditions: Array<string>;
    initiative: number | null;
    type: string;
  }>;
};

export type SaveEncounterMutationVariables = Exact<{
  input: NewEncounterInput;
}>;

export type SaveEncounterMutation = {
  __typename?: 'Mutation';
  saveEncounter: {
    __typename?: 'Encounter';
    _id: string;
    name: string;
    description: string | null;
    notes: Array<string>;
    status: string;
    currentRound: number;
    currentTurn: number;
    createdAt: any;
    userId: string;
    campaignId: string;
    adventureId: string | null;
    enemies: Array<{
      __typename?: 'EncounterCharacter';
      _id: string;
      name: string;
      maxHP: number;
      armorClass: number;
      meta: string | null;
      speed: string | null;
      challenge: string | null;
      traits: string | null;
      actions: string | null;
      legendaryActions: string | null;
      img_url: string | null;
      monsterSource: string | null;
      stats: {
        __typename?: 'MonsterStats';
        STR: number | null;
        DEX: number | null;
        CON: number | null;
        INT: number | null;
        WIS: number | null;
        CHA: number | null;
      } | null;
    }>;
    players: Array<{ __typename?: 'EncounterPlayerId'; _id: string }>;
    npcs: Array<{
      __typename?: 'EncounterCharacter';
      _id: string;
      name: string;
      maxHP: number;
      armorClass: number;
      meta: string | null;
      speed: string | null;
      challenge: string | null;
      traits: string | null;
      actions: string | null;
      legendaryActions: string | null;
      img_url: string | null;
      monsterSource: string | null;
      stats: {
        __typename?: 'MonsterStats';
        STR: number | null;
        DEX: number | null;
        CON: number | null;
        INT: number | null;
        WIS: number | null;
        CHA: number | null;
      } | null;
    }>;
    initiativeOrder: Array<{
      __typename?: 'InitiativeOrder';
      _id: string;
      name: string;
      armorClass: number | null;
      maxHP: number | null;
      currentHP: number | null;
      tempHP: number | null;
      conditions: Array<string>;
      initiative: number | null;
      type: string;
    }>;
  } | null;
};

export type AllEncountersQueryVariables = Exact<{ [key: string]: never }>;

export type AllEncountersQuery = {
  __typename?: 'Query';
  allEncounters: Array<{
    __typename?: 'Encounter';
    _id: string;
    name: string;
    description: string | null;
    notes: Array<string>;
    status: string;
    currentRound: number;
    currentTurn: number;
    createdAt: any;
    userId: string;
    campaignId: string;
    adventureId: string | null;
    enemies: Array<{
      __typename?: 'EncounterCharacter';
      _id: string;
      name: string;
      maxHP: number;
      armorClass: number;
      meta: string | null;
      speed: string | null;
      challenge: string | null;
      traits: string | null;
      actions: string | null;
      legendaryActions: string | null;
      img_url: string | null;
      monsterSource: string | null;
      stats: {
        __typename?: 'MonsterStats';
        STR: number | null;
        DEX: number | null;
        CON: number | null;
        INT: number | null;
        WIS: number | null;
        CHA: number | null;
      } | null;
    }>;
    players: Array<{ __typename?: 'EncounterPlayerId'; _id: string }>;
    npcs: Array<{
      __typename?: 'EncounterCharacter';
      _id: string;
      name: string;
      maxHP: number;
      armorClass: number;
      meta: string | null;
      speed: string | null;
      challenge: string | null;
      traits: string | null;
      actions: string | null;
      legendaryActions: string | null;
      img_url: string | null;
      monsterSource: string | null;
      stats: {
        __typename?: 'MonsterStats';
        STR: number | null;
        DEX: number | null;
        CON: number | null;
        INT: number | null;
        WIS: number | null;
        CHA: number | null;
      } | null;
    }>;
    initiativeOrder: Array<{
      __typename?: 'InitiativeOrder';
      _id: string;
      name: string;
      armorClass: number | null;
      maxHP: number | null;
      currentHP: number | null;
      tempHP: number | null;
      conditions: Array<string>;
      initiative: number | null;
      type: string;
    }>;
  }>;
};

export type EncounterByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;

export type EncounterByIdQuery = {
  __typename?: 'Query';
  encounterById: {
    __typename?: 'Encounter';
    _id: string;
    name: string;
    description: string | null;
    notes: Array<string>;
    status: string;
    currentRound: number;
    currentTurn: number;
    createdAt: any;
    userId: string;
    campaignId: string;
    adventureId: string | null;
    enemies: Array<{
      __typename?: 'EncounterCharacter';
      _id: string;
      name: string;
      maxHP: number;
      armorClass: number;
      meta: string | null;
      speed: string | null;
      challenge: string | null;
      traits: string | null;
      actions: string | null;
      legendaryActions: string | null;
      img_url: string | null;
      monsterSource: string | null;
      stats: {
        __typename?: 'MonsterStats';
        STR: number | null;
        DEX: number | null;
        CON: number | null;
        INT: number | null;
        WIS: number | null;
        CHA: number | null;
      } | null;
    }>;
    players: Array<{ __typename?: 'EncounterPlayerId'; _id: string }>;
    npcs: Array<{
      __typename?: 'EncounterCharacter';
      _id: string;
      name: string;
      maxHP: number;
      armorClass: number;
      meta: string | null;
      speed: string | null;
      challenge: string | null;
      traits: string | null;
      actions: string | null;
      legendaryActions: string | null;
      img_url: string | null;
      monsterSource: string | null;
      stats: {
        __typename?: 'MonsterStats';
        STR: number | null;
        DEX: number | null;
        CON: number | null;
        INT: number | null;
        WIS: number | null;
        CHA: number | null;
      } | null;
    }>;
    initiativeOrder: Array<{
      __typename?: 'InitiativeOrder';
      _id: string;
      name: string;
      armorClass: number | null;
      maxHP: number | null;
      currentHP: number | null;
      tempHP: number | null;
      conditions: Array<string>;
      initiative: number | null;
      type: string;
    }>;
  } | null;
};

export type DeleteEncounterMutationVariables = Exact<{
  input: DeleteEncounterInput;
}>;

export type DeleteEncounterMutation = {
  __typename?: 'Mutation';
  deleteEncounter: boolean | null;
};

export type UpdateEncounterDescriptionMutationVariables = Exact<{
  input: UpdateEncounterDescriptionInput;
}>;

export type UpdateEncounterDescriptionMutation = {
  __typename?: 'Mutation';
  updateEncounterDescription: {
    __typename?: 'Encounter';
    _id: string;
    description: string | null;
  } | null;
};

export type FullPlayerFragment = {
  __typename?: 'Player';
  _id: string;
  name: string;
  armorClass: number | null;
  maxHP: number | null;
  level: number | null;
  userId: string;
  campaignId: string;
  createdAt: any;
};

export type CreatePlayerMutationVariables = Exact<{
  input: NewPlayerInput;
}>;

export type CreatePlayerMutation = {
  __typename?: 'Mutation';
  createPlayer: {
    __typename?: 'Player';
    _id: string;
    name: string;
    armorClass: number | null;
    maxHP: number | null;
    level: number | null;
    userId: string;
    campaignId: string;
    createdAt: any;
  } | null;
};

export type UpdatePlayerMutationVariables = Exact<{
  input: UpdatePlayerInput;
}>;

export type UpdatePlayerMutation = {
  __typename?: 'Mutation';
  updatePlayer: {
    __typename?: 'Player';
    _id: string;
    name: string;
    armorClass: number | null;
    maxHP: number | null;
    level: number | null;
    userId: string;
    campaignId: string;
    createdAt: any;
  } | null;
};

export type DeletePlayerMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;

export type DeletePlayerMutation = {
  __typename?: 'Mutation';
  deletePlayer: boolean | null;
};

export type UpdatePlayersMutationVariables = Exact<{
  input: UpdatePlayersInput;
}>;

export type UpdatePlayersMutation = {
  __typename?: 'Mutation';
  updatePlayers: boolean | null;
};

export type AllPlayersQueryVariables = Exact<{ [key: string]: never }>;

export type AllPlayersQuery = {
  __typename?: 'Query';
  allPlayers: Array<{
    __typename?: 'Player';
    _id: string;
    name: string;
    armorClass: number | null;
    maxHP: number | null;
    level: number | null;
    userId: string;
    campaignId: string;
    createdAt: any;
  }>;
};

export type GetUserPreferencesQueryVariables = Exact<{ [key: string]: never }>;

export type GetUserPreferencesQuery = {
  __typename?: 'Query';
  getUserPreferences: {
    __typename?: 'UserPreferences';
    _id: string;
    activeCampaignId: string | null;
    theme: string | null;
  } | null;
};

export type SetActiveCampaignMutationVariables = Exact<{
  input: SetActiveCampaignInput;
}>;

export type SetActiveCampaignMutation = {
  __typename?: 'Mutation';
  setActiveCampaign: {
    __typename?: 'UserPreferences';
    _id: string;
    activeCampaignId: string | null;
    theme: string | null;
  } | null;
};

export type SetThemeMutationVariables = Exact<{
  input: SetThemeInput;
}>;

export type SetThemeMutation = {
  __typename?: 'Mutation';
  setTheme: {
    __typename?: 'UserPreferences';
    _id: string;
    activeCampaignId: string | null;
    theme: string | null;
  } | null;
};
