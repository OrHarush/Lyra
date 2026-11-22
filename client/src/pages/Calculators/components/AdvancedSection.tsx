import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ButtonBase, Collapse, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';

import Column from '@/components/shared/layout/containers/Column';

interface AdvancedSectionProps {
  label: string;
  children: ReactNode;
}

const AdvancedSection = ({ label, children }: AdvancedSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAdvancedSection = () => setIsOpen(previous => !previous);

  return (
    <Column sx={{ borderTop: 1, borderColor: 'divider', pt: 0.5 }}>
      <ButtonBase
        onClick={toggleAdvancedSection}
        aria-expanded={isOpen}
        sx={{
          justifyContent: 'flex-start',
          gap: 0.5,
          py: 0.75,
          borderRadius: 1,
          color: 'text.secondary',
        }}
      >
        <ExpandMoreIcon
          fontSize="small"
          sx={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
        <Typography variant="body2">{label}</Typography>
      </ButtonBase>
      <Collapse in={isOpen}>
        <Column sx={{ pt: 1, pb: 0.5 }}>{children}</Column>
      </Collapse>
    </Column>
  );
};

export default AdvancedSection;
