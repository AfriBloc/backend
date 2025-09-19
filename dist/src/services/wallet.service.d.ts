import { Repository } from 'typeorm';
import { UserWallet } from '../entities/user-wallet.entity';
import { User } from '../entities/user.entity';
import { FireblocksService } from './fireblocks.service';
import { RateService } from './rate.service';
export declare class WalletService {
    private readonly walletRepository;
    private readonly rateService;
    private readonly fireblocksService;
    constructor(walletRepository: Repository<UserWallet>, rateService: RateService, fireblocksService: FireblocksService);
    createWallet(user: User): Promise<UserWallet>;
    private createFireblocksWallet;
    catch(error: any): void;
    getWalletBalance(userId: string): Promise<{
        hbar: number;
        usd: number;
        ngn: number;
    }>;
    getUserWallet(userId: string): Promise<UserWallet>;
    deactivateWallet(walletId: string): Promise<UserWallet>;
    activateWallet(walletId: string): Promise<UserWallet>;
}
