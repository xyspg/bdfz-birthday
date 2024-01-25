import type { APIRoute } from "astro";
import { db } from "../../../drizzle";
import { chalkData } from "../../../drizzle/schema.ts";
import {eq, and, like, not} from "drizzle-orm";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { name, birthday } = body;
  if (!name || !body) {
    return new Response(
      JSON.stringify({
        message: "姓名或生日不能为空",
      }),
      {
        status: 400,
      },
    );
  }
  const person = await db.query.chalkData.findFirst({
    columns: {
      name: true,
      birthday: true,
    },
    where: eq(chalkData.name, name),
  });

  if (!person) {
    return new Response(
      JSON.stringify({
        message: "您的名字不存在",
      }),
      {
        status: 404,
      },
    );
  }

  if (person.birthday !== birthday) {
    return new Response(
      JSON.stringify({
        message: "请输入正确的生日",
      }),
      {
        status: 401,
      },
    );
  }

  const birthdayToQuery = person.birthday;
  if (birthdayToQuery === null) {
    return new Response(
      JSON.stringify({
        message: "未找到有效的生日",
      }),
      {
        status: 404,
      },
    );
  }


  const result = await db.query.chalkData.findMany({
    columns: {
      usin: true,
      name: true,
      birthday: true,
    },
    where: and(like(chalkData.birthday, `%${birthdayToQuery.substring(5)}`), not(eq(chalkData.name, name))),
  });

  return new Response(
    JSON.stringify({
      message: "ok",
      result: result.map( item => ({ ...item, usin: item.usin.substring(0,2)}))
    })
  );
};
