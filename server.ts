import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to check if API key is set and not a placeholder
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Content Brief and Carousel Outline Generation
app.post("/api/generate-brief", async (req, res) => {
  try {
    const { topic, description, audience, wordCount, platform, tone } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Return high-fidelity mock fallback if API key is not set yet
      console.warn("GEMINI_API_KEY is not set or is placeholder. Using premium fallback simulation.");
      const mockArticle = `<h3>✨ 置產藝術 | ${topic} 深度解讀</h3>
<p>在資產配置的洪流中，選擇一處具有<strong>卓越生活機能與穩定租金回報</strong>的標的，是每位理性投資人的必修課題。特別是針對${audience || "海外買家"}，如何在這場遊戲中避開潛在的陷阱，顯得尤為關鍵。</p>
<p>我們將以${topic}為核心切入點，為您深入剖析其背後的市場邏輯，提供一份乾貨滿滿、最貼近真實數據的置產教戰守則。</p>
<h4>1. 車站徒步黃金5分鐘，保值流動性之王</h4>
<p>買房首重地點（Location），而日本物件的流動性生命線，就凝聚在<strong>「與捷運地鐵站的步行距離」</strong>。步行5分鐘內與15分鐘的租金抗跌性有著天壤之別。縮短通勤時間是現代租屋族願意支付溢價的核心理由。</p>
<h4>2. 淨投報率 vs 表面投報率：小心隱形規費吃掉利潤</h4>
<p>許多廣告打出6%以上的誘人高投報率，但實際扣除<strong>管理費（修繕積立金）、代管服務費（通常為租金的5%+稅）以及固定資產稅</strong>之後，淨收益可能僅剩4%左右。這也是投資人最常忽略的陷阱。</p>`;

      const mockCards = [
        {
          id: "card-1",
          pageType: "Cover",
          title: topic,
          subtitle: `為${audience || "精明投資客"}量身打造的防坑守則`,
          body: "車站步行黃金距離與隱形費用精算，3分鐘看懂東京房產增值密碼。",
          visualStyle: "Apple",
          layoutDensity: 3
        },
        {
          id: "card-2",
          pageType: "Inner",
          title: "步行 5 分鐘黃金法則",
          subtitle: "捷運站步行距離直接決定保值率",
          body: "在日本，徒步5分鐘與徒步15分鐘的抗跌性截然不同。黃金步行距離是吸引高質感租客的最強磁鐵。",
          visualStyle: "Apple",
          layoutDensity: 3
        },
        {
          id: "card-3",
          pageType: "Inner",
          title: "戳破表面高投報率",
          subtitle: "淨回報才是你口袋裡的真金白銀",
          body: "廣告常見的「表面投報率」往往未扣除每月管理費、修繕公積金及代管費。精算所有隱形成本，才能守住4.5%+的穩定利潤。",
          visualStyle: "Apple",
          layoutDensity: 4
        },
        {
          id: "card-4",
          pageType: "Inner",
          title: "新手三大避坑黃金指南",
          subtitle: "避開老舊木造與高空置率地段",
          body: "1. 避免1981年前的舊耐震法規建築。\n2. 慎選無管理員維護的孤兒公寓。\n3. 確認該區是否有穩定的大學或商務租屋人口支撐。",
          visualStyle: "Apple",
          layoutDensity: 4
        },
        {
          id: "card-5",
          pageType: "Back Cover",
          title: "立刻收藏 • 留言索取資料",
          subtitle: "歡迎私訊了解最新東京優質物件",
          body: "按讚並留言「想了解」，小編將自動發送最新新高円寺與杉並區極稀有1DK高投報物件簡章！",
          visualStyle: "Apple",
          layoutDensity: 3
        }
      ];

      return res.json({
        article: mockArticle,
        cards: mockCards,
        isDemo: true
      });
    }

    // Call real Gemini
    const systemPrompt = `You are an elite Social Media Content Director and Copywriter (社群營運總監與金牌小編). 
Your task is to take a raw theme / requirements and generate:
1. A fully expanded, cohesive, high-quality, professional article formatted in HTML with <h3>, <h4>, <p>, <strong> tags. Focus on practical insights and structured points.
2. An outline split into highly readable slides (representing a social media carousel, 起承轉合 structure) suitable for image cards.

Generate output matching the user's requirements exactly:
- Tone: ${tone}
- Word Count: ${wordCount}
- Target Platform: ${platform}
- Target Audience: ${audience}`;

    const userPrompt = `主題: ${topic}
詳細細節與特點: ${description}
預期字數: ${wordCount} 字

Please generate the expanded article and slice it into exactly 4 to 6 slides in a logical sequence (Cover, Inner pages, Back Cover).
Format the response as a strict JSON object with this schema:
{
  "article": "HTML formatted text representing the expanded long article...",
  "cards": [
    {
      "pageType": "Cover" | "Inner" | "Back Cover",
      "title": "Short catchy title (under 15 words) for this slide",
      "subtitle": "A sub-header or highlight tag for this slide",
      "body": "Concise text (1-3 key sentences, or bullet points) suitable for a graphic card",
      "visualStyle": "Apple" | "Japanese Editorial" | "MUJI" | "Technology",
      "layoutDensity": 3
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: systemPrompt },
        { text: userPrompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            article: {
              type: Type.STRING,
              description: "HTML formatted full article with <h3>, <h4>, <p>, <strong> tags."
            },
            cards: {
              type: Type.ARRAY,
              description: "An array of 4 to 6 storyboard slides sequentially mapped.",
              items: {
                type: Type.OBJECT,
                properties: {
                  pageType: { type: Type.STRING, description: "Cover, Inner, or Back Cover" },
                  title: { type: Type.STRING, description: "Slide Title" },
                  subtitle: { type: Type.STRING, description: "Slide Subtitle/Highlight" },
                  body: { type: Type.STRING, description: "Slide main text content" },
                  visualStyle: { type: Type.STRING, description: "Default visual style suggestions (e.g. Apple, MUJI, etc.)" },
                  layoutDensity: { type: Type.INTEGER, description: "1 to 5 index representing text density" }
                },
                required: ["pageType", "title", "subtitle", "body", "visualStyle", "layoutDensity"]
              }
            }
          },
          required: ["article", "cards"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json(data);

  } catch (error: any) {
    console.error("Error in generate-brief endpoint:", error);
    return res.status(500).json({ error: error.message || "Gemini processing failed" });
  }
});

// 2. Card AI Task Invocation (Independent card-by-card layout content generation)
app.post("/api/generate-card-content", async (req, res) => {
  try {
    const { card, visualStyle, layoutDensity, brandCis } = req.body;

    if (!card) {
      return res.status(400).json({ error: "Card data is required" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Simulate visual refinement fallback
      console.warn("GEMINI_API_KEY is not set. Using visual layout card simulation.");
      
      // Let's create an elegant list or refined text based on style and density
      let refinedTitle = card.title;
      let refinedSubtitle = card.subtitle;
      let refinedBody = card.body;

      if (visualStyle === "Japanese Editorial") {
        refinedTitle = `【余白】${card.title}`;
        refinedSubtitle = `— ${card.subtitle} —`;
      } else if (visualStyle === "Technology") {
        refinedTitle = `[CORE] ${card.title}`;
        refinedSubtitle = `// SYSTEM_HIGHLIGHT: ${card.subtitle}`;
      } else if (visualStyle === "Luxury") {
        refinedTitle = `✦ ${card.title} ✦`;
        refinedSubtitle = card.subtitle ? card.subtitle.toUpperCase() : "";
      }

      // Density-based modifications
      if (layoutDensity >= 4) {
        refinedBody = `• 精準定位：${card.title}\n• 深度分析：${card.subtitle}\n• 核心數據：${card.body.slice(0, 45)}...`;
      }

      return res.json({
        title: refinedTitle,
        subtitle: refinedSubtitle,
        body: refinedBody,
        isDemo: true
      });
    }

    const systemPrompt = `You are a Layout Typographer and UI/UX Designer specialized in typography layout guidelines.
Given card text content, visual style, and layout density, optimize the copy to fit this layout perfectly.
- Visual Style: ${visualStyle}
- Layout Density: ${layoutDensity}/5 (1 is super clean minimal, 5 is dense magazine grid style)
- Brand Guidelines / CIS Context: ${brandCis || "None"}

Please refine and return:
1. An polished catchy title (optimized for the chosen style, adding symbols or brackets if characteristic).
2. A refined subtitle (perfectly contrasting the title).
3. A body paragraph formatted nicely (could use bullets or short phrases depending on density).`;

    const userPrompt = `Original Card data:
Title: ${card.title}
Subtitle: ${card.subtitle}
Body: ${card.body}

Format output as a strict JSON object with this schema:
{
  "title": "Refined Title...",
  "subtitle": "Refined Subtitle...",
  "body": "Refined body paragraph or bullet points..."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: systemPrompt },
        { text: userPrompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            body: { type: Type.STRING }
          },
          required: ["title", "subtitle", "body"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json(data);

  } catch (error: any) {
    console.error("Error in generate-card-content endpoint:", error);
    return res.status(500).json({ error: error.message || "Failed to generate card content" });
  }
});

// 2.5. Card AI Image Generation (Calls Imagen 3 / Nano Banana)
app.post("/api/generate-card-image", async (req, res) => {
  try {
    const { title, subtitle, body, visualStyle, aspectRatio } = req.body;

    const ai = getGeminiClient();

    // Mapping custom resolution ratio to Imagen aspect ratio
    let ratioStr = "1:1";
    if (aspectRatio === "1080x1350") ratioStr = "3:4";
    else if (aspectRatio === "1080x1080") ratioStr = "1:1";
    else if (aspectRatio === "1242x1660") ratioStr = "3:4";
    else if (aspectRatio === "1080x1920") ratioStr = "9:16";
    else if (aspectRatio === "1200x630") ratioStr = "16:9";

    // Build highly aesthetic descriptive prompt based on visual style & card text
    let styleDescription = "Minimalist, clean concept illustration, ample negative space, professional, highly artistic";
    if (visualStyle === "Apple") {
      styleDescription = "Apple concept aesthetic, ultra-clean white sleek background, smooth glassmorphism geometry, premium elegant studio lighting, minimalist 3D render, tech product presentation style, high quality";
    } else if (visualStyle === "Japanese Editorial") {
      styleDescription = "Serene Japanese editorial photography, warm soft cedarwood textures, elegant wabi-sabi lifestyle scene, beautiful sunlight casting natural leaf shadows, cinematic, atmospheric, high-end design catalog";
    } else if (visualStyle === "MUJI") {
      styleDescription = "Muji-style minimal lifestyle photo, warm beige and linen fabrics, raw ecological objects, soft neutral morning daylight, clean organic minimalist, simple wooden furniture, zen atmosphere";
    } else if (visualStyle === "Technology") {
      styleDescription = "High-tech geek futuristic digital artwork, neon glowing blue and cyan cyber grids, glowing code streams, minimalist data flows, dark titanium background, professional developer vibe";
    } else if (visualStyle === "Luxury") {
      styleDescription = "Super luxurious premium editorial shot, rich golden marble veins, sleek dark charcoal velvet background, warm luxury hotel ambient lighting, 3D golden ornaments, refined high-end jewelry catalog look";
    } else if (visualStyle === "Finance Report") {
      styleDescription = "Corporate clean flat modern graphic vector, elegant blue and slate finance columns, professional business illustration, simple data charts background, tidy sleek layout";
    } else if (visualStyle === "Vintage") {
      styleDescription = "Nostalgic vintage sepia photograph, classic printed newspaper grain texture, retro typewriter ink stamp, aged yellowed parchment backdrop, classic historical film grain style";
    }

    const finalPrompt = `Create a premium, professional background image or illustration for a social media card. 
