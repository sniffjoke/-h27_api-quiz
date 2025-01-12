

export const checkWebsiteString: RegExp = /^https?:\/\/[^\s$.?#].[^\s]*$/;

export const checkLikeStatusString: RegExp = /\b(?:Like|Dislike|None)\b/;

export const codeAuth = (code: string) => {
  const buff2 = Buffer.from(code, 'utf8');
  const codedAuth = buff2.toString('base64');
  return codedAuth;
};



