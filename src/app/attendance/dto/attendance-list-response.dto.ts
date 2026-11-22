import type { Attendance } from '../entity/attendance.entity';

export interface AttendanceListResponseDto {
  code: '00';
  message: 'Success';
  data: {
    attendances: Attendance[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}
