import {
    BadRequestException,
    ConflictException,
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DelegateApplication } from 'src/application/entities/delegate-application.entity';
import { DelegateVote } from 'src/voting/entities/delegate-voting.entity';
import { Repository, In } from 'typeorm';
import { NomineeData } from './interfaces/nominee-data.interface';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class DelegateSelectionService {
    constructor(
        @InjectRepository(DelegateApplication)
        private readonly delegateRepo: Repository<DelegateApplication>,

        @InjectRepository(DelegateVote)
        private readonly voteRepo: Repository<DelegateVote>,

        private readonly mailerService: MailerService,
    ) { }

    async getTopNominees(departmentId: number, limit = 10): Promise<NomineeData[]> {
        const rawVotes = await this.voteRepo
            .createQueryBuilder('vote')
            .select('delegate.id', 'delegateId')
            .addSelect('COUNT(*)', 'voteCount')
            .innerJoin('vote.delegate', 'delegate')
            .innerJoin('delegate.student', 'student')
            .where('student.departmentId = :id', { id: departmentId })
            .groupBy('delegate.id')
            .orderBy('voteCount', 'DESC')
            .limit(limit)
            .getRawMany();

        const nominees: NomineeData[] = [];

        for (const row of rawVotes) {
            const delegate = await this.delegateRepo.findOne({
                where: { id: row.delegateId },
                relations: ['student'],
            });

            if (delegate?.student) {
                nominees.push({
                    id: delegate.id,
                    gender: delegate.student.gender,
                    tribe: delegate.student.tribe,
                    nationality: delegate.student.nationality,
                    voteCount: +row.voteCount,
                });
            }
        }

        return nominees;
    }

    async appointManually(departmentId: number, selectedIds: number[]) {
        if (selectedIds.length !== 3) {
            throw new BadRequestException('Exactly 3 delegates must be selected');
        }

        const selected = await this.delegateRepo.find({
            where: { id: In(selectedIds) },
            relations: ['student'],
        });

        if (selected.every(d => d.isSelected)) {
            throw new ConflictException('These delegates are already appointed');
        }

        if (!this.isGenderBalanced(selected)) {
            throw new BadRequestException('Gender balance not met: Max 2 of same gender allowed');
        }

        await this.resetSelections(departmentId);
        await this.markAsSelected(selected);

        return { message: 'Delegates appointed manually', delegates: selected };
    }

    async autoAppoint(departmentId: number) {
        const topNominees = await this.getTopNominees(departmentId, 6);

        const validCombos = this.generateCombinations(topNominees, 3).filter(this.isGenderBalanced);

        if (!validCombos.length) {
            throw new ConflictException('No gender-balanced group found');
        }

        const selectedCombo = validCombos[0];

        const fullDelegates = await this.delegateRepo.find({
            where: { id: In(selectedCombo.map(d => d.id)) },
            relations: ['student'],
        });

        await this.resetSelections(departmentId);
        await this.markAsSelected(fullDelegates);

        return { message: 'Delegates auto-appointed', delegates: selectedCombo };
    }

    async notifySelectedDelegates(departmentId: number) {
        const delegates = await this.delegateRepo.find({
            where: {
                isSelected: true,
                student: { department: { id: departmentId } },
            },
            relations: ['student'],
        });

        if (!delegates.length) {
            throw new BadRequestException('No selected delegates found for this department');
        }

        const results = await this.sendNotifications(delegates);
        return { message: 'Mail notifications sent', results };
    }

    // ────────────────────────
    // 🔧 Shared Internal Helpers
    // ────────────────────────

    private isGenderBalanced(group: { gender: string }[]): boolean {
        const male = group.filter(g => g.gender === 'Male').length;
        const female = group.filter(g => g.gender === 'Female').length;
        return male <= 2 && female <= 2;
    }

    private generateCombinations(arr: NomineeData[], size: number): NomineeData[][] {
        const result: NomineeData[][] = [];

        const combine = (start = 0, combo: NomineeData[] = []) => {
            if (combo.length === size) {
                result.push([...combo]);
                return;
            }
            for (let i = start; i < arr.length; i++) {
                combo.push(arr[i]);
                combine(i + 1, combo);
                combo.pop();
            }
        };

        combine();
        return result;
    }

    private async resetSelections(departmentId: number) {
        await this.delegateRepo.update(
            { student: { department: { id: departmentId } } },
            { isSelected: false },
        );
    }

    private async markAsSelected(delegates: DelegateApplication[]) {
        for (const d of delegates) d.isSelected = true;
        await this.delegateRepo.save(delegates);
    }

    // 📬 Standalone Mail Notification Method
    public async sendNotifications(delegates: DelegateApplication[]) {
        const results: { email: string; status: string }[] = [];

        for (const { student } of delegates) {
            try {
                await this.mailerService.sendMail({
                    to: student.email,
                    subject: 'You have been appointed as a Delegate to represent your department in voting for SEC positions',
                    template: './delegate-notification',
                    context: { name: student.first_name },
                });

                results.push({ email: student.email, status: 'sent' });
            } catch (err) {
                console.error(`Failed to email ${student.email}:`, err);
                results.push({ email: student.email, status: 'failed' });
            }
        }

        return results;
    }
}