Subject/Theme: ${title} - ${subtitle || ""}
Description: ${body || ""}
Style: ${styleDescription}
Rules: ABSOLUTELY NO text, NO labels, NO typography in the image itself. Pure background visual art. Beautiful, photorealistic, premium layout.`;

    if (!ai) {
      // High-quality deterministic stock image mappings when API key is missing
      console.warn("GEMINI_API_KEY is not set. Providing high-fidelity mock image based on style.");
      let fallbackUrl = "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80"; // Apple Default

      if (visualStyle === "Japanese Editorial") {
        fallbackUrl = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80"; // Kyoto Autumn Temple
      } else if (visualStyle === "MUJI") {
        fallbackUrl = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"; // Clean ceramic / tea
      } else if (visualStyle === "Technology") {
        fallbackUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"; // Neon chip circuit
      } else if (visualStyle === "Luxury") {
        fallbackUrl = "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80"; // Golden marble / hotel
      } else if (visualStyle === "Finance Report") {
        fallbackUrl = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80"; // Corporate meeting table
      } else if (visualStyle === "Vintage") {
        fallbackUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80"; // Antique typewriter
      }

      return res.json({
        imageUrl: fallbackUrl,
        promptUsed: finalPrompt,
        isDemo: true
      });
    }

    // Call real Imagen 3 API (Nano Banana)
    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: ratioStr as any
      }
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64Bytes = response.generatedImages[0].image.imageBytes;
      const dataUrl = `data:image/jpeg;base64,${base64Bytes}`;
      return res.json({
        imageUrl: dataUrl,
        promptUsed: finalPrompt,
        isDemo: false
      });
    } else {
      throw new Error("No image generated by Imagen API");
    }

  } catch (error: any) {
    console.error("Error in generate-card-image:", error);
    return res.status(500).json({ error: error.message || "Failed to generate image via Imagen" });
  }
});

// 3. Social Media Caption Optimizer / Summarizer
app.post("/api/optimize-caption", async (req, res) => {
  try {
    const { platform, role, cards } = req.body;

    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({ error: "Cards data is required" });
    }

    const ai = getGeminiClient();

    const summaryText = cards.map((c, i) => `Slide ${i+1} (${c.pageType}): ${c.title} - ${c.subtitle} - ${c.body}`).join("\n");

    if (!ai) {
      console.warn("GEMINI_API_KEY is missing. Using pre-written optimal social caption.");
      
      let caption = `🏡 東京置產美學 | 穩健投報率與防坑指南

