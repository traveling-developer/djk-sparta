/**
 * ---------------------------------------------------------------------------------
 * This file has been generated by Sanity TypeGen.
 * Command: `sanity typegen generate`
 *
 * Any modifications made directly to this file will be overwritten the next time
 * the TypeScript definitions are generated. Please make changes to the Sanity
 * schema definitions and/or GROQ queries if you need to update these types.
 *
 * For more information on how to use Sanity TypeGen, visit the official documentation:
 * https://www.sanity.io/docs/sanity-typegen
 * ---------------------------------------------------------------------------------
 */

// Source: schema.json
export type SanityImagePaletteSwatch = {
  _type: "sanity.imagePaletteSwatch";
  background?: string;
  foreground?: string;
  population?: number;
  title?: string;
};

export type SanityImagePalette = {
  _type: "sanity.imagePalette";
  darkMuted?: SanityImagePaletteSwatch;
  lightVibrant?: SanityImagePaletteSwatch;
  darkVibrant?: SanityImagePaletteSwatch;
  vibrant?: SanityImagePaletteSwatch;
  dominant?: SanityImagePaletteSwatch;
  lightMuted?: SanityImagePaletteSwatch;
  muted?: SanityImagePaletteSwatch;
};

export type SanityImageDimensions = {
  _type: "sanity.imageDimensions";
  height?: number;
  width?: number;
  aspectRatio?: number;
};

export type SanityImageHotspot = {
  _type: "sanity.imageHotspot";
  x?: number;
  y?: number;
  height?: number;
  width?: number;
};

export type SanityImageCrop = {
  _type: "sanity.imageCrop";
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export type SanityFileAsset = {
  _id: string;
  _type: "sanity.fileAsset";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  originalFilename?: string;
  label?: string;
  title?: string;
  description?: string;
  altText?: string;
  sha1hash?: string;
  extension?: string;
  mimeType?: string;
  size?: number;
  assetId?: string;
  uploadId?: string;
  path?: string;
  url?: string;
  source?: SanityAssetSourceData;
};

export type SanityImageAsset = {
  _id: string;
  _type: "sanity.imageAsset";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  originalFilename?: string;
  label?: string;
  title?: string;
  description?: string;
  altText?: string;
  sha1hash?: string;
  extension?: string;
  mimeType?: string;
  size?: number;
  assetId?: string;
  uploadId?: string;
  path?: string;
  url?: string;
  metadata?: SanityImageMetadata;
  source?: SanityAssetSourceData;
};

export type SanityImageMetadata = {
  _type: "sanity.imageMetadata";
  location?: Geopoint;
  dimensions?: SanityImageDimensions;
  palette?: SanityImagePalette;
  lqip?: string;
  blurHash?: string;
  hasAlpha?: boolean;
  isOpaque?: boolean;
};

export type Geopoint = {
  _type: "geopoint";
  lat?: number;
  lng?: number;
  alt?: number;
};

export type Slug = {
  _type: "slug";
  current?: string;
  source?: string;
};

export type SanityAssetSourceData = {
  _type: "sanity.assetSourceData";
  name?: string;
  id?: string;
  url?: string;
};

export type News = {
  _id: string;
  _type: "news";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  title?: string;
  content?: string;
  category?: "general" | "soccer" | "health-sport" | "indiaca" | "tennis" | "table-tennis";
  releaseDate?: string;
};

export type SoccerTeam = {
  _id: string;
  _type: "soccerTeam";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  name?: string;
  trainerName?: string;
  trainerMail?: string;
  trainingLocation?: string;
  trainingTimes?: string;
};

export type AllSanitySchemaTypes = SanityImagePaletteSwatch | SanityImagePalette | SanityImageDimensions | SanityImageHotspot | SanityImageCrop | SanityFileAsset | SanityImageAsset | SanityImageMetadata | Geopoint | Slug | SanityAssetSourceData | News | SoccerTeam;
export declare const internalGroqTypeReferenceTo: unique symbol;
// Source: ../website/src/lib/news.ts
// Variable: LATEST_NEWS
// Query: *[_type == "news"] | order(releaseDate desc) [0...6]
export type LATEST_NEWSResult = Array<{
  _id: string;
  _type: "news";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  title?: string;
  content?: string;
  category?: "general" | "health-sport" | "indiaca" | "soccer" | "table-tennis" | "tennis";
  releaseDate?: string;
}>;
// Variable: LATEST_TABLE_TENNIS_NEWS
// Query: *[_type == "news" && category == "table-tennis"] | order(releaseDate desc) [0...6]
export type LATEST_TABLE_TENNIS_NEWSResult = Array<{
  _id: string;
  _type: "news";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  title?: string;
  content?: string;
  category?: "general" | "health-sport" | "indiaca" | "soccer" | "table-tennis" | "tennis";
  releaseDate?: string;
}>;
// Variable: NEWS
// Query: *[_type == "news"] | order(releaseDate desc)
export type NEWSResult = Array<{
  _id: string;
  _type: "news";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  title?: string;
  content?: string;
  category?: "general" | "health-sport" | "indiaca" | "soccer" | "table-tennis" | "tennis";
  releaseDate?: string;
}>;

// Source: ../website/src/lib/soccer.ts
// Variable: SOCCER_TEAMS
// Query: *[_type == "soccerTeam"]
export type SOCCER_TEAMSResult = Array<{
  _id: string;
  _type: "soccerTeam";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  name?: string;
  trainerName?: string;
  trainerMail?: string;
  trainingLocation?: string;
  trainingTimes?: string;
}>;

// Query TypeMap
import "@sanity/client";
declare module "@sanity/client" {
  interface SanityQueries {
    "*[_type == \"news\"] | order(releaseDate desc) [0...6]": LATEST_NEWSResult;
    "*[_type == \"news\" && category == \"table-tennis\"] | order(releaseDate desc) [0...6]": LATEST_TABLE_TENNIS_NEWSResult;
    "*[_type == \"news\"] | order(releaseDate desc)": NEWSResult;
    "*[_type == \"soccerTeam\"]": SOCCER_TEAMSResult;
  }
}
