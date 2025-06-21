import { DataSource } from 'typeorm';
import { Position } from 'src/shared/entities/position.entity';
import { Election } from 'src/elections/entities/election.entity';
import { School } from 'src/shared/entities/school.entity';

export const seedPositions = async (dataSource: DataSource) => {
  const positionRepo = dataSource.getRepository(Position);
  const electionRepo = dataSource.getRepository(Election);
  const schoolRepo = dataSource.getRepository(School);

  const generalElection = await electionRepo.findOne({ where: { title: 'General Senate Election' } });
  const secElection = await electionRepo.findOne({ where: { title: 'SEC Election' } });

  if (!generalElection || !secElection) {
    throw new Error('Elections not found. Please seed elections before seeding positions.');
  }

  const schools = await schoolRepo.find();

  // Seed school-based senator positions
  for (const school of schools) {
    const schoolName = school.name.replace('School of', '').trim();
    await positionRepo.save(
      positionRepo.create({
        name: `Senator School of ${schoolName}`,
        election: generalElection,
      }),
    );
  }

  // General Senate Positions
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
    await positionRepo.save(
      positionRepo.create({
        name,
        election: generalElection,
      }),
    );
  }

  // SEC Positions
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
    await positionRepo.save(
      positionRepo.create({
        name,
        election: secElection,
        isVicePosition,
      }),
    );
  }

  console.log('Positions seeded successfully.');
};
