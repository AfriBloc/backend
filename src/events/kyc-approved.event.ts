export class KycApprovedEvent {
  constructor(
    public readonly userId: string,
    public readonly applicantId: string,
    public readonly userData: {
      firstName?: string;
      lastName?: string;
      middleName?: string;
      dateOfBirth?: Date;
      gender?: 'M' | 'F' | 'X';
      nationality?: string;
      placeOfBirth?: string;
    }
  ) {}
}
