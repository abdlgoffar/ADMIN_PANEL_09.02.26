import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePostsTable1770707754290 implements MigrationInterface {
    name = 'CreatePostsTable1770707754290'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`idx_posts_is_deleted_created_at\` ON \`posts\``);
        await queryRunner.query(`DROP INDEX \`idx_posts_paragraph\` ON \`posts\``);
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`paragraph\` \`paragraph\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`hashedRefreshToken\` \`hashedRefreshToken\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`hashedRefreshToken\` \`hashedRefreshToken\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`paragraph\` \`paragraph\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`CREATE FULLTEXT INDEX \`idx_posts_paragraph\` ON \`posts\` (\`paragraph\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_posts_is_deleted_created_at\` ON \`posts\` (\`is_deleted\`, \`created_at\`)`);
    }

}
