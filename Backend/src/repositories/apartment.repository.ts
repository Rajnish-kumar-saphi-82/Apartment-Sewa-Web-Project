import { apartmentDataset } from "../models/apartment.model.js";
import type { Apartment } from "../types/apartment.type.js";

export class ApartmentRepository{
    create(apartment: Apartment): Apartment{
        apartmentDataset.push(apartment);
        return apartment;
    }

    findAll(): Apartment[]{
        return apartmentDataset;
    }

    findByOwner(ownerId: string): Apartment[]{
        return apartmentDataset.filter(a => a.ownerId == ownerId);
    }

    findById(id:string): Apartment | undefined{
        return apartmentDataset.find(a => a.id == id);
    }

    update(apartment: Apartment): Apartment {
        const index = apartmentDataset.findIndex(a => a.id === apartment.id);
        apartmentDataset[index] = apartment;
        return apartment;
    }
}