export class KycRejectedEvent {
  constructor(
    public readonly userId: string,
    public readonly applicantId: string,
    public readonly rejectionReason: string,
    public readonly rejectLabels: string[],
    public readonly reviewRejectType: 'FINAL' | 'RETRY'
  ) {}
}
