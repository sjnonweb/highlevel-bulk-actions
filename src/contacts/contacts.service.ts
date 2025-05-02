import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
  ) {}

  findAll(): Promise<Contact[]> {
    return this.contactsRepository.find();
  }

  findOne(id: number): Promise<Contact | null> {
    return this.contactsRepository.findOneBy({ id });
  }

  create(contactData: Partial<Contact>): Contact {
    return this.contactsRepository.create(contactData);
  }

  async save(contact: Contact): Promise<Contact> {
    return await this.contactsRepository.save(contact);
  }

  async saveBulk(contacts: Contact[]): Promise<Contact[]> {
    return await this.contactsRepository.save(contacts);
  }
}
