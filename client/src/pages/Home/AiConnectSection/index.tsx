import { Box } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import ChatMockup from '@/pages/Home/AiConnectSection/ChatMockup';
import ConnectSteps from '@/pages/Home/AiConnectSection/ConnectSteps';
import Header from '@/pages/Home/AiConnectSection/Header';
import PrivacyCards from '@/pages/Home/AiConnectSection/PrivacyCards';

const AiConnectSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px 0px' });

  return (
    <Column
      component="section"
      id="ai-assistants"
      ref={sectionRef}
      alignItems="center"
      spacing={0}
      sx={{
        px: { xs: 2, md: 4 },
        py: { xs: 8, md: 12 },
        scrollMarginTop: '80px',
      }}
    >
      <Header isInView={isInView} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        style={{ width: '100%', maxWidth: 1080 }}
      >
        <Column spacing={{ xs: 4, md: 5 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: { xs: 4, md: 4 },
              alignItems: 'center',
            }}
          >
            <ChatMockup />
            <ConnectSteps />
          </Box>
          <PrivacyCards />
        </Column>
      </motion.div>
    </Column>
  );
};

export default AiConnectSection;
