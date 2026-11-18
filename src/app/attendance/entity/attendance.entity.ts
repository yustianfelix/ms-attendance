import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('UQ_attendance_employee_date', ['employeeId', 'date'], { unique: true })
@Entity({ name: 'attendance' })
export class Attendance {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid: string;

  @Column({ name: 'employee_id', type: 'bigint' })
  employeeId: string;

  @Column({ name: 'date', type: 'date' })
  date: string;

  @Column({ name: 'clock_in', type: 'timestamptz' })
  clockIn: Date;

  @Column({ name: 'clock_out', type: 'timestamptz', nullable: true })
  clockOut: Date | null;
}
