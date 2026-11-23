import { useEffect } from 'react';

import { DEFAULT_OG_IMAGE_URL } from '@/constants/Site';

interface PageSeoProps {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  image?: string;
}

const DEFAULT_IMAGE = DEFAULT_OG_IMAGE_URL;

const upsertByName = (name: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }

  const previous = tag.getAttribute('content');
  tag.setAttribute('content', content);

  return () => {
    if (previous === null) {
      tag.remove();
      return;
    }

    tag.setAttribute('content', previous);
  };
};

const upsertByProperty = (property: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }

  const previous = tag.getAttribute('content');
  tag.setAttribute('content', content);

  return () => {
    if (previous === null) {
      tag.remove();
      return;
    }

    tag.setAttribute('content', previous);
  };
};

const upsertCanonical = (href: string) => {
  let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'canonical');
    document.head.appendChild(tag);
  }

  const previous = tag.getAttribute('href');
  tag.setAttribute('href', href);

  return () => {
    if (previous === null) {
      tag.remove();
      return;
    }

    tag.setAttribute('href', previous);
  };
};

const PageSeo = ({ title, description, canonical, ogType = 'article', image = DEFAULT_IMAGE }: PageSeoProps) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const restores = [
      upsertByName('description', description),
      upsertCanonical(canonical),
      upsertByProperty('og:title', title),
      upsertByProperty('og:description', description),
      upsertByProperty('og:type', ogType),
      upsertByProperty('og:url', canonical),
      upsertByProperty('og:image', image),
      upsertByName('twitter:title', title),
      upsertByName('twitter:description', description),
      upsertByName('twitter:image', image),
    ];

    return () => {
      document.title = previousTitle;
      restores.forEach(restore => restore());
    };
  }, [title, description, canonical, ogType, image]);

  return null;
};

export default PageSeo;
