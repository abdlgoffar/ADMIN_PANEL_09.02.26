import { MigrationInterface, QueryRunner } from 'typeorm';

export class PostIndexes1770704234346 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_posts_is_deleted_created_at
      ON posts (is_deleted, created_at DESC);
    `);

    await queryRunner.query(`
      ALTER TABLE posts
      ADD FULLTEXT INDEX idx_posts_paragraph (paragraph);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX idx_posts_is_deleted_created_at ON posts;
    `);

    await queryRunner.query(`
      ALTER TABLE posts
      DROP INDEX idx_posts_paragraph;
    `);
  }
}
