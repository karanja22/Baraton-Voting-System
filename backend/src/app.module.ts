import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ApplicationModule } from './application/application.module';
import { ElectionsModule } from './elections/elections.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VotingModule } from './voting/voting.module';
import { ResultsModule } from './results/results.module';
import { AdminModule } from './admin/admin.module';
import { DelegateSelectionModule } from './elections/delegate-selection/delegate-selection.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [AuthModule, UsersModule, ApplicationModule, ElectionsModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey',
      signOptions: { expiresIn: '1d' },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      autoLoadEntities: true,
      synchronize: true,
    }),
    VotingModule,
    ResultsModule,
    AdminModule,
    DelegateSelectionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
