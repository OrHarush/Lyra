import { useState } from 'react';

import { NotificationDto } from '@/types/Notification';

// Seen updates are remembered only while the app is open. Persist them when the first kind of
// update ships.
export const useUnseenUpdates = (updates: NotificationDto[]) => {
  const [seenIds, setSeenIds] = useState<string[]>([]);

  return {
    hasUnseenUpdates: updates.some(({ id }) => !seenIds.includes(id)),
    markUpdatesSeen: () => setSeenIds(updates.map(({ id }) => id)),
  };
};
