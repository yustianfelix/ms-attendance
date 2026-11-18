import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { Attendance } from '../../../src/app/attendance/entity/attendance.entity';
import { AttendanceService } from '../../../src/app/attendance/attendance.service';
import {
  AttendanceAction,
  AttendanceActionDto,
} from '../../../src/app/attendance/dto/attendance-action.dto';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let repository: jest.Mocked<
    Pick<Repository<Attendance>, 'create' | 'save' | 'findOneBy'>
  >;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(Attendance),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get(AttendanceService);
  });

  it('creates a clock-in record when no record exists for the employee and date', async () => {
    const input: AttendanceActionDto = {
      employee_id: '42',
      date: '2026-11-18',
      action: AttendanceAction.ClockIn,
    };
    const attendance = {
      employeeId: '42',
      date: input.date,
      clockIn: new Date(),
      clockOut: null,
    } as Attendance;
    repository.findOneBy.mockResolvedValue(null);
    repository.create.mockReturnValue(attendance);
    repository.save.mockResolvedValue(attendance);

    await expect(service.recordAction(input)).resolves.toBe(attendance);
    expect(repository.create).toHaveBeenCalledWith({
      employeeId: '42',
      date: input.date,
      clockIn: expect.any(Date),
      clockOut: null,
    });
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeId: '42',
        date: input.date,
        clockOut: null,
      }),
    );
  });

  it('rejects duplicate clock-in without replacing the existing record', async () => {
    const attendance = {
      employeeId: '42',
      date: '2026-11-18',
      clockIn: new Date(),
      clockOut: null,
    } as Attendance;
    repository.findOneBy.mockResolvedValue(attendance);

    await expect(
      service.recordAction({
        employee_id: '42',
        date: '2026-11-18',
        action: AttendanceAction.ClockIn,
      }),
    ).rejects.toThrow('Employee has already clocked in for this date');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('sets the clock-out time on the existing attendance record', async () => {
    const attendance = {
      uuid: 'attendance-id',
      employeeId: '42',
      date: '2026-11-18',
      clockIn: new Date('2026-11-18T08:30:00.000Z'),
      clockOut: null,
    } as Attendance;
    repository.findOneBy.mockResolvedValue(attendance);
    repository.save.mockImplementation(async (record) => record as Attendance);

    await expect(
      service.recordAction({
        employee_id: '42',
        date: '2026-11-18',
        action: AttendanceAction.ClockOut,
      }),
    ).resolves.toBe(attendance);
    expect(attendance.clockOut).toBeInstanceOf(Date);
    expect(repository.save).toHaveBeenCalledWith(attendance);
  });

  it('rejects clock-out when no clock-in exists', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(
      service.recordAction({
        employee_id: '42',
        date: '2026-11-18',
        action: AttendanceAction.ClockOut,
      }),
    ).rejects.toThrow('No clock-in record exists for this employee and date');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('rejects clock-out if the employee has already clocked out', async () => {
    const attendance = {
      uuid: 'attendance-id',
      employeeId: '42',
      date: '2026-11-18',
      clockIn: new Date('2026-11-18T08:30:00.000Z'),
      clockOut: new Date('2026-11-18T17:00:00.000Z'),
    } as Attendance;
    repository.findOneBy.mockResolvedValue(attendance);

    await expect(
      service.recordAction({
        employee_id: '42',
        date: '2026-11-18',
        action: AttendanceAction.ClockOut,
      }),
    ).rejects.toThrow('Employee has already clocked out for this date');
    expect(repository.save).not.toHaveBeenCalled();
  });
});
