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
import { AttendanceListQueryDto } from './dto/attendance-list-query.dto';
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
      throw new BadRequestException(
        'start_date must be on or before end_date',
      );
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

  async getList(query: AttendanceListQueryDto) {
    const page = this.toPositiveInteger(query.page, 1, 'page');
    const pageSize = this.toPositiveInteger(
      query.pageSize,
      10,
      'pageSize',
    );

    const where: {
      employeeId?: string;
      date?: string;
    } = {};

    if (query.employee_id !== undefined) {
      where.employeeId = query.employee_id;
    }
    if (query.date !== undefined) {
      where.date = query.date;
    }

    const [attendances, total] =
      await this.attendanceRepository.findAndCount({
        where,
        order: { date: 'DESC', clockIn: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

    return {
      attendances,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  private toPositiveInteger(
    value: number | string | undefined,
    defaultValue: number,
    name: string,
  ): number {
    if (value === undefined) {
      return defaultValue;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException(`${name} must be a positive integer`);
    }
    return parsed;
  }

  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
