import { Module } from '@nestjs/common';
import { DelegateSelectionService } from './delegate-selection.service';
import { DelegateSelectionController } from './delegate-selection.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { DelegateApplication } from 'src/application/entities/delegate-application.entity';
import { DelegateVote } from 'src/voting/entities/delegate-voting.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([DelegateApplication, DelegateVote]),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      },
      template: {
        dir: join(__dirname, '..', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [DelegateSelectionController],
  providers: [DelegateSelectionService],
})
export class DelegateSelectionModule { }
