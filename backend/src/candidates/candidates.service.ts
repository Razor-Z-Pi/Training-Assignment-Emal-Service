import { Injectable, NotFoundException } from '@nestjs/common';

export interface Candidate {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  position: string;
  email?: string;
  linkedinUrl: string;
  avatarUrl: string;
}

@Injectable()
export class CandidatesService {
  private readonly candidates: Candidate[] = [
    {
      id: 'cand_1', fullName: 'Иван Петров', firstName: 'Иван', lastName: 'Петров',
      position: 'Backend Engineer', email: 'ivan.petrov@example.com',
      linkedinUrl: 'https://linkedin.com/in/ivan-petrov',
      avatarUrl: 'https://i.pravatar.cc/150?u=ivan',
    },
    {
      id: 'cand_2', fullName: 'Anna Smith',
      position: 'Frontend Developer', email: 'anna.smith@example.com',
      linkedinUrl: 'https://linkedin.com/in/anna-smith',
      avatarUrl: 'https://i.pravatar.cc/150?u=anna',
    },
    {
      id: 'cand_3', fullName: 'Иван Иванов', firstName: 'Иван', lastName: 'Иванов',
      position: 'DevOps Engineer',
      linkedinUrl: 'https://linkedin.com/in/sergey-volkov',
      avatarUrl: 'https://i.pravatar.cc/150?u=sergey',
    },
  ];

  findAll(): Candidate[] { return this.candidates; }

  findOne(id: string): Candidate {
    const c = this.candidates.find(x => x.id === id);
    if (!c) throw new NotFoundException(`Candidate ${id} not found`);
    return c;
  }
}