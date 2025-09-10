export class TransactionFailedEvent {
  constructor(
    public readonly userId: string,
    public readonly transactionId: string,
    public readonly amount: string,
    public readonly walletType: string,
  ) {}
}
