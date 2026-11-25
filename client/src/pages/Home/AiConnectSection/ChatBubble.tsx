import { Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';

import { getChatBubbleStyle } from '@/pages/Home/AiConnectSection/styles';

interface ChatBubbleProps {
  children: ReactNode;
  isUser?: boolean;
}

const ChatBubble = ({ children, isUser = false }: ChatBubbleProps) => {
  const theme = useTheme();

  return (
    <Typography component="div" sx={getChatBubbleStyle(theme, isUser)}>
      {children}
    </Typography>
  );
};

export default ChatBubble;
