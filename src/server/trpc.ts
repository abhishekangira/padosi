import { initTRPC } from "@trpc/server";
const t = initTRPC.create();
import { PrismaClient } from "@prisma/client";
import { connect } from "@planetscale/database";

export const prisma = new PrismaClient();
export const trpcRouter = t.router;
export const procedure = t.procedure;

const planetConfig = {
  host: "aws.connect.psdb.cloud",
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
};

export const planet = connect(planetConfig);
