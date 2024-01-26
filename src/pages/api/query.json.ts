import type { APIRoute } from "astro";
import { db } from "../../../drizzle";
import { bdfzBirthdayLog, chalkData } from "../../../drizzle/schema.ts";
import { eq, and, like, not } from "drizzle-orm";
import { ratelimit } from "@/lib/redis.ts";
import * as process from "process";
const isProd = import.meta.env.PROD;

export const POST: APIRoute = async ({ request }) => {
  const ip = getIP(request);

  const { success } = await ratelimit.limit(`birthday:query:${ip ?? ""}`);

  if (!success) {
    return new Response(
      JSON.stringify({
        message: "请求过于频繁，请稍后再试",
      }),
      {
        status: 429,
      },
    );
  }
  /**
   * Statistics
   */
  const headers = request.headers;
  const userAgent = headers.get("user-agent") ?? "";
  const referer = headers.get("referer") ?? "";

  const body = await request.json();
  const { name, birthday: studentId } = body;
  if (!name || !body) {
    return new Response(
      JSON.stringify({
        message: "姓名或学号不能为空",
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
      usin: true,
    },
    where: eq(chalkData.name, name),
  });

  if (!person && isProd) {
    await db.insert(bdfzBirthdayLog).values({
      name,
      birthday: studentId,
      result: null,
      userAgent,
      ip: ip as string,
      referer,
      statusCode: 404,
    });
    return new Response(
      JSON.stringify({
        message: "您的名字不存在",
      }),
      {
        status: 404,
      },
    );
  }

  if (person?.usin !== studentId && isProd) {
    await db.insert(bdfzBirthdayLog).values({
      name,
      birthday: studentId,
      result: null,
      userAgent,
      ip: ip as string,
      referer,
      statusCode: 401,
    });
    return new Response(
      JSON.stringify({
        message: "请输入正确的学号",
      }),
      {
        status: 401,
      },
    );
  }

  const birthdayToQuery = person?.birthday;
  if (birthdayToQuery === null) {
    return new Response(
      JSON.stringify({
        message:
          "Failed to match the corresponding entry. This is an extremely weird error.",
      }),
      {
        status: 500,
      },
    );
  }

  const result = await db.query.chalkData.findMany({
    columns: {
      usin: true,
      name: true,
      birthday: true,
    },
    where: and(
      like(chalkData.birthday, `%${birthdayToQuery?.substring(5)}`),
      not(eq(chalkData.name, name)),
    ),
  });

  if (isProd) {
    await db.insert(bdfzBirthdayLog).values({
      name,
      birthday: studentId,
      result,
      userAgent,
      ip: ip as string,
      referer,
      statusCode: 200,
    });
  }
  return new Response(
    JSON.stringify({
      message: "ok",
      result: result.map((item) => ({
        ...item,
        usin: item.usin.substring(0, 2),
      })),
    }),
  );
};
function getIP(request: Request) {
  if ("ip" in request && request.ip) {
    return request.ip;
  }

  const xff = request.headers.get("x-forwarded-for");
  if (xff === "::1") {
    return "127.0.0.1";
  }

  return xff?.split(",")?.[0] ?? "127.0.0.1";
}
