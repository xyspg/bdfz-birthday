import {
	mysqlTable,
	mysqlSchema,
	primaryKey,
	int,
	varchar,
	text,
	json,
	unique,
	timestamp,
	index,
	serial,
	bigint,
	tinyint,
	datetime,
	varbinary
} from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const chalkData = mysqlTable("chalk_data", {
		id: int("id").autoincrement().notNull(),
		usin: varchar("usin", { length: 255 }).notNull(),
		photo: varchar("photo", { length: 255 }),
		name: varchar("name", { length: 255 }).notNull(),
		phone: varchar("phone", { length: 20 }),
		email: varchar("email", { length: 255 }),
		avatar: varchar("avatar", { length: 255 }),
		gender: varchar("gender", { length: 255 }),
		birthday: varchar("birthday", { length: 255 }),
		photo_blob: varbinary("photo_blob", { length: 16777215 }),
		avatar_blob: varbinary("avatar_blob", { length: 16777215 }),
	},
	(table) => {
		return {
			chalkDataId: primaryKey({ columns: [table.id], name: "chalk_data_id"}),
			email: unique("email").on(table.email),
			usin: unique("usin").on(table.usin),
		}
	});
