export const copyToClipboard = async (text: string): Promise<void> => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);

      return;
    } catch {
      copyViaTextarea(text);

      return;
    }
  }

  copyViaTextarea(text);
};

const copyViaTextarea = (text: string): void => {
  const textarea = document.createElement('textarea');

  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.setAttribute('readonly', '');

  document.body.appendChild(textarea);
  textarea.select();

  try {
    const copied = document.execCommand('copy');

    if (!copied) {
      throw new Error('Clipboard copy command was rejected');
    }
  } finally {
    document.body.removeChild(textarea);
  }
};
