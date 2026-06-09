/* eslint-disable @typescript-eslint/no-explicit-any */
// Integration smoke test for the GraphQL layer against the real Neon DB.
// Bypasses Clerk by injecting a fake-user context, so it verifies resolvers,
// Prisma, and ownership isolation without a browser session.
//   run: npx tsx scripts/smoke-graphql.ts
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });
loadEnv();

void (async () => {
  const { execute, parse } = await import('graphql');
  const { schema } = await import('../src/lib/graphql/schema');
  const { prisma } = await import('../src/lib/db/prisma');

  const ctxA = { userId: 'smoke_user_A', prisma };
  const ctxB = { userId: 'smoke_user_B', prisma };

  const run = async (
    source: string,
    variableValues?: Record<string, unknown>,
    contextValue: unknown = ctxA,
  ): Promise<Record<string, any>> => {
    const res = await execute({
      schema,
      document: parse(source),
      contextValue,
      variableValues,
    });
    if (res.errors?.length) {
      throw new Error(res.errors.map((e) => e.message).join('; '));
    }
    return res.data as Record<string, any>;
  };

  const created = await run(
    `mutation($input: CreateTimelapseInput!){ createTimelapse(input:$input){ id title canvasWidth canvasHeight } }`,
    { input: { title: 'Smoke test' } },
  );
  console.log('created:', created.createTimelapse);

  const mine = await run(`{ myTimelapses { id title } }`);
  console.log(`A sees ${mine.myTimelapses.length} timelapse(s)`);

  const other = await run(`{ myTimelapses { id } }`, undefined, ctxB);
  const leaked = other.myTimelapses.some(
    (t: any) => t.id === created.createTimelapse.id,
  );
  console.log('B sees A timelapse?', leaked);

  let forbidden = false;
  try {
    await run(
      `mutation($id: ID!){ deleteTimelapse(id:$id) }`,
      { id: created.createTimelapse.id },
      ctxB,
    );
  } catch {
    forbidden = true;
  }
  console.log('B delete of A blocked?', forbidden);

  const del = await run(`mutation($id: ID!){ deleteTimelapse(id:$id) }`, {
    id: created.createTimelapse.id,
  });
  console.log('A deleted own:', del.deleteTimelapse);

  await prisma.$disconnect();

  if (leaked || !forbidden) {
    console.error('SMOKE FAILED: ownership leak');
    process.exit(1);
  }
  console.log('SMOKE OK');
})();
