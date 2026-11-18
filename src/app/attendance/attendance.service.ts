import {ConflictException, Injectable, Logger,} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {AttendanceAction, AttendanceActionDto,} from './dto/attendance-action.dto';
import {Attendance} from './entity/attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  private logger = new Logger(Attendance.name);

  async recordAction(
    attendanceActionDto: AttendanceActionDto,
  ) {
    const { employee_id: employeeId, date, action } = attendanceActionDto;
    const existingAttendance = await this.attendanceRepository.findOneBy({
      employeeId,
      date,
    });

    if (action === AttendanceAction.ClockIn) {
      if (existingAttendance?.clockIn != null) {
        this.logger.error('Employee has already clocked in for this date');
        throw new ConflictException(
          'Employee has already clocked in for this date',
        );
      }

      const attendance = this.attendanceRepository.create({
        employeeId,
        date,
        clockIn: new Date(),
        clockOut: null,
      });

      try {
        return await this.attendanceRepository.save(attendance);
      } catch (error) {
        this.logger.error('error when saving', error);
        throw error;
      }
    } else if (action === AttendanceAction.ClockOut) {
      if (existingAttendance?.clockOut != null) {
        this.logger.error('Employee has already clocked out for this date');
        throw new ConflictException(
          'Employee has already clocked out for this date',
        );
      }

      const attendance = this.attendanceRepository.create({
        employeeId,
        date,
        clockIn: new Date(),
        clockOut: null,
      });

      try {
        return await this.attendanceRepository.save(attendance);
      } catch (error) {
        this.logger.error('error when saving ', error);
        throw error;
      }
    }
  }

}
