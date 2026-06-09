export interface Apartment{
    id: string;
    name: string;
    location: string;
    rentAmount: number;
    ownerId: string;
    tenantId?: string;
    
}