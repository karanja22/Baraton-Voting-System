// src/seed/seed-elections-and-positions.ts
import { DataSource } from 'typeorm';
import { Election } from 'src/elections/entities/election.entity';
import { Position } from 'src/shared/entities/position.entity';
import { School } from 'src/shared/entities/school.entity';

export const seedElectionsAndPositions = async (dataSource: DataSource) => {
  const electionRepo = dataSource.getRepository(Election);
  const positionRepo = dataSource.getRepository(Position);
  const schoolRepo = dataSource.getRepository(School);

  // Elections
  const electionsToCreate = [
    { title: 'General Senate Election', start_date: new Date(), end_date: new Date(), status: 'pending' },
    { title: 'SEC Election', start_date: new Date(), end_date: new Date(), status: 'pending' },
  ];

  const createdElections: Record<string, Election> = {};

  for (const electionData of electionsToCreate) {
    const existing = await electionRepo.findOne({ where: { title: electionData.title } });

    if (!existing) {
      const created = electionRepo.create(electionData);
      await electionRepo.save(created);
      createdElections[electionData.title] = created;
      console.log(`✅ Election "${electionData.title}" created.`);
    } else {
      createdElections[electionData.title] = existing;
      console.log(`⚠️ Election "${electionData.title}" already exists.`);
    }
  }

  const generalElection = createdElections['General Senate Election'];
  const secElection = createdElections['SEC Election'];

  const schools = await schoolRepo.find();

  // School-based senators
  for (const school of schools) {
    const schoolName = school.name.replace('School of', '').trim();
    const name = `Senator School of ${schoolName}`;

    const exists = await positionRepo.findOne({ where: { name } });
    if (!exists) {
      const position = positionRepo.create({ name, election: generalElection });
      await positionRepo.save(position);
    }
  }

  const generalPositions = [
    'Senator Religious Affairs',
    'Senator Diploma & Certificate Rep',
    'Senator International Rep',
    'Senator Residence - Men\'s Dorm',
    'Senator Residence - Ladies\' Dorm',
    'Senator Residence - Off Campus Male',
    'Senator Residence - Off Campus Female',
  ];

  for (const name of generalPositions) {
    const exists = await positionRepo.findOne({ where: { name } });
    if (!exists) {
      const position = positionRepo.create({ name, election: generalElection });
      await positionRepo.save(position);
    }
  }

  const secPositions = [
    { name: 'President', isVicePosition: false },
    { name: 'Secretary General', isVicePosition: false },
    { name: 'Finance Secretary', isVicePosition: false },
    { name: 'Planning and Labour Secretary', isVicePosition: false },
    { name: 'Academics and Foreign Affairs Secretary', isVicePosition: false },
    { name: 'Sports and Entertainment Secretary', isVicePosition: false },
    { name: 'Gender and Special Interest Secretary', isVicePosition: false },
    { name: 'Vice President', isVicePosition: true },
  ];

  for (const { name, isVicePosition } of secPositions) {
    const exists = await positionRepo.findOne({ where: { name } });
    if (!exists) {
      const position = positionRepo.create({ name, election: secElection, isVicePosition });
      await positionRepo.save(position);
    }
  }

  console.log('✅ Elections and positions seeded successfully.');
};
