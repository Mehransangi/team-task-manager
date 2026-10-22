export const stripTags = (value) => {
  if (typeof value !== 'string') return value;

  return value
    .replace(/<\/?[a-zA-Z!?][^>]*>?/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
};

export const escapeLike = (value) => String(value).replace(/[\\%_]/g, (char) => `\\${char}`);
