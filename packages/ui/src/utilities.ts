export function slackLink(url: string, text?: string) {
  return `<${url}|${text || url}>`;
}
