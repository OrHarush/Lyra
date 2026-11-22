import { useSearchParams } from 'react-router-dom';

const FUNDS_PARAM = 'funds';

// "All funds" is the absence of the param, so the URL stays clean and a refresh keeps the choice.
export const useFundFilter = (allSymbols: string[]) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const requested = (searchParams.get(FUNDS_PARAM) ?? '').split(',').filter(Boolean);
  const known = requested.filter(symbol => allSymbols.includes(symbol));
  const selectedSymbols = known.length > 0 ? known : allSymbols;
  const isAllSelected = selectedSymbols.length === allSymbols.length;

  const writeSelection = (symbols: string[]) => {
    const coversEverything = symbols.length === 0 || symbols.length === allSymbols.length;

    setSearchParams(
      previous => {
        const next = new URLSearchParams(previous);

        if (coversEverything) {
          next.delete(FUNDS_PARAM);
        } else {
          next.set(FUNDS_PARAM, symbols.join(','));
        }

        return next;
      },
      { replace: true }
    );
  };

  const selectAll = () => writeSelection([]);

  const toggleFund = (symbol: string) => {
    const next = selectedSymbols.includes(symbol)
      ? selectedSymbols.filter(selected => selected !== symbol)
      : [...selectedSymbols, symbol];

    writeSelection(next);
  };

  return {
    selectedSymbols,
    isAllSelected,
    symbolsForQuery: isAllSelected ? [] : selectedSymbols,
    selectAll,
    toggleFund,
  };
};
