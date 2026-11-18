import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AttendanceAction,
  AttendanceActionDto,
} from './dto/attendance-action.dto';
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
    return this.attendanceRepository.save(existingAttendance);
  }
}
