import { useState } from 'react';

const STORAGE_KEY = 'lyra_fixed_expense_prompts_skipped';

const readSkipped = (): string[] => JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]');

// Skipping only hides the question until the next visit; nothing is saved to the expense.
export const useSkippedPrompts = () => {
  const [skippedIds, setSkippedIds] = useState(readSkipped);

  const skipPrompt = (id: string) => {
    const next = [...skippedIds, id];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSkippedIds(next);
  };

  return { skippedIds, skipPrompt };
};
