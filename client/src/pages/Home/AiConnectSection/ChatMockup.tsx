import { Typography, useTheme } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import ChatBubble from '@/pages/Home/AiConnectSection/ChatBubble';
import { getBadgeStyle, getPillStyle } from '@/pages/Home/AiConnectSection/styles';

const DEMO_FOOD_THIS_MONTH = 2140;
const DEMO_FOOD_DROP = 310;
const DEMO_PROJECTED_BALANCE = 2180;
const HIGHLIGHT_SX = { fontWeight: 700, fontSize: 'inherit' };

const ChatMockup = () => {
  const { t } = useTranslation('home');
  const theme = useTheme();

  return (
    <Column
      spacing={2}
      sx={{
        borderRadius: 6,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'background.paper',
        p: { xs: 2, md: 3 },
      }}
    >
      <Row
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
      >
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary' }}>
          {t('landing.ai.chat.assistantLabel')}
        </Typography>
        <Typography component="span" sx={getBadgeStyle(theme)}>
          {t('landing.ai.chat.connectedBadge')}
        </Typography>
      </Row>

      <ChatBubble isUser>{t('landing.ai.chat.question1')}</ChatBubble>
      <ChatBubble>
        <Column spacing={1.25}>
          <span>
            <Trans
              t={t}
              i18nKey="landing.ai.chat.answer1"
              components={{
                total: <CurrencyText value={DEMO_FOOD_THIS_MONTH} sx={HIGHLIGHT_SX} />,
                drop: <CurrencyText value={DEMO_FOOD_DROP} sx={HIGHLIGHT_SX} />,
              }}
            />
          </span>
          <Row spacing={1} flexWrap="wrap" useFlexGap>
            <Typography component="span" dir="ltr" sx={getPillStyle(theme)}>
              analyzeSpending
            </Typography>
            <Typography component="span" sx={getPillStyle(theme)}>
              {t('landing.ai.chat.workspacePill')}
            </Typography>
          </Row>
        </Column>
      </ChatBubble>
      <ChatBubble isUser>{t('landing.ai.chat.question2')}</ChatBubble>
      <ChatBubble>
        <Trans
          t={t}
          i18nKey="landing.ai.chat.answer2"
          components={{
            projected: <CurrencyText value={DEMO_PROJECTED_BALANCE} hasColor sx={HIGHLIGHT_SX} />,
          }}
        />
      </ChatBubble>
    </Column>
  );
};

export default ChatMockup;
