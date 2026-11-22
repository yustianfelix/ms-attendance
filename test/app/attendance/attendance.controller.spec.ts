import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from '../../../src/app/attendance/attendance.controller';
import { AttendanceService } from '../../../src/app/attendance/attendance.service';
import {
  AttendanceAction,
  AttendanceActionDto,
} from '../../../src/app/attendance/dto/attendance-action.dto';
import { Attendance } from '../../../src/app/attendance/entity/attendance.entity';

describe('AttendanceController', () => {
  let controller: AttendanceController;
  let attendanceService: jest.Mocked<
    Pick<AttendanceService, 'recordAction' | 'getSummary' | 'getList'>
  >;

  beforeEach(async () => {
    attendanceService = {
      recordAction: jest.fn(),
      getSummary: jest.fn(),
      getList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: attendanceService,
        },
      ],
    }).compile();

    controller = module.get(AttendanceController);
  });

  it('returns code 00 and the saved attendance after a successful action', async () => {
    const input: AttendanceActionDto = {
      employee_id: '42',
      date: '2026-11-18',
      action: AttendanceAction.ClockIn,
    };
    const attendance = {
      uuid: 'attendance-id',
      employeeId: '42',
      date: input.date,
      clockIn: new Date('2026-11-18T08:30:00.000Z'),
      clockOut: null,
    } as Attendance;
    attendanceService.recordAction.mockResolvedValue(attendance);

    await expect(controller.recordAction(input)).resolves.toEqual({
      code: '00',
      message: 'Success',
      data: attendance,
    });
    expect(attendanceService.recordAction).toHaveBeenCalledWith(input);
  });

  it('returns code 00 and summary data', async () => {
    const summary = {
      employee_id: '42',
      start_date: '2026-11-01',
      end_date: '2026-11-18',
      total_days: 0,
      attendances: [],
    };
    attendanceService.getSummary.mockResolvedValue(summary);

    await expect(
      controller.getSummary({ employee_id: '42' }),
    ).resolves.toEqual({
      code: '00',
      message: 'Success',
      data: summary,
    });
  });

  it('returns a paginated attendance list', async () => {
    const list = {
      attendances: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      },
    };
    attendanceService.getList.mockResolvedValue(list);

    await expect(
      controller.getList({ employee_id: '42', date: '2026-11-18' }),
    ).resolves.toEqual({
      code: '00',
      message: 'Success',
      data: list,
    });
    expect(attendanceService.getList).toHaveBeenCalledWith({
      employee_id: '42',
      date: '2026-11-18',
    });
  });
});
