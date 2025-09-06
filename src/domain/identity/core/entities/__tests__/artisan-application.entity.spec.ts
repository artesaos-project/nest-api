import { ArtisanApplication } from '../artisan-application.entity';

describe('artisan application entity', () => {
  const artisanApplicationProps = {
    userId: 'some-user-id',
    rawMaterial: 'Wood',
    technique: 'Wood carving',
    finalityClassification: 'Artistic',
    sicab: '123456789',
    sicabRegistrationDate: new Date('2023-05-10'),
    sicabValidUntil: new Date('2029-05-09'),
  };

  it('should be defined as ArtisanApplication instance', () => {
    const artisanApplication = ArtisanApplication.create(artisanApplicationProps);

    expect(artisanApplication).toBeDefined();
    expect(artisanApplication).toBeInstanceOf(ArtisanApplication);
  });

  test('get methods', () => {
    const artisanApplication = ArtisanApplication.create(artisanApplicationProps);

    expect(artisanApplication.userId).toBe('some-user-id');
    expect(artisanApplication.rawMaterial).toBe('Wood');
    expect(artisanApplication.technique).toBe('Wood carving');
    expect(artisanApplication.finalityClassification).toBe('Artistic');
    expect(artisanApplication.sicab).toBe('123456789');
    expect(artisanApplication.sicabRegistrationDate).toEqual(new Date('2023-05-10'));
    expect(artisanApplication.sicabValidUntil).toEqual(new Date('2029-05-09'));
    expect(artisanApplication.status).toBe('PENDING');
    expect(artisanApplication.rejectionReason).toBeUndefined();
  });

  test('approve and reject methods', () => {
    const artisanApplication = ArtisanApplication.create(artisanApplicationProps);

    artisanApplication.approve('reviewer-id');
    expect(artisanApplication.status).toBe('APPROVED');
    expect(artisanApplication.reviewerId).toBe('reviewer-id');
    expect(artisanApplication.rejectionReason).toBeUndefined();

    artisanApplication.reject('Not enough information', 'reviewer-id');
    expect(artisanApplication.status).toBe('REJECTED');
    expect(artisanApplication.reviewerId).toBe('reviewer-id');
    expect(artisanApplication.rejectionReason).toBe('Not enough information');
  });
});
