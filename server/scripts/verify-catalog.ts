import { INSTRUMENT_CATALOG } from '../src/config/instrumentCatalog';
import { todayIso } from '../src/services/investments/isoDate';
import { YahooMarketDataProvider } from '../src/services/investments/marketData/YahooMarketDataProvider';
import { verifyCatalog } from '../src/services/investments/verifyCatalog';

// Read-only: talks to Yahoo only. Run manually before releases; exits non-zero if any symbol has no data.
const run = async () => {
  const results = await verifyCatalog(
    new YahooMarketDataProvider(),
    INSTRUMENT_CATALOG,
    todayIso(new Date())
  );

  for (const result of results) {
    const detail = result.ok
      ? `₪${result.price} · ${result.historyPoints} closes`
      : `FAILED: ${result.reason}`;

    console.log(`${result.ok ? 'OK  ' : 'FAIL'} ${result.id} ${result.yahooSymbol} ${detail}`);
  }

  const failures = results.filter(result => !result.ok);

  if (failures.length > 0) {
    console.error(`\n${failures.length} of ${results.length} catalog symbols failed verification.`);
    process.exit(1);
  }

  console.log(`\nAll ${results.length} catalog symbols verified.`);
};

run().catch(error => {
  console.error(error);
  process.exit(1);
});
