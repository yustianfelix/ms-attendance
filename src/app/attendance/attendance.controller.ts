import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceActionDto } from './dto/attendance-action.dto';
import { AttendanceActionResponseDto } from './dto/attendance-action-response.dto';
import { AttendanceSummaryRequestBodyDto } from './dto/attendance-summary-request-body.dto';
import { AttendanceSummaryResponseDto } from './dto/attendance-summary-response.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  async recordAction(
    @Body() attendanceActionDto: AttendanceActionDto,
  ): Promise<AttendanceActionResponseDto> {
    const attendance =
      await this.attendanceService.recordAction(attendanceActionDto);

    return {
      code: '00',
      message: 'Success',
      data: attendance,
    };
  }

  @Get('summary')
  async getSummary(
    @Body() body: AttendanceSummaryRequestBodyDto,
  ): Promise<AttendanceSummaryResponseDto> {
    const data = await this.attendanceService.getSummary(body);

    return {
      code: '00',
      message: 'Success',
      data,
    };
  }
}
