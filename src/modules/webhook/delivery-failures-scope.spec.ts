// GET /webhooks/delivery-failures takes sessionId as a QUERY param, which the ApiKeyGuard fence
// (route-params only) does not scope. A session-restricted ADMIN key must not read another session's
// failed-delivery rows — which carry the webhook URL, event, idempotencyKey and lastError. Exercised
// end-to-end against a real in-memory DB, mirroring webhook-session-scope.spec.ts.
import { DataSource } from 'typeorm';
import { WebhookService } from './webhook.service';
import { WebhookDeliveryFailure } from './entities/webhook-delivery-failure.entity';

describe('WebhookService.listDeliveryFailures session scoping', () => {
  let ds: DataSource;
  let service: WebhookService;

  beforeEach(async () => {
    ds = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [WebhookDeliveryFailure],
      synchronize: true,
    });
    await ds.initialize();
    const failureRepo = ds.getRepository(WebhookDeliveryFailure);
    const cfg = { get: () => false };
    // 2nd arg is the delivery-failure repo; the webhook/session repos and the delivery service
    // (5th arg) are never touched by the scoping paths under test.
    service = new WebhookService({} as never, failureRepo, {} as never, cfg as never, {} as never);
    for (const sessionId of ['sessA', 'sessB']) {
      await failureRepo.save(
        failureRepo.create({
          webhookId: `wh-${sessionId}`,
          sessionId,
          event: 'message.received',
          url: `https://${sessionId}.example/hook`,
          attempts: 3,
          lastError: 'ECONNREFUSED',
        }),
      );
    }
  });

  afterEach(async () => {
    await ds.destroy();
  });

  it('a key scoped to sessA sees only sessA failures, never sessB', async () => {
    const rows = await service.listDeliveryFailures({}, ['sessA']);
    expect(rows.map(r => r.sessionId)).toEqual(['sessA']);
  });

  it('a scoped key requesting sessB (outside its scope) gets nothing', async () => {
    const rows = await service.listDeliveryFailures({ sessionId: 'sessB' }, ['sessA']);
    expect(rows).toEqual([]);
  });

  it('an unrestricted key (null allowlist) sees all sessions', async () => {
    const rows = await service.listDeliveryFailures({}, null);
    expect(rows.map(r => r.sessionId).sort()).toEqual(['sessA', 'sessB']);
  });

  it('an unrestricted key can narrow to a single session via the query param', async () => {
    const rows = await service.listDeliveryFailures({ sessionId: 'sessB' }, null);
    expect(rows.map(r => r.sessionId)).toEqual(['sessB']);
  });
});
