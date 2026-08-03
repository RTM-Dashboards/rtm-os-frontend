const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const j = (o) => JSON.stringify(o, null, 2);
(async () => {
  console.log('LEAD:', j(await p.lead.findUnique({
    where: { id: 'LGHL1785432790893' },
    select: { name: true, email: true, ghlContactId: true, ghlContactTags: true,
              ghlSyncStatus: true, ghlSyncError: true } })));
  console.log('STATUS:', j(await p.leadStatus.findUnique({
    where: { leadId: 'LGHL1785432790893' },
    select: { stage: true, ghlContactId: true, ghlSyncStatus: true,
              ghlSyncError: true, ghlLastStagePushedAt: true } })));
  await p.$disconnect();
})().catch(async e => { console.error(e); await p.$disconnect(); process.exit(1); });
