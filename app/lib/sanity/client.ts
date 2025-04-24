import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-04-24", // Use today's date
  useCdn: process.env.NODE_ENV === "production",
});

const builder = imageUrlBuilder(client);

import { SanityImageSource } from "@sanity/image-url/lib/types/types";

export function urlFor(
  source: SanityImageSource,
): ReturnType<typeof builder.image> {
  return builder.image(source);
}

interface AboutPageData {
  story: string;
  mission: string;
  vision: string;
  timeline: Array<{
    year: string;
    title: string;
    description: string;
  }>;
  coreValues: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  team: Array<{
    name: string;
    role: string;
    bio: string;
    image: SanityImageSource;
  }>;
}

export async function getAboutPageData(): Promise<AboutPageData> {
  return client.fetch(`
    *[_type == "aboutPage"][0]{
      story,
      mission,
      vision,
      timeline[]{
        year,
        title,
        description
      },
      coreValues[]{
        title,
        description,
        icon
      },
      team[]{
        name,
        role,
        bio,
        image
      }
    }
  `);
}

interface CompanyData {
  name: string;
  description: string;
  locations: Array<{
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  }>;
}

export async function getCompanyData(): Promise<CompanyData> {
  return client.fetch(`
    *[_type == "companyInfo"][0]{
      name,
      description,
      locations[]{
        name,
        address,
        coordinates
      },
      culture[]{
        title,
        description,
        image
      }
    }
  `);
}
