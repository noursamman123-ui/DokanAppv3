import apiClient from './client';
import { Endpoints } from './endpoints';
import { ContactInfo } from '../types';
import { decodeHtmlEntities, stripHtml } from '../utils/formatters';
import { APP_BASE_URL } from '../config/environment';

const normalizeSpace = (value: string) => value.replace(/\s+/g, ' ').trim();

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const extractMetaContent = (html: string, key: 'property' | 'name', expectedValue: string) => {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];

  for (const tag of tags) {
    const keyMatch = tag.match(new RegExp(`${key}\\s*=\\s*["']([^"']+)["']`, 'i'));
    if (!keyMatch || keyMatch[1].toLowerCase() !== expectedValue.toLowerCase()) {
      continue;
    }

    const contentMatch = tag.match(/content\s*=\s*["']([^"']*)["']/i);
    if (contentMatch?.[1]) {
      return contentMatch[1];
    }
  }

  return '';
};

const extractContactInfo = (html: string): ContactInfo => {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const ogDescription = extractMetaContent(html, 'property', 'og:description');
  const regularDescription = extractMetaContent(html, 'name', 'description');

  const decodedDescription = normalizeSpace(
    decodeHtmlEntities(
      stripHtml(ogDescription || regularDescription || '')
    )
  );

  const emails = unique(
    (html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [])
      .map((email) => email.toLowerCase())
  );

  const descriptionPhones = decodedDescription.match(/\+?\d[\d()\-\s]{7,}\d/g) ?? [];
  const whatsappLinksRaw = html.match(/https?:\/\/api\.whatsapp\.com\/send\/?\?[^"' >]+/gi) ?? [];
  const whatsappLinks = unique(
    whatsappLinksRaw.map((link) => decodeHtmlEntities(link).replace(/&amp;/g, '&'))
  );

  const whatsappPhones = whatsappLinks
    .map((link) => {
      const phoneMatch = link.match(/[?&]phone=([^&]+)/i);
      if (!phoneMatch?.[1]) {
        return '';
      }
      const digits = phoneMatch[1].replace(/\D+/g, '');
      return digits ? `+${digits}` : '';
    })
    .filter(Boolean);

  const phones = unique(
    [...descriptionPhones, ...whatsappPhones]
      .map((value) => normalizeSpace(value))
      .map((value) => {
        const digits = value.replace(/\D+/g, '');
        if (digits.length < 8) {
          return '';
        }
        return value.startsWith('+') ? `+${digits}` : `+${digits}`;
      })
  );

  const title = normalizeSpace(
    decodeHtmlEntities(stripHtml(titleMatch?.[1] ?? 'تواصل معنا'))
  ) || 'تواصل معنا';

  return {
    source_url: `${APP_BASE_URL}/contact/`,
    title,
    description: decodedDescription,
    phones,
    emails,
    whatsapp_links: whatsappLinks,
  };
};

export const ContactService = {
  getContactInfo: async (): Promise<ContactInfo> => {
    const response = await apiClient.get<string>(Endpoints.pages.contact, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
      },
      responseType: 'text',
      transformResponse: (raw) => raw,
    });

    const html = typeof response.data === 'string' ? response.data : String(response.data ?? '');
    return extractContactInfo(html);
  },
};
