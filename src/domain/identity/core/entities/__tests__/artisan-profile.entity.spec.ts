import { ArtisanProfile } from '../artisan-profile.entity';

describe('artisan profile entity', () => {
  const artisanProfileProps = {
    userId: 'some-user-id',
    userName: 'johndoe',
    rawMaterial: 'Wood',
    technique: 'Wood carving',
    finalityClassification: 'Artistic',
    sicab: '123456789',
    sicabRegistrationDate: new Date('2023-05-10'),
    sicabValidUntil: new Date('2029-05-09'),
  };

  it('should be defined as ArtisanProfile instance', () => {
    const artisanProfile = ArtisanProfile.create(artisanProfileProps);

    expect(artisanProfile).toBeDefined();
    expect(artisanProfile).toBeInstanceOf(ArtisanProfile);
  });

  test('get methods', () => {
    const artisanProfile = ArtisanProfile.create(artisanProfileProps);

    expect(artisanProfile.userId).toBe('some-user-id');
    expect(artisanProfile.userName).toBe('johndoe');
    expect(artisanProfile.rawMaterial).toBe('Wood');
    expect(artisanProfile.technique).toBe('Wood carving');
    expect(artisanProfile.finalityClassification).toBe('Artistic');
    expect(artisanProfile.sicab).toBe('123456789');
    expect(artisanProfile.sicabRegistrationDate).toEqual(new Date('2023-05-10'));
    expect(artisanProfile.sicabValidUntil).toEqual(new Date('2029-05-09'));
  });

  test('set methods', () => {
    const artisanProfile = ArtisanProfile.create(artisanProfileProps);

    artisanProfile.userName = 'janedoe';

    expect(artisanProfile.userName).toBe('janedoe');
  });
});
