import { HttpException } from "../exceptions/http-exception.js";
import { ApartmentRepository } from "../repositories/apartment.repository.js";
import type { Apartment } from "../types/apartment.type.js";

const repo = new ApartmentRepository();

export class ApartmentService{
    create(data: any, ownerId: string){

        const newApartment: Apartment = {
            id: Date.now().toString(),
            name: data.name,
            location: data.location,
            rentAmount: data.rentAmount,
            ownerId,
        };

        return repo.create(newApartment);
    }

    getAll(user: any){

        if(user.role === "ADMIN"){
            return repo.findAll();
        }

        if(user.role === "OWNER"){
            return repo.findAll().filter(a => a.tenantId === user.id);
        }

        throw new HttpException(403, "forbidden");
    }

    assignTenant(apartmentId: string, tenantId: string){

        const apartment = repo.findById(apartmentId);

        if(!apartment){
            throw new HttpException(404, "Apartment not found");
        }

        apartment.tenantId = tenantId;

        return repo.update(apartment);
    }
}