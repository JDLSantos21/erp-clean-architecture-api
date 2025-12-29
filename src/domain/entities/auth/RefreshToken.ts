export class RefreshToken {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly token: string,
    public readonly expiresAt: Date,
    public readonly revoked: boolean,
    public readonly revokedAt: Date | null,
    public readonly deviceInfo: Record<string, any> | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  get isValid(): boolean {
    return !this.revoked && this.expiresAt > new Date();
  }

  get isExpired(): boolean {
    return this.expiresAt <= new Date();
  }

  static create(
    userId: string,
    token: string,
    expiresAt: Date,
    deviceInfo?: Record<string, any>
  ) {
    return {
      userId,
      token,
      expiresAt,
      deviceInfo: deviceInfo || null,
    };
  }
}
