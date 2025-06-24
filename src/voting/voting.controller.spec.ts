import { Test, TestingModule } from '@nestjs/testing';
import { VotingController } from './voting.controller';
import { VotingService } from './voting.service';

describe('VotingController', () => {
  let controller: VotingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VotingController],
      providers: [VotingService],
    }).compile();

    controller = module.get<VotingController>(VotingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
