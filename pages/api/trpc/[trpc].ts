import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "@/server/routers/_app";
import { PrismaClient } from "@prisma/client";
import { connect } from "@planetscale/database";
import { inferAsyncReturnType } from "@trpc/server";

const planetConfig = {
  host: "aws.connect.psdb.cloud",
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
};

const prisma = new PrismaClient();
const planet = connect(planetConfig);

const createContext = () => ({
  prisma,
  planet,
});

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});

export type TrpcContextType = inferAsyncReturnType<typeof createContext>;
