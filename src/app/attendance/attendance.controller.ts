import {Body, Controller, Post} from '@nestjs/common';
import {AttendanceService} from './attendance.service';
import {AttendanceActionDto} from './dto/attendance-action.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  recordAction(@Body() attendanceActionDto: AttendanceActionDto) {
    this.attendanceService.recordAction(attendanceActionDto);
  }
}
