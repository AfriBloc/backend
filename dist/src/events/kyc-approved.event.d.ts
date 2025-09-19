export declare class KycApprovedEvent {
    readonly userId: string;
    readonly applicantId: string;
    readonly userData: {
        firstName?: string;
        lastName?: string;
        middleName?: string;
        dateOfBirth?: Date;
        gender?: 'M' | 'F' | 'X';
        nationality?: string;
        placeOfBirth?: string;
    };
    constructor(userId: string, applicantId: string, userData: {
        firstName?: string;
        lastName?: string;
        middleName?: string;
        dateOfBirth?: Date;
        gender?: 'M' | 'F' | 'X';
        nationality?: string;
        placeOfBirth?: string;
    });
}
