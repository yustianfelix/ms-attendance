import type { Attendance } from '../entity/attendance.entity';

export interface AttendanceSummaryResponseDto {
  code: '00';
  message: 'Success';
  data: {
    employee_id: string;
    start_date: string;
    end_date: string;
    total_days: number;
    attendances: Attendance[];
  };
}
