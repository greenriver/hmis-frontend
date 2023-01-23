import { applyDataCollectedAbout } from './formUtil';

import {
  DataCollectedAbout,
  FormDefinitionWithJsonFragment,
  NoYesReasonsForMissingData,
  RelationshipToHoH,
} from '@/types/gqlTypes';

const client = {
  dob: null,
  veteranStatus: NoYesReasonsForMissingData.DataNotCollected,
};

describe('applyDataCollectedAbout', () => {
  it('keeps unfiltered groups', () => {
    const items = [{ linkId: '1' }];
    expect(
      applyDataCollectedAbout(
        items as FormDefinitionWithJsonFragment['definition']['item'],
        client,
        RelationshipToHoH.DataNotCollected
      )
    ).toMatchObject(items);
  });

  it('includes HOH_AND_ADULTS if client is adult', () => {
    const items = [
      { linkId: '1', dataCollectedAbout: DataCollectedAbout.HohAndAdults },
    ];
    expect(
      applyDataCollectedAbout(
        items as FormDefinitionWithJsonFragment['definition']['item'],
        { ...client, dob: '1960-01-01' },
        RelationshipToHoH.DataNotCollected
      )
    ).toMatchObject(items);
  });
  it('includes HOH_AND_ADULTS if client is HOH but not adult', () => {
    const items = [
      { linkId: '1', dataCollectedAbout: DataCollectedAbout.HohAndAdults },
    ];
    expect(
      applyDataCollectedAbout(
        items as FormDefinitionWithJsonFragment['definition']['item'],
        {
          ...client,
          dob: '2022-01-01',
        },
        RelationshipToHoH.SelfHeadOfHousehold
      )
    ).toMatchObject(items);
  });
  it('includes HOH_AND_ADULTS if client age is unknown', () => {
    const items = [
      { linkId: '1', dataCollectedAbout: DataCollectedAbout.HohAndAdults },
    ];
    expect(
      applyDataCollectedAbout(
        items as FormDefinitionWithJsonFragment['definition']['item'],
        client,
        RelationshipToHoH.DataNotCollected
      )
    ).toMatchObject(items);
  });
  it('excludes non-HOH children from HOH_AND_ADULTS', () => {
    const items = [
      { linkId: '1', dataCollectedAbout: DataCollectedAbout.HohAndAdults },
    ];
    expect(
      applyDataCollectedAbout(
        items as FormDefinitionWithJsonFragment['definition']['item'],
        {
          ...client,
          dob: '2022-01-01',
        },
        RelationshipToHoH.DataNotCollected
      )
    ).toHaveLength(0);
  });

  it('works for HOH', () => {
    const items = [{ linkId: '1', dataCollectedAbout: DataCollectedAbout.Hoh }];
    expect(
      applyDataCollectedAbout(
        items as FormDefinitionWithJsonFragment['definition']['item'],
        client,
        RelationshipToHoH.SelfHeadOfHousehold
      )
    ).toMatchObject(items);

    expect(
      applyDataCollectedAbout(
        items as FormDefinitionWithJsonFragment['definition']['item'],
        client,
        RelationshipToHoH.OtherRelative
      )
    ).toHaveLength(0);
  });

  it('works for VETERAN_HOH', () => {
    const items = [
      { linkId: '1', dataCollectedAbout: DataCollectedAbout.VeteranHoh },
    ];
    expect(
      applyDataCollectedAbout(
        items as FormDefinitionWithJsonFragment['definition']['item'],
        { ...client, veteranStatus: NoYesReasonsForMissingData.Yes },
        RelationshipToHoH.SelfHeadOfHousehold
      )
    ).toMatchObject(items);

    expect(
      applyDataCollectedAbout(
        items as FormDefinitionWithJsonFragment['definition']['item'],
        { ...client, veteranStatus: NoYesReasonsForMissingData.Yes },
        RelationshipToHoH.SpouseOrPartner
      )
    ).toHaveLength(0);

    expect(
      applyDataCollectedAbout(
        items as FormDefinitionWithJsonFragment['definition']['item'],
        client,
        RelationshipToHoH.SelfHeadOfHousehold
      )
    ).toHaveLength(0);
  });
});
