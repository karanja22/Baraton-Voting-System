// src/shared/seeds/residences.seed.ts
import { DataSource } from 'typeorm';
import { Residence } from '../entities/residence.entity';

export const seedResidences = async (dataSource: DataSource) => {
  const residenceRepo = dataSource.getRepository(Residence);

  const residences = [
    'Men\'s Dorm',
    'Ladies\' Dorm',
    'Off Campus Male',
    'Off Campus Female',
  ];

  for (const name of residences) {
    const exists = await residenceRepo.findOne({ where: { name } });
    if (!exists) {
      const residence = residenceRepo.create({ name });
      await residenceRepo.save(residence);
    }
  }

  console.log('✅ Residences seeded successfully.');
};
