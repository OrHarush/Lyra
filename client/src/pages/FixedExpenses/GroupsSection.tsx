import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import GroupCard from '@/pages/FixedExpenses/GroupCard';
import { getGroupGridStyle } from '@/pages/FixedExpenses/styles';
import { FixedExpenseGroup } from '@/utils/entities/fixedExpenseGroups';

interface GroupsSectionProps {
  groups: FixedExpenseGroup[];
  onOpen: (group: FixedExpenseGroup) => void;
}

const GroupsSection = ({ groups, onOpen }: GroupsSectionProps) => {
  const { t } = useTranslation('fixedExpenses');

  return (
    <Column spacing={1.5}>
      <Typography variant="h6" fontWeight={700}>
        {t('groups.title')}
      </Typography>
      <Box sx={getGroupGridStyle()}>
        {groups.map(group => (
          <GroupCard key={group.id} group={group} onOpen={onOpen} />
        ))}
      </Box>
    </Column>
  );
};

export default GroupsSection;