很多人問我，在東京買房到底要注意什麼？
作為房產投資顧問與美學設計師，我最看重的是「生活機能與保值力」；而最容易踩坑的，是忽略了「實收利潤」！

今天這份精美懶人包，特別推薦交通與機能都無懈可擊的【新高円寺】！

📌 置產三大核心避坑重點：
1️⃣ 與地鐵站的「步行距離」是保值生命的黃金線（首選徒步5分鐘內）
2️⃣ 表面高投報率有陷阱，管理費、修繕金、代管規費等隱形成本必須算個明白
3️⃣ 委託信任的在地團隊進行物業代管，能大幅免除空置風險

💬 歡迎按讚收藏！在下方留言或私訊【我想了解】，我會直接把精選的東京置產簡章、最新物件投報評估報告直接私訊發送給您！

#東京置產 #日本買房 #新高円寺 #海外投資 #被動收入 #Linus置產筆記`;

      if (platform === "Threads") {
        caption = `東京置產真的是一門學問。很多人只看表面投報率就衝動下單，結果被管理費、修繕金、物業代管規費等隱形支出吃掉大部分收益... 🥲

這份懶人包是我整理的日本置產防坑指南，以東京【新高円寺】機能套房為例，帶你一步步算清楚什麼才是真正的「口袋淨回報」！

歡迎留言「想了解」交流討論 👇

#日本買房 #東京投資 #被動收入`;
      } else if (platform === "Xiaohongshu") {
        caption = `🔥 姐妹們，東京買房避坑看這一篇就夠了！

首買東京房地產怎麼選？今天Linus就帶大家看看富有人文氣息、交通神級便利的【東京杉並區新高円寺】！

✨ 精緻女孩的理財美學 ✨
👉 車站步行5分鐘內才是王道！流動性最好，根本不怕租不出去！
👉 別被廣告上6%以上的「表面回報率」騙啦！扣掉修繕積立金和物業代管費，淨回報才是真的！
👉 選擇對的公寓等級，折舊率低，資產才更保值！

滴滴我！或者在評論區留言【想了解】，林斯立馬把最新的高投報精選簡章發給你～ 

#東京房產 #留學租房 #東京買房 #買房防坑 #理財乾貨 #海外置產`;
      }

      return res.json({ caption, isDemo: true });
    }

    const systemInstruction = `You are an expert Social Media Manager and viral copywriter (爆款社群小編).
Create a highly compelling, optimized social media caption for the platform: ${platform}.
Write in the persona of a: ${role || "Professional Broker / Consultant"}.
Keep the caption under 300 words. Highlight key takeaways from the slides provided. Use attractive emojis, clear bullet points, call to actions (e.g. comment "想了解" to get brochures), and platform-specific formatting and hashtags.`;

    const userPrompt = `Here is the visual slide storyboard data:
${summaryText}

Please generate an engaging caption tailored to ${platform}. Output only a JSON response with schema:
{
  "caption": "The written caption with emojis, spaces, and hashtags..."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: systemInstruction },
        { text: userPrompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: { type: Type.STRING }
          },
          required: ["caption"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json(data);

  } catch (error: any) {
    console.error("Error in optimize-caption endpoint:", error);
    return res.status(500).json({ error: error.message || "Failed to optimize caption" });
  }
});

// Vite server middleware setup for dev, static serving for production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
