import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttendanceTable1794975888352 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "attendance" (
        "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
        "employee_id" bigint NOT NULL,
        "clock_in" timestamptz NOT NULL,
        "clock_out" timestamptz,
        CONSTRAINT "PK_attendance_uuid" PRIMARY KEY ("uuid")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "attendance"');
  }
}
