interface StructuredDataProps {
  type: 'Article' | 'JobPosting' | 'Event' | 'website';
  data?: any;
  name?: string;
  description?: string;
  url?: string;
}

export function StructuredData({ type, data, name, description, url }: StructuredDataProps) {
  const generateStructuredData = () => {
    switch (type) {
      case 'Article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.title,
          description: data.description,
          author: {
            '@type': 'Organization',
            name: 'INFO TAWJIH 2.0',
            url: 'https://infotawjih.ma'
          },
          publisher: {
            '@type': 'Organization',
            name: 'INFO TAWJIH 2.0',
            logo: {
              '@type': 'ImageObject',
              url: 'https://infotawjih.ma/logo.png'
            }
          },
          datePublished: data.datePublished,
          dateModified: data.dateModified,
          image: data.image ? {
            '@type': 'ImageObject',
            url: data.image.url,
            width: 1200,
            height: 630
          } : undefined,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data.url
          },
          articleSection: data.category,
          inLanguage: 'ar-MA'
        };

      case 'JobPosting':
        return {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: data.title,
          description: data.description,
          datePosted: data.datePosted,
          validThrough: data.validThrough,
          employmentType: 'FULL_TIME',
          hiringOrganization: {
            '@type': 'Organization',
            name: data.organization,
            sameAs: data.organizationUrl
          },
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: data.location,
              addressCountry: 'MA'
            }
          },
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'MAD',
            value: {
              '@type': 'QuantitativeValue',
              value: data.salary,
              unitText: 'MONTH'
            }
          },
          jobBenefits: data.benefits,
          qualifications: data.qualifications,
          educationRequirements: data.education,
          experienceRequirements: data.experience,
          industry: data.industry,
          occupationalCategory: data.category
        };

      case 'Event':
        return {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: data.name,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          location: {
            '@type': 'Place',
            name: data.locationName,
            address: {
              '@type': 'PostalAddress',
              addressLocality: data.location,
              addressCountry: 'MA'
            }
          },
          organizer: {
            '@type': 'Organization',
            name: data.organizer,
            url: data.organizerUrl
          },
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'MAD',
            availability: 'https://schema.org/InStock',
            validFrom: data.validFrom
          },
          inLanguage: 'ar-MA'
        };

      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: name || 'INFO TAWJIH 2.0',
          description: description || 'منصة متخصصة في التوجيه المدرسي ومباريات التوظيف العمومي وتواريخ الامتحانات بالمغرب',
          url: url || 'https://infotawjih.ma',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://infotawjih.ma/api/search?q={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
          },
          publisher: {
            '@type': 'Organization',
            name: 'INFO TAWJIH 2.0',
            logo: {
              '@type': 'ImageObject',
              url: 'https://infotawjih.ma/logo.png'
            }
          },
          inLanguage: 'ar-MA'
        };

      default:
        return null;
    }
  };

  const structuredData = generateStructuredData();

  if (!structuredData) {
    return null;
  }

  return (
    <script
      suppressHydrationWarning
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}