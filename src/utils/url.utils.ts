export const getNetworkUrl = ({ domain, domainSubfolder }: { domain: string; domainSubfolder?: string }) =>
  domainSubfolder ? `https://${domainSubfolder}` : `https://${domain}`;

export const getSlackAppUrl = (url: string) => `${url}/manage/apps/LUNjAcpf92-Wz6v7SS70WHi`;

export const getNetworkSearchUrl = (url: string) => `${url}/search?query=example&type=external`;

export const extractSlackSubdomain = (url: string) => {
  const regex = /^(https?:\/\/)?([^.]+)\.slack\.com/;
  const match = url.match(regex);

  if (match) {
    const subdomain = match[2];
    return subdomain;
  }
  return url;
};