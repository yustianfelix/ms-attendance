import { Body, Controller, Post } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceActionDto } from './dto/attendance-action.dto';
import { Attendance } from './entity/attendance.entity';

interface AttendanceActionResponse {
  code: '00';
  message: 'Success';
  data: Attendance;
}

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  async recordAction(
    @Body() attendanceActionDto: AttendanceActionDto,
  ): Promise<AttendanceActionResponse> {
    const attendance =
      await this.attendanceService.recordAction(attendanceActionDto);

    return {
      code: '00',
      message: 'Success',
      data: attendance,
    };
  }
}
