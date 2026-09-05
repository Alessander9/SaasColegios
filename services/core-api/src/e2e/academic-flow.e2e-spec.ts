import { db } from '@cole/database';

describe('Academic runtime contract', () => {
  it('has the seeded actors and academic aggregates required by the portal flow', async () => {
    const [teacher, parent, evaluation] = await Promise.all([
      db.user.findUnique({ where: { email: 'elena.torres@sanjose.edu.pe' } }),
      db.user.findUnique({ where: { email: 'padre.garcia@email.com' } }),
      db.evaluation.findFirst({ include: { courseSection: true } }),
    ]);

    expect(teacher).not.toBeNull();
    expect(parent).not.toBeNull();
    expect(evaluation?.courseSection).not.toBeNull();
  });
});
