import {
  BRAND_ADDRESS,
  BRAND_EMAIL,
  BRAND_LEGAL,
  BRAND_LOGO_PATH,
  BRAND_NAME,
  BRAND_PHONE_TEL,
  BRAND_SHORT,
  BRAND_TAGLINE,
  SITE_URL,
} from "@/lib/brand";

const organizationJson = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND_LEGAL,
  alternateName: BRAND_SHORT,
  url: SITE_URL,
  logo: `${SITE_URL}${BRAND_LOGO_PATH}`,
  description: BRAND_TAGLINE,
  address: {
    "@type": "PostalAddress",
    streetAddress: BRAND_ADDRESS.streetAddress,
    addressLocality: BRAND_ADDRESS.locality,
    addressRegion: BRAND_ADDRESS.region,
    postalCode: BRAND_ADDRESS.postalCode,
    addressCountry: BRAND_ADDRESS.country,
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: BRAND_PHONE_TEL,
      contactType: "customer service",
      email: BRAND_EMAIL,
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  ],
  sameAs: [SITE_URL],
};

const websiteJson = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND_NAME,
  url: SITE_URL,
  publisher: {
    "@type": "Organization",
    name: BRAND_LEGAL,
    url: SITE_URL,
  },
};

function JsonLd({ id, data }: { id: string; data: object }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SiteStructuredData() {
  return (
    <>
      <JsonLd id="ld-org" data={organizationJson} />
      <JsonLd id="ld-website" data={websiteJson} />
    </>
  );
}
