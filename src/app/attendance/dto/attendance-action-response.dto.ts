import type { Attendance } from '../entity/attendance.entity';

export interface AttendanceActionResponseDto {
  code: '00';
  message: 'Success';
  data: Attendance;
}
