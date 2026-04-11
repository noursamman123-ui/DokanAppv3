import FastImage from 'react-native-fast-image';

const WORDPRESS_BASE_URL = 'https://staging.dokan.com.sy';

export const resolveMediaUrl = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  const url = value.trim();
  if (!url) {
    return '';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  if (url.startsWith('/')) {
    return `${WORDPRESS_BASE_URL}${url}`;
  }

  return `${WORDPRESS_BASE_URL}/${url}`;
};

export const buildFastImageSource = (
  rawUrl?: string | null,
  priority: 'low' | 'normal' | 'high' = 'normal'
) => {
  const uri = resolveMediaUrl(rawUrl);

  return {
    uri,
    priority: FastImage.priority[priority],
    cache: FastImage.cacheControl.web,
  };
};
