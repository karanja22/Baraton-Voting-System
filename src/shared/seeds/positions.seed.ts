// src/seed/seed-elections-and-positions.ts
import { DataSource } from 'typeorm';
import { Election } from 'src/elections/entities/election.entity';
import { Position } from 'src/shared/entities/position.entity';
import { School } from 'src/shared/entities/school.entity';

export const seedElectionsAndPositions = async (dataSource: DataSource) => {
  const electionRepo = dataSource.getRepository(Election);
  const positionRepo = dataSource.getRepository(Position);
  const schoolRepo = dataSource.getRepository(School);

  // === Create Elections ===
  const electionsToCreate = [
    { title: 'General Senate Election', start_date: new Date(), end_date: new Date(), status: 'pending' },
    { title: 'SEC Election', start_date: new Date(), end_date: new Date(), status: 'pending' },
  ];

  const createdElections: Record<string, Election> = {};

  for (const electionData of electionsToCreate) {
    let existing = await electionRepo.findOne({ where: { title: electionData.title } });

    if (!existing) {
      existing = electionRepo.create(electionData);
      await electionRepo.save(existing);
      console.log(`✅ Election "${electionData.title}" created.`);
    } else {
      console.log(`⚠️ Election "${electionData.title}" already exists.`);
    }

    createdElections[electionData.title] = existing;
  }

  const generalElection = createdElections['General Senate Election'];
  const secElection = createdElections['SEC Election'];

  const schools = await schoolRepo.find();

  // === School-based senator positions (linked to school) ===
  for (const school of schools) {
    const schoolName = school.name.replace('School of', '').trim();
    const name = `Senator School of ${schoolName}`;

    const exists = await positionRepo.findOne({ where: { name } });
    if (!exists) {
      const position = positionRepo.create({
        name,
        election: generalElection,
        school, // <- Link school to the position
      });
      await positionRepo.save(position);
      console.log(`✅ Position "${name}" created for ${school.name}.`);
    } else {
      console.log(`⚠️ Position "${name}" already exists.`);
    }
  }

  // === General non-school-specific senator positions ===
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
      console.log(`✅ General position "${name}" created.`);
    } else {
      console.log(`⚠️ General position "${name}" already exists.`);
    }
  }

  // === SEC Executive positions ===
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
      console.log(`SEC position "${name}" created.`);
    } else {
      console.log(`SEC position "${name}" already exists.`);
    }
  }

  console.log('Elections and positions seeded successfully.');
};
