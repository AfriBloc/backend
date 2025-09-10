export class KycOnHoldEvent {
  constructor(
    public readonly userId: string,
    public readonly applicantId: string,
    public readonly reason: string
  ) {}
}
