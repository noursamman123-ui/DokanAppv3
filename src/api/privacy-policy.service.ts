import apiClient from './client';
import { Endpoints } from './endpoints';
import { PrivacyPolicyContent } from '../types';
import { decodeHtmlEntities, stripHtml } from '../utils/formatters';

type WpPage = {
  id: number;
  slug?: string;
  link?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
};

const normalizeText = (value: string) =>
  decodeHtmlEntities(stripHtml(value))
    .replace(/\s+/g, ' ')
    .trim();

const extractBlocks = (html: string) => {
  const blocks: string[] = [];
  const matches = html.matchAll(/<(h[1-6]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi);

  for (const match of matches) {
    const block = normalizeText(match[2] ?? '');
    if (block) {
      blocks.push(block);
    }
  }

  return blocks;
};

export const PrivacyPolicyService = {
  getPrivacyPolicy: async (): Promise<PrivacyPolicyContent> => {
    const response = await apiClient.get<WpPage[]>(Endpoints.pages.policiesPage, {
      params: {
        search: 'السياسات',
        per_page: 20,
        _fields: 'id,slug,link,title,content',
      },
    });

    const pages = Array.isArray(response.data) ? response.data : [];
    const targetPage = pages.find((page) =>
      decodeURIComponent(page.link ?? '').includes('/السياسات/')
    ) ?? pages[0];

    if (!targetPage) {
      throw new Error('تعذر العثور على صفحة السياسات.');
    }

    const title = normalizeText(targetPage.title?.rendered ?? '') || 'سياسة الخصوصية';
    const contentHtml = targetPage.content?.rendered ?? '';
    const blocks = extractBlocks(contentHtml);
    const body = blocks.join('\n\n').trim();

    return {
      source_url: targetPage.link ?? `https://staging.dokan.com.sy${Endpoints.pages.policiesUrl}`,
      title,
      body,
    };
  },
};

