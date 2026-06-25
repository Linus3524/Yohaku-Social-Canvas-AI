export interface Card {
  id: string;
  pageType: "Cover" | "Inner" | "Back Cover";
  title: string;
  subtitle: string;
  body: string;
  visualStyle: string;
  layoutDensity: number; // 1-5
  images: string[]; // Base64 or object URLs representing uploaded visuals for this card
  refImage: string | null; // Base64 or object URL of a design layout reference
  generatedTitle: string | null;
  generatedSubtitle: string | null;
  generatedBody: string | null;
  generatedImageUrl?: string | null;
  isGenerating: boolean;
  isGeneratingImage?: boolean;
  brandCis?: string; // Custom brand specifications / CIS
}

export interface Brief {
  topic: string;
  description: string;
  audience: string;
  wordCount: number;
  tone: "Professional" | "Educational" | "Storytelling";
  platform: "Instagram" | "Facebook" | "Threads" | "Xiaohongshu";
}

export interface CanvasSetting {
  ratio: "1080x1350" | "1080x1080" | "1242x1660" | "1080x1920" | "1200x630";
  dpi: 72 | 144 | 300;
}

export interface StyleConfig {
  bg: string;
  text: string;
  accent: string;
  fontFamily: string;
  borderStyle?: string;
  shadow?: string;
  accentBg?: string;
}

export const VISUAL_STYLES: Record<string, StyleConfig> = {
  "Apple": {
    bg: "#ffffff",
    text: "#1d1d1f",
    accent: "#0071e3",
    fontFamily: "font-sans",
    borderStyle: "border border-slate-100/80",
    shadow: "shadow-lg shadow-slate-100",
    accentBg: "#e8f2fc"
  },
  "Japanese Editorial": {
    bg: "#faf9f6",
    text: "#1c1c1c",
    accent: "#a3704c",
    fontFamily: "font-serif",
    borderStyle: "border border-amber-900/10",
    shadow: "shadow-sm",
    accentBg: "#f4ede6"
  },
  "MUJI": {
    bg: "#f5f3ef",
    text: "#3c3836",
    accent: "#7f2214",
    fontFamily: "font-sans",
    borderStyle: "border border-stone-200",
    shadow: "shadow-none",
    accentBg: "#eae5dd"
  },
  "Technology": {
    bg: "#0b0f19",
    text: "#f8fafc",
    accent: "#38bdf8",
    fontFamily: "font-mono",
    borderStyle: "border border-slate-800",
    shadow: "shadow-md shadow-sky-950/20",
    accentBg: "#0f2d4a"
  },
  "Luxury": {
    bg: "#111111",
    text: "#f5f5f7",
    accent: "#d4af37",
    fontFamily: "font-serif",
    borderStyle: "border border-yellow-500/20",
    shadow: "shadow-2xl shadow-black",
    accentBg: "#2d2613"
  },
  "Finance Report": {
    bg: "#f0f4f8",
    text: "#1e293b",
    accent: "#0f52ba",
    fontFamily: "font-sans",
    borderStyle: "border border-blue-100",
    shadow: "shadow-md",
    accentBg: "#dbeafe"
  },
  "Vintage": {
    bg: "#f2ece4",
    text: "#2c2c2c",
    accent: "#8c5c32",
    fontFamily: "font-serif",
    borderStyle: "border-2 border-stone-800",
    shadow: "shadow-sm",
    accentBg: "#e8ddcf"
  }
};
