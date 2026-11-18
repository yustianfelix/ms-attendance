import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
  AttendanceAction,
  AttendanceActionDto,
} from './dto/attendance-action.dto';
import { AttendanceSummaryRequestBodyDto } from './dto/attendance-summary-request-body.dto';
import { Attendance } from './entity/attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async recordAction(
    attendanceActionDto: AttendanceActionDto,
  ): Promise<Attendance> {
    const { employee_id: employeeId, date, action } = attendanceActionDto;
    const existingAttendance = await this.attendanceRepository.findOneBy({
      employeeId,
      date,
    });

    if (action === AttendanceAction.ClockIn) {
      if (existingAttendance) {
        throw new ConflictException(
          'Employee has already clocked in for this date',
        );
      }

      return this.attendanceRepository.save(
        this.attendanceRepository.create({
          employeeId,
          date,
          clockIn: new Date(),
          clockOut: null,
          status: action,
        }),
      );
    }

    if (!existingAttendance) {
      throw new NotFoundException(
        'No clock-in record exists for this employee and date',
      );
    }
    if (existingAttendance.clockOut !== null) {
      throw new ConflictException(
        'Employee has already clocked out for this date',
      );
    }

    existingAttendance.clockOut = new Date();
    existingAttendance.status = action;
    return this.attendanceRepository.save(existingAttendance);
  }

  async getSummary(request: AttendanceSummaryRequestBodyDto) {
    const today = new Date();
    const todayString = this.toDateString(today);
    const startDate =
      request.start_date ??
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    const endDate = request.end_date ?? todayString;

    if (startDate > endDate) {
      throw new BadRequestException('start_date must be the same or before end_date');
    }

    const attendances = await this.attendanceRepository.find({
      where: {
        employeeId: request.employee_id,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });

    return {
      employee_id: request.employee_id,
      start_date: startDate,
      end_date: endDate,
      total_days: attendances.length,
      attendances,
    };
  }

  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
