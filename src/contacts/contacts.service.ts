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

  async create(contactData: Partial<Contact>): Promise<Contact> {
    const contact = this.contactsRepository.create(contactData);
    return await this.contactsRepository.save(contact);
  }

  async createBulk(contactsData: Partial<Contact>[]): Promise<Contact[]> {
    const contacts = this.contactsRepository.create(contactsData);
    return await this.contactsRepository.save(contacts);
  }
}
