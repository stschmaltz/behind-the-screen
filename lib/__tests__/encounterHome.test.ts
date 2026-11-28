import {
  DEFAULT_ADVENTURE_NAME,
  DEFAULT_CAMPAIGN_NAME,
  EncounterHomeRequest,
  needsDefaultAdventure,
  resolveEncounterHome,
} from '../encounterHome';

const creators = (
  overrides: {
    campaignId?: string | null;
    adventureId?: string | null;
  } = {},
) => ({
  createCampaign: jest.fn(async () =>
    overrides.campaignId === undefined ? 'new-campaign' : overrides.campaignId,
  ),
  createAdventure: jest.fn(async () =>
    overrides.adventureId === undefined
      ? 'new-adventure'
      : overrides.adventureId,
  ),
});

const request = (
  overrides: Partial<EncounterHomeRequest> = {},
): EncounterHomeRequest => ({
  hasCampaigns: true,
  campaignHasAdventures: true,
  ...overrides,
});

describe('resolveEncounterHome', () => {
  it('creates a default campaign and adventure for a DM with no campaigns', async () => {
    const make = creators();

    const home = await resolveEncounterHome(
      request({ hasCampaigns: false, campaignHasAdventures: false }),
      make,
    );

    expect(home).toEqual({
      ok: true,
      campaignId: 'new-campaign',
      adventureId: 'new-adventure',
      createdCampaign: true,
      createdAdventure: true,
    });
    expect(make.createCampaign).toHaveBeenCalledWith(DEFAULT_CAMPAIGN_NAME);
    expect(make.createAdventure).toHaveBeenCalledWith(
      'new-campaign',
      DEFAULT_ADVENTURE_NAME,
    );
  });

  it('uses the chosen campaign and adventure without creating anything', async () => {
    const make = creators();

    const home = await resolveEncounterHome(
      request({ campaignId: 'c1', adventureId: 'a1' }),
      make,
    );

    expect(home).toEqual({
      ok: true,
      campaignId: 'c1',
      adventureId: 'a1',
      createdCampaign: false,
      createdAdventure: false,
    });
    expect(make.createCampaign).not.toHaveBeenCalled();
    expect(make.createAdventure).not.toHaveBeenCalled();
  });

  it('adds a default adventure to a campaign that has none', async () => {
    const make = creators();

    const home = await resolveEncounterHome(
      request({ campaignId: 'c1', campaignHasAdventures: false }),
      make,
    );

    expect(home).toMatchObject({
      ok: true,
      campaignId: 'c1',
      adventureId: 'new-adventure',
      createdCampaign: false,
      createdAdventure: true,
    });
    expect(make.createCampaign).not.toHaveBeenCalled();
  });

  it('asks for an adventure when the campaign already has some', async () => {
    const make = creators();

    const home = await resolveEncounterHome(
      request({ campaignId: 'c1' }),
      make,
    );

    expect(home).toEqual({
      ok: false,
      error: 'Please select an adventure',
      campaignId: 'c1',
      createdCampaign: false,
    });
    expect(make.createAdventure).not.toHaveBeenCalled();
  });

  it('asks for a campaign rather than creating one when the DM already has campaigns', async () => {
    const make = creators();

    const home = await resolveEncounterHome(request(), make);

    expect(home).toMatchObject({
      ok: false,
      error: 'Please select a campaign',
    });
    expect(make.createCampaign).not.toHaveBeenCalled();
  });

  it('stops when the default campaign cannot be created', async () => {
    const make = creators({ campaignId: null });

    const home = await resolveEncounterHome(
      request({ hasCampaigns: false, campaignHasAdventures: false }),
      make,
    );

    expect(home).toMatchObject({ ok: false, createdCampaign: false });
    expect(make.createAdventure).not.toHaveBeenCalled();
  });

  it('reports the created campaign when the adventure cannot be created, so a retry reuses it', async () => {
    const make = creators({ adventureId: null });

    const home = await resolveEncounterHome(
      request({ hasCampaigns: false, campaignHasAdventures: false }),
      make,
    );

    expect(home).toMatchObject({
      ok: false,
      campaignId: 'new-campaign',
      createdCampaign: true,
    });
  });
});

describe('needsDefaultAdventure', () => {
  it('is true only when no adventure is chosen and the campaign has none', () => {
    expect(needsDefaultAdventure({ campaignHasAdventures: false })).toBe(true);
    expect(
      needsDefaultAdventure({
        adventureId: 'a1',
        campaignHasAdventures: false,
      }),
    ).toBe(false);
    expect(needsDefaultAdventure({ campaignHasAdventures: true })).toBe(false);
  });
});
