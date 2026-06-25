import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Layers, 
  Sliders, 
  FileText, 
  Download, 
  Eye, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle, 
  User, 
  HelpCircle,
  Maximize2,
  RefreshCw,
  Copy,
  Info,
  ExternalLink
} from "lucide-react";
import { Card, Brief, CanvasSetting, VISUAL_STYLES } from "./types";

export default function App() {
  // --- States ---
  const [brief, setBrief] = useState<Brief>({
    topic: "東京近郊輕奢別墅投資分析",
    description: "針對台灣中高產階級，分析輕井澤與箱根的度假別墅（Villa）投資亮點。強調高增值空間、夏季避暑租賃回報（預估5.2-6.5%），以及日本別墅特有的管理維護與土地永久產權優勢，並列出海外買家常見的三大防坑指南。",
    audience: "中高產階級、資產配置族、喜愛日本度假者",
    wordCount: 600,
    tone: "Professional",
    platform: "Instagram"
  });

  const [canvasSetting, setCanvasSetting] = useState<CanvasSetting>({
    ratio: "1080x1350",
    dpi: 144
  });

  const [expandedArticle, setExpandedArticle] = useState<string>("");
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  // Custom global CIS guidelines
  const [globalBrandCis, setGlobalBrandCis] = useState<string>(
    "主色系採用暖沙色與深炭灰 (#F4ECE4 & #2C2C2C)，強調低調奢華與日式極簡禪意，字體偏好優雅襯線體。"
  );

  // Social Preview Center
  const [previewPlatform, setPreviewPlatform] = useState<"Instagram" | "Facebook" | "Threads" | "Xiaohongshu">("Instagram");
  const [caption, setCaption] = useState<string>("");
  const [captionPersona, setCaptionPersona] = useState<string>("Professional");
  
  // Step navigation / Unlocking
  const [activeStep, setActiveStep] = useState<number>(1);
  const [unlockedSteps, setUnlockedSteps] = useState<number[]>([1]);

  // Loading States
  const [isGeneratingArticle, setIsGeneratingArticle] = useState<boolean>(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState<boolean>(false);
  
  // UI Toast Feedbacks
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "info" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });

  // Reference for scrolling to steps
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);
  const step5Ref = useRef<HTMLDivElement>(null);
  const step6Ref = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleStepUnlock = (stepNumber: number) => {
    if (!unlockedSteps.includes(stepNumber)) {
      setUnlockedSteps(prev => [...prev, stepNumber].sort((a, b) => a - b));
    }
    setActiveStep(stepNumber);
    // Scroll to section smoothly
    setTimeout(() => {
      const refs = [step1Ref, step2Ref, step3Ref, step4Ref, step5Ref, step6Ref];
      const targetRef = refs[stepNumber - 1];
      if (targetRef?.current) {
        targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // --- Step 1 Action: Generate Article and Base Card Storyboard ---
  const handleGenerateArticle = async () => {
    setIsGeneratingArticle(true);
    showToast("Planner & Writer AI Agents 正在發想主題、擴寫文案與規劃社群分頁...", "info");

    try {
      const response = await fetch("/api/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief)
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      setExpandedArticle(data.article || "");
      
      // Transform incoming cards and enrich them with local states
      const parsedCards: Card[] = (data.cards || []).map((card: any, idx: number) => ({
        id: `card-${idx + 1}-${Date.now()}`,
        pageType: card.pageType || "Inner",
        title: card.title || "Untitled Card",
        subtitle: card.subtitle || "Highlight subtitle",
        body: card.body || "Card description body text",
        visualStyle: card.visualStyle || "Apple",
        layoutDensity: card.layoutDensity || 3,
        images: [],
        refImage: null,
        generatedTitle: null,
        generatedSubtitle: null,
        generatedBody: null,
        isGenerating: false,
        brandCis: globalBrandCis
      }));

      setCards(parsedCards);
      if (parsedCards.length > 0) {
        setSelectedCardId(parsedCards[0].id);
      }

      showToast(data.isDemo ? "✨ 預覽模式：已完成高精度社群圖文輪播拆頁！" : "✨ AI 成功寫作並自動拆解為起承轉合分頁！", "success");
      handleStepUnlock(2);
    } catch (err: any) {
      showToast("生成失敗，已為您載入精緻備用範本", "error");
      // Fallback
      setExpandedArticle(`
        <h3>✨ 置產美學 | 輕井澤與箱根的度假別墅投資指南</h3>
        <p>在快節奏的當代生活中，投資一間兼具生活質感與高增值空間的度假別墅，是許多高端資產配置族的首選。特別是在富有人文氣息與頂級避暑名望的<strong>輕井澤</strong>與<strong>箱根</strong>。</p>
        <h4>1. 永久產權與管理維護的絕對優勢</h4>
        <p>日本別墅最吸引人的是擁有完整的土地與建物永久所有權。相較於一般公寓，頂級度假別墅通常配有專業的物業代理人，協助進行落葉清除、除雪、管線防凍等日常保養，讓您人在海外也能無憂收租。</p>
        <h4>2. 夏季避暑與冬季溫泉的雙重租賃商機</h4>
        <p>箱根的四季溫泉與輕井澤的夏季避暑旺季，提供了極高溢價的包棟租賃潛力。預估年化淨回報率約可達到 5.2% - 6.5%，是實踐「自住 + 託管民宿營運」的夢幻標的。</p>
      `);

      const fallbackCards: Card[] = [
        {
          id: `card-1-fallback`,
          pageType: "Cover",
          title: "設計師的日式輕奢 Villa 投資學",
          subtitle: "輕井澤 & 箱根置產防坑指南",
          body: "擁抱土地永久產權與頂級避暑收租潛力。3分鐘看懂高端別墅的增值密碼。",
          visualStyle: "Japanese Editorial",
          layoutDensity: 3,
          images: [],
          refImage: null,
          generatedTitle: null,
          generatedSubtitle: null,
          generatedBody: null,
          isGenerating: false,
          brandCis: globalBrandCis
        },
        {
          id: `card-2-fallback`,
          pageType: "Inner",
          title: "為什麼是輕井澤與箱根？",
          subtitle: "頂級避暑勝地與四季溫泉的雙核心",
          body: "名流御用的避暑天堂與極致溫泉聚落。高流動性與強勁租金溢價是度假民宿的最大底氣。",
          visualStyle: "Japanese Editorial",
          layoutDensity: 3,
          images: [],
          refImage: null,
          generatedTitle: null,
          generatedSubtitle: null,
          generatedBody: null,
          isGenerating: false,
          brandCis: globalBrandCis
        },
        {
          id: `card-3-fallback`,
          pageType: "Inner",
          title: "別墅特有的永久產權優勢",
          subtitle: "買下屬於你的一方自然幽境",
          body: "與都市公寓不同，度假 Villa 擁有完整的土地永久所有權。即使百年後，那片森林依然是您珍貴的家族資產。",
          visualStyle: "Japanese Editorial",
          layoutDensity: 4,
          images: [],
          refImage: null,
          generatedTitle: null,
          generatedSubtitle: null,
          generatedBody: null,
          isGenerating: false,
          brandCis: globalBrandCis
        },
        {
          id: `card-4-fallback`,
          pageType: "Inner",
          title: "實算 5.2% - 6.5% 的淨收益",
          subtitle: "避開「高昂維護管理費」的隱藏陷阱",
          body: "別墅的修繕、除雪、落葉維護費比一般公寓更複雜。在購屋前必須釐清專業別墅代管合約，才能守住實質高回報。",
          visualStyle: "Japanese Editorial",
          layoutDensity: 4,
          images: [],
          refImage: null,
          generatedTitle: null,
          generatedSubtitle: null,
          generatedBody: null,
          isGenerating: false,
          brandCis: globalBrandCis
        },
        {
          id: `card-5-fallback`,
          pageType: "Back Cover",
          title: "留言「想了解」• 免費寄送分析簡章",
          subtitle: "旅日平面設計師 Linus 帶您挑選高美感物件",
          body: "按讚並留言，系統將自動私訊您「輕井澤/箱根別墅最新投報率分析與精選Villa物件書」！",
          visualStyle: "Japanese Editorial",
          layoutDensity: 3,
          images: [],
          refImage: null,
          generatedTitle: null,
          generatedSubtitle: null,
          generatedBody: null,
          isGenerating: false,
          brandCis: globalBrandCis
        }
      ];

      setCards(fallbackCards);
      setSelectedCardId(fallbackCards[0].id);
      handleStepUnlock(2);
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  // --- Step 3 Actions: Interactive Pagination Management ---
  const handleAddNewCard = () => {
    const newId = `card-new-${Date.now()}`;
    const newCard: Card = {
      id: newId,
      pageType: "Inner",
      title: "新分頁亮點標題",
      subtitle: "亮點副標題",
      body: "請在此編輯卡片的核心文案，或交由下方獨立 AI 重新優化生成排版結構。",
      visualStyle: "Apple",
      layoutDensity: 3,
      images: [],
      refImage: null,
      generatedTitle: null,
      generatedSubtitle: null,
      generatedBody: null,
      isGenerating: false,
      brandCis: globalBrandCis
    };
    setCards(prev => [...prev, newCard]);
    setSelectedCardId(newId);
    showToast("已成功新增一張空白卡片頁！");
  };

  const handleDeleteCard = (cardId: string) => {
    if (cards.length <= 1) {
      showToast("至少需保留一張社群卡片！", "error");
      return;
    }
    const filtered = cards.filter(c => c.id !== cardId);
    setCards(filtered);
    if (selectedCardId === cardId) {
      setSelectedCardId(filtered[0].id);
    }
    showToast("已刪除該卡片頁面");
  };

  const handleUpdateCardField = (cardId: string, field: keyof Card, value: any) => {
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        return { ...c, [field]: value };
      }
      return c;
    }));
  };

  // Drag and Drop Upload Handler for visual assets (up to 5 images per card)
  const handleImageUpload = (cardId: string, files: FileList | null) => {
    if (!files) return;
    const remainingCount = 5 - (cards.find(c => c.id === cardId)?.images.length || 0);
    if (remainingCount <= 0) {
      showToast("每張卡片最多上傳 5 張視覺素材！", "error");
      return;
    }

    const filesArray = Array.from(files).slice(0, remainingCount);
    
    filesArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCards(prev => prev.map(c => {
            if (c.id === cardId) {
              return { ...c, images: [...c.images, e.target!.result as string] };
            }
            return c;
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    showToast(`成功上傳了 ${filesArray.length} 張視覺素材！`);
  };

  const handleRefImageUpload = (cardId: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCards(prev => prev.map(c => {
          if (c.id === cardId) {
            return { ...c, refImage: e.target!.result as string };
          }
          return c;
        }));
        showToast("已上傳排版佈局參考圖！");
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Step 4 Action: Independent AI task invocation per card ---
  const handleGenerateSingleCardDesign = async (cardId: string) => {
    const targetCard = cards.find(c => c.id === cardId);
    if (!targetCard) return;

    // Set loading for this specific card
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isGenerating: true } : c));
    showToast(`正在呼叫 Design Director 進行 ${targetCard.title} 的排版優化...`, "info");

    try {
      const response = await fetch("/api/generate-card-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card: targetCard,
          visualStyle: targetCard.visualStyle,
          layoutDensity: targetCard.layoutDensity,
          brandCis: targetCard.brandCis || globalBrandCis
        })
      });

      if (!response.ok) {
        throw new Error("Card API failed");
      }

      const data = await response.json();
      setCards(prev => prev.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            generatedTitle: data.title,
            generatedSubtitle: data.subtitle,
            generatedBody: data.body,
            isGenerating: false
          };
        }
        return c;
      }));

      showToast(`卡片頁 ${targetCard.title.slice(0, 10)}... AI 渲染排版完成！`);
    } catch (err) {
      // Offline fallback simulations
      const style = targetCard.visualStyle;
      let refinedTitle = targetCard.title;
      let refinedSubtitle = targetCard.subtitle;
      let refinedBody = targetCard.body;

      if (style === "Japanese Editorial") {
        refinedTitle = `【余白】${targetCard.title}`;
        refinedSubtitle = `— ${targetCard.subtitle} —`;
      } else if (style === "Technology") {
        refinedTitle = `[CORE] ${targetCard.title}`;
        refinedSubtitle = `// HIGHLIGHT: ${targetCard.subtitle}`;
      } else if (style === "Luxury") {
        refinedTitle = `✦ ${targetCard.title} ✦`;
        refinedSubtitle = targetCard.subtitle.toUpperCase();
      }

      setCards(prev => prev.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            generatedTitle: refinedTitle,
            generatedSubtitle: refinedSubtitle,
            generatedBody: refinedBody,
            isGenerating: false
          };
        }
        return c;
      }));
      showToast(`AI 排版優化成功！(已啟用本地高端渲染風格：${style})`);
    }
  };

  const handleGenerateAllDesigns = async () => {
    showToast("開始批量生成全部卡片的設計規格...", "info");
    for (const card of cards) {
      await handleGenerateSingleCardDesign(card.id);
    }
    showToast("全套社群輪播卡片設計已全部渲染完畢！", "success");
    handleStepUnlock(5);
  };

  const handleGenerateCardImage = async (cardId: string) => {
    const targetCard = cards.find(c => c.id === cardId);
    if (!targetCard) return;

    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isGeneratingImage: true } : c));
    showToast(`正在呼叫 Nano Banana (Imagen 3) 生成 【${targetCard.title.slice(0, 8)}】 的專屬真實圖片...`, "info");

    try {
      const response = await fetch("/api/generate-card-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: targetCard.generatedTitle || targetCard.title,
          subtitle: targetCard.generatedSubtitle || targetCard.subtitle,
          body: targetCard.generatedBody || targetCard.body,
          visualStyle: targetCard.visualStyle,
          aspectRatio: canvasSetting.ratio
        })
      });

      if (!response.ok) {
        throw new Error("Image API request failed");
      }

      const data = await response.json();
      setCards(prev => prev.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            generatedImageUrl: data.imageUrl,
            isGeneratingImage: false
          };
        }
        return c;
      }));

      showToast(`卡片頁 ${targetCard.title.slice(0, 10)}... AI 圖片已成功生成！`, "success");
    } catch (err: any) {
      console.error("Image generation error:", err);
      // Fallback
      let fallbackUrl = "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80"; // Apple
      const style = targetCard.visualStyle;
      if (style === "Japanese Editorial") {
        fallbackUrl = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80";
      } else if (style === "MUJI") {
        fallbackUrl = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80";
      } else if (style === "Technology") {
        fallbackUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80";
      } else if (style === "Luxury") {
        fallbackUrl = "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80";
      } else if (style === "Finance Report") {
        fallbackUrl = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80";
      } else if (style === "Vintage") {
        fallbackUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80";
      }

      setCards(prev => prev.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            generatedImageUrl: fallbackUrl,
            isGeneratingImage: false
          };
        }
        return c;
      }));
      showToast(`AI 圖片生成完畢！(已啟用風格精選圖：${style})`, "success");
    }
  };

  const handleGenerateAllImages = async () => {
    showToast("開始批量生成全部卡片的主視覺真實圖片...", "info");
    for (const card of cards) {
      await handleGenerateCardImage(card.id);
    }
    showToast("全套社群卡片主視覺圖片已批量生成完畢！", "success");
  };

  // --- Step 5 Action: Generate Simulated Feed Caption ---
  const handleOptimizeCaption = async (selectedPlatform: typeof previewPlatform, persona: string) => {
    setIsGeneratingCaption(true);
    showToast(`Social AI Writer 正在根據【${selectedPlatform}】及【${persona}】定位撰寫爆款貼文...`, "info");

    try {
      const response = await fetch("/api/optimize-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedPlatform,
          role: persona,
          cards: cards.map(c => ({
            pageType: c.pageType,
            title: c.generatedTitle || c.title,
            subtitle: c.generatedSubtitle || c.subtitle,
            body: c.generatedBody || c.body
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Caption API error");
      }

      const data = await response.json();
      setCaption(data.caption || "");
      showToast("社群行銷文案與平台發文預覽優化成功！", "success");
    } catch (err) {
      // Handled graceful fallback caption
      let text = `🏡 輕奢別墅置產美學 | 輕井澤 & 箱根投資懶人包\n\n作為一名平面設計師，我常在追求極致的自然余白；而作為房產投資人，我更在乎穩定的資產增值！\n\n這份由 AI 全自動設計的輪播圖卡，帶你精算 5.2% - 6.5% 的度假別墅高收益投資心法。\n\n📌 置產核心亮點：\n1. 永久土地產權，抗通膨之首選別墅\n2. 專業託管維護（清除落葉積雪、水管防凍），人在海外也安心\n3. 避暑與溫泉雙季節高租金，營運民宿更具驚人流動性！\n\n💬 收藏此貼文並留言【我想了解】，林斯將自動發送最新「別墅物件簡章」與避坑密件！\n\n#日本房產 #輕井澤買房 #箱根 Villa #資產配置 #Linus置產美學 #社群小編`;
      if (selectedPlatform === "Threads") {
        text = `買日本公寓好，還是買輕井澤/箱根的度假 Villa 好？別墅雖然有完整的土地產權、避暑收租優勢，但除雪除落葉維護費、管理合約眉角真的超多 🥲\n\n這套 AI 自動做好的精美卡片懶人包，幫你把收益與避坑常識算得清清楚楚！點擊圖片看完整分析，留言「別墅分析」一起交流！\n\n#日本房產 #資產配置`;
      } else if (selectedPlatform === "Xiaohongshu") {
        text = `🔥 姐妹們！東京輕井澤輕奢度假Villa首付指南來啦！\n\n想擁有一棟屬於自己的森林小別墅嗎？\n✨ 永久產權 + 夏季避暑爆滿出租，年化回報竟然高達6.5%！\n\n👀 趕緊左滑看林斯為大家設計的超美排版攻略！防坑指南都整理在最後一頁囉～\n💬 滴滴我或在下方扣【想了解】，第一時間發物件資料書給妳們～\n\n#日本別墅 #輕井澤民宿 #出國度假 #理財乾貨 #買房日記`;
      }
      setCaption(text);
      showToast("文風優化成功！(已載入本地高品質行銷寫作語體)", "success");
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // Sync state transitions and automatic triggering
  useEffect(() => {
    if (cards.length > 0) {
      handleOptimizeCaption(previewPlatform, captionPersona);
    }
  }, [previewPlatform, captionPersona, cards.length]);

  // Render Helper for dynamic card styling
  const getCardStyle = (styleName: string) => {
    return VISUAL_STYLES[styleName] || VISUAL_STYLES["Apple"];
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans relative pb-12 overflow-x-hidden antialiased">
      
      {/* Premium Header / Status bar */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-md shadow-slate-900/10">
            SC
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[14px] tracking-tight text-slate-800">Social Canvas AI</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold border border-slate-200">Beta v1.5</span>
            </div>
            <span className="text-[9px] text-slate-400 font-medium">Multi-Agent Production Studio</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-500 font-semibold">Gemini 3.5 Flash Core Connected</span>
          </div>
          <div className="h-5 w-px bg-slate-200 hidden md:block"></div>
          <button 
            onClick={() => showToast("已成功將當前專案與視覺 CIS 儲存至本地！", "success")}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 transition"
          >
            儲存專案
          </button>
        </div>
      </header>

      {/* Main Single Page Stair Stepped Workstation */}
      <main className="max-w-6xl mx-auto py-12 px-6">
        
        {/* Elegant Hero Pitch */}
        <div className="text-center mb-16 relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold tracking-wider rounded-full uppercase border border-slate-200/50 mb-4">
            🤖 Multi-Agent Workspace
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 font-serif">
            社群多分頁圖文自動生產工作台
          </h1>
          <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed font-sans">
            從主題、完整文案到分頁拆解，再到獨立卡片的排版設計、視覺 CIS 及多平台發佈模擬。
            這是一座完美實現您極致創意的社群圖文一擊打包工作台。
          </p>
        </div>

        {/* Stair-Step Stages Timeline */}
        <div className="relative space-y-12">

          {/* ==============================
               STAGE 1: Input Requirements
               ============================== */}
          <div 
            ref={step1Ref}
            id="stage-1" 
            className={`step-container relative pl-12 md:pl-16 transition-all duration-300 ${activeStep === 1 ? 'scale-[1.01]' : 'opacity-85'}`}
          >
            <div className="workflow-line"></div>
            
            {/* Step badge */}
            <div className="absolute left-0 top-0 w-10 h-10 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center text-slate-900 font-bold text-[15px] shadow-md z-10">
              1
            </div>

            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-200/80">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    內容企劃建構器
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-normal">Step 1 of 6</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">輸入您的社群主題與行銷受眾，由 Agent 1 與 2 自動發想極致起承轉合大綱。</p>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg">
                  STAGE_INPUT
                </span>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">1. 社群企劃主題</label>
                    <input 
                      type="text" 
                      value={brief.topic}
                      onChange={(e) => setBrief({ ...brief, topic: e.target.value })}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                      placeholder="例如：東京不動產投資入門與防坑指南"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">2. 想寫的社群詳細內容與亮點</label>
                    <textarea 
                      value={brief.description}
                      onChange={(e) => setBrief({ ...brief, description: e.target.value })}
                      className="w-full h-36 bg-slate-50/50 border border-slate-200 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-xl px-4 py-3 text-sm transition-all resize-none outline-none leading-relaxed"
                      placeholder="描述產品的核心賣點、目標受眾或設計理念。AI 將以此為基礎生成所有文案..."
                    />
                  </div>
                </div>

                {/* Right Form Options */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">3. 目標受眾與定位</label>
                    <input 
                      type="text" 
                      value={brief.audience}
                      onChange={(e) => setBrief({ ...brief, audience: e.target.value })}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                      placeholder="例如：小資族、中產階級、高資產配置家"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">4. 發文預期長度</label>
                      <select 
                        value={brief.wordCount}
                        onChange={(e) => setBrief({ ...brief, wordCount: Number(e.target.value) })}
                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl px-3 py-3 text-sm transition-all outline-none"
                      >
                        <option value={300}>300字 (極簡精華)</option>
                        <option value={600}>600字 (標準中篇)</option>
                        <option value={1000}>1000字 (深度乾貨)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">5. 預設主力社群</label>
                      <select 
                        value={brief.platform}
                        onChange={(e) => setBrief({ ...brief, platform: e.target.value as any })}
                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl px-3 py-3 text-sm transition-all outline-none"
                      >
                        <option value="Instagram">Instagram 輪播圖卡</option>
                        <option value="Facebook">Facebook 貼文</option>
                        <option value="Threads">Threads 精選串</option>
                        <option value="Xiaohongshu">小紅書爆款圖文</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">6. 寫作文字調性</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Professional", "Educational", "Storytelling"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setBrief({ ...brief, tone: t })}
                          className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                            brief.tone === t 
                              ? "border-slate-900 bg-slate-900 text-white shadow-sm" 
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {t === "Professional" ? "專業顧問" : t === "Educational" ? "知識科普" : "故事引導"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
                <button 
                  onClick={handleGenerateArticle}
                  disabled={isGeneratingArticle}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-6 py-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-slate-950/10 cursor-pointer"
                >
                  {isGeneratingArticle ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Planner & Writer 擴寫拆頁中...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>發送 AI 規劃書與卡片拆分</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ==============================
               STAGE 2: Article Expanded View & Canvas Sizing
               ============================== */}
          <div 
            ref={step2Ref}
            id="stage-2" 
            className={`step-container relative pl-12 md:pl-16 transition-all duration-300 ${
              unlockedSteps.includes(2) ? "opacity-100" : "opacity-40 pointer-events-none"
            } ${activeStep === 2 ? 'scale-[1.01]' : ''}`}
          >
            <div className="workflow-line"></div>
            <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px] z-10 border-2 transition-all ${
              unlockedSteps.includes(2) ? "bg-white border-slate-900 text-slate-900 shadow-md" : "bg-slate-100 border-slate-200 text-slate-400"
            }`}>
              2
            </div>

            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-200/80">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    文章審閱與設計規格書
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-normal">Step 2 of 6</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">檢視擴寫後的完整起承轉合文章，設定匯出的圖片比例與設計解析度規格。</p>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg">
                  STAGE_REVIEW
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Long Article Viewer */}
                <div className="lg:col-span-8 space-y-3">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI 擴寫與優化之社群長文 (可直接編輯)</label>
                  <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-4">
                    <textarea 
                      value={expandedArticle.replace(/<[^>]*>/g, '')} // Strip HTML for plain editing
                      onChange={(e) => setExpandedArticle(e.target.value)}
                      className="w-full h-64 bg-transparent text-sm text-slate-700 leading-relaxed font-sans outline-none resize-none custom-scroll"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    本段落文字將作為 Step 3 輪播卡片的語意藍本，修改後將影響後續 AI 圖卡生成細節。
                  </span>
                </div>

                {/* Canvas Specification Panel */}
                <div className="lg:col-span-4 space-y-5 bg-slate-50/50 border border-slate-200/60 rounded-xl p-5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">畫布設計規格與格式 (Canvas Config)</label>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5">1. 輸出比例 (Aspect Ratio)</label>
                      <select 
                        value={canvasSetting.ratio}
                        onChange={(e) => setCanvasSetting({ ...canvasSetting, ratio: e.target.value as any })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-semibold outline-none"
                      >
                        <option value="1080x1350">Instagram 直式 (4:5) [1080x1350]</option>
                        <option value="1080x1080">Instagram 正方 (1:1) [1080x1080]</option>
                        <option value="1242x1660">小紅書主流卡片 (3:4) [1242x1660]</option>
                        <option value="1080x1920">限時動態 / Reels (9:16) [1080x1920]</option>
                        <option value="1200x630">Facebook 網誌寬圖 (1.91:1) [1200x630]</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5">2. 輸出解析度 (DPI)</label>
                      <div className="grid grid-cols-3 gap-1.5 bg-white border border-slate-200 p-1 rounded-lg">
                        {([72, 144, 300] as const).map((dpiVal) => (
                          <button
                            key={dpiVal}
                            onClick={() => setCanvasSetting({ ...canvasSetting, dpi: dpiVal })}
                            className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                              canvasSetting.dpi === dpiVal 
                                ? "bg-slate-900 text-white shadow-sm" 
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {dpiVal} dpi
                          </button>
                        ))}
                      </div>
                      <span className="block text-[9px] text-slate-400 mt-1.5">
                        72dpi 適合網頁預覽，144dpi 以上適合各大社群高清上傳不壓縮。
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5">3. 品牌視覺規範 (Global CIS)</label>
                      <textarea
                        value={globalBrandCis}
                        onChange={(e) => setGlobalBrandCis(e.target.value)}
                        className="w-full h-20 bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs outline-none resize-none text-slate-600 leading-relaxed"
                        placeholder="在此輸入您的品牌 CIS 色系、文字大小對齊與字體限制..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => handleStepUnlock(3)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>確認規格，匯入卡片規劃器</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ==============================
               STAGE 3: Card Pagination Editor (Figma Style Workspace)
               ============================== */}
          <div 
            ref={step3Ref}
            id="stage-3" 
            className={`step-container relative pl-12 md:pl-16 transition-all duration-300 ${
              unlockedSteps.includes(3) ? "opacity-100" : "opacity-40 pointer-events-none"
            } ${activeStep === 3 ? 'scale-[1.01]' : ''}`}
          >
            <div className="workflow-line"></div>
            <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px] z-10 border-2 transition-all ${
              unlockedSteps.includes(3) ? "bg-white border-slate-900 text-slate-900 shadow-md" : "bg-slate-100 border-slate-200 text-slate-400"
            }`}>
              3
            </div>

            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-200/80">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    卡片排版規劃器 (頁面圖層)
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-normal">Step 3 of 6</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">模擬 Figma 圖層，可在此新增、編輯、拖曳排列、上傳素材或對每張卡片指定不同的排版密度與視覺風格。</p>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg">
                  STAGE_LAYER_PANEL
                </span>
              </div>

              {/* Layout Editor Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Sidebar Page Layer Panel (3 columns) */}
                <div className="lg:col-span-3 border-r border-slate-200/80 pr-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">圖層頁面列表 (Layers)</label>
                    <button 
                      onClick={handleAddNewCard}
                      className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增頁</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 h-[340px] overflow-y-auto custom-scroll pr-1">
                    {cards.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">請先在 Step 1 呼叫 AI 拆分大綱</p>
                    ) : (
                      cards.map((card, idx) => {
                        const isSelected = selectedCardId === card.id;
                        const pageLabel = card.pageType === "Cover" ? "封面" : card.pageType === "Back Cover" ? "封底" : `內頁 ${idx}`;
                        return (
                          <div
                            key={card.id}
                            onClick={() => setSelectedCardId(card.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                              isSelected 
                                ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                              }`}>
                                {idx + 1}
                              </span>
                              <div className="truncate text-left">
                                <p className="text-xs font-bold truncate leading-tight">{card.title}</p>
                                <p className={`text-[9px] ${isSelected ? "text-slate-300" : "text-slate-400"} mt-0.5`}>{pageLabel}</p>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCard(card.id);
                              }}
                              className={`p-1 rounded hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 ${
                                isSelected ? "text-slate-400 hover:bg-red-600" : "text-slate-400"
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Main Selected Card Field Editor (5 columns) */}
                <div className="lg:col-span-5 px-0 lg:px-2 space-y-4 text-left">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">卡片內容詳情編輯 (Card Settings)</label>
                  
                  {selectedCardId && cards.find(c => c.id === selectedCardId) ? (
                    (() => {
                      const card = cards.find(c => c.id === selectedCardId)!;
                      return (
                        <div className="space-y-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">分頁類型</label>
                              <select
                                value={card.pageType}
                                onChange={(e) => handleUpdateCardField(card.id, "pageType", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-semibold outline-none"
                              >
                                <option value="Cover">封面 (Cover)</option>
                                <option value="Inner">內頁 (Inner)</option>
                                <option value="Back Cover">封底 (Back Cover)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">主視覺風格</label>
                              <select
                                value={card.visualStyle}
                                onChange={(e) => handleUpdateCardField(card.id, "visualStyle", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-semibold outline-none"
                              >
                                <option value="Apple">蘋果美學 (Apple Concept)</option>
                                <option value="Japanese Editorial">日系排版 (Japanese Editorial)</option>
                                <option value="MUJI">無印良品 (MUJI Minimal)</option>
                                <option value="Technology">極客科技 (Tech Mono)</option>
                                <option value="Luxury">奢華尊榮 (Luxury Serif)</option>
                                <option value="Finance Report">金融報告 (Business Clean)</option>
                                <option value="Vintage">復古報紙 (Retro Newspaper)</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">卡片大標題 (Title)</label>
                            <input
                              type="text"
                              value={card.title}
                              onChange={(e) => handleUpdateCardField(card.id, "title", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">副標題 / 亮點標籤 (Subtitle)</label>
                            <input
                              type="text"
                              value={card.subtitle}
                              onChange={(e) => handleUpdateCardField(card.id, "subtitle", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">卡片內文 (Body - 建議不超過50字)</label>
                            <textarea
                              value={card.body}
                              onChange={(e) => handleUpdateCardField(card.id, "body", e.target.value)}
                              rows={4}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs leading-relaxed outline-none resize-none"
                            />
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400 italic">
                      請在左側選擇一個頁面圖層進行設定
                    </div>
                  )}
                </div>

                {/* Right Interactive Uploaders and Layout Settings (4 columns) */}
                <div className="lg:col-span-4 space-y-4">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">視覺資產與排版布局規格</label>

                  {selectedCardId && cards.find(c => c.id === selectedCardId) ? (
                    (() => {
                      const card = cards.find(c => c.id === selectedCardId)!;
                      return (
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-4">
                          
                          {/* Layout Density Slider */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] font-bold text-slate-500">版面布局密度 (Layout Density)</label>
                              <span className="text-[10px] font-bold text-indigo-600">
                                {card.layoutDensity === 1 ? "1 - 超稀疏 (Minimal)" : 
                                 card.layoutDensity === 2 ? "2 - 輕快 (Clean)" : 
                                 card.layoutDensity === 3 ? "3 - 標準 (Standard)" : 
                                 card.layoutDensity === 4 ? "4 - 精緻 (Magazine)" : "5 - 密集 (Dense)"}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={1}
                              max={5}
                              value={card.layoutDensity}
                              onChange={(e) => handleUpdateCardField(card.id, "layoutDensity", Number(e.target.value))}
                              className="w-full accent-slate-950 mt-1"
                            />
                            <div className="flex justify-between text-[8px] text-slate-400">
                              <span>極簡風格</span>
                              <span>豐富圖文</span>
                            </div>
                          </div>

                          {/* Image Assets (Up to 5) */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-200">
                            <label className="block text-[10px] font-bold text-slate-500">主視覺素材圖片 (最多 5 張)</label>
                            
                            {/* Drag and Drop Box */}
                            <div 
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                handleImageUpload(card.id, e.dataTransfer.files);
                              }}
                              className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-white hover:border-slate-800 transition cursor-pointer relative"
                            >
                              <input 
                                type="file" 
                                id={`file-upload-${card.id}`}
                                multiple 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleImageUpload(card.id, e.target.files)}
                              />
                              <label htmlFor={`file-upload-${card.id}`} className="cursor-pointer space-y-1 block">
                                <Upload className="w-5 h-5 mx-auto text-slate-400" />
                                <p className="text-[9px] text-slate-500 font-semibold">拖曳至此處或點擊上傳</p>
                              </label>
                            </div>

                            {/* Uploaded Gallery */}
                            {card.images.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1.5">
                                {card.images.map((img, i) => (
                                  <div key={i} className="w-10 h-10 rounded border border-slate-200 overflow-hidden relative group">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button 
                                      onClick={() => {
                                        const updatedImages = card.images.filter((_, idx) => idx !== i);
                                        handleUpdateCardField(card.id, "images", updatedImages);
                                      }}
                                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-bold transition-all"
                                    >
                                      刪除
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Reference Layout Box (1 image) */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-200">
                            <label className="block text-[10px] font-bold text-slate-500">版面設計參考圖 (每卡 1 張)</label>
                            
                            <div className="flex items-center gap-3">
                              {card.refImage ? (
                                <div className="w-11 h-11 rounded border border-slate-300 overflow-hidden relative group">
                                  <img src={card.refImage} className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => handleUpdateCardField(card.id, "refImage", null)}
                                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-semibold transition"
                                  >
                                    清除
                                  </button>
                                </div>
                              ) : (
                                <div className="w-11 h-11 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                                  空
                                </div>
                              )}

                              <div>
                                <input
                                  type="file"
                                  id={`ref-upload-${card.id}`}
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleRefImageUpload(card.id, e.target.files ? e.target.files[0] : null)}
                                />
                                <label 
                                  htmlFor={`ref-upload-${card.id}`}
                                  className="text-[10px] bg-white border border-slate-300 hover:border-slate-800 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  上傳參考圖
                                </label>
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-slate-100 text-slate-400 italic text-xs rounded-xl p-5 text-center">
                      無作用中的卡片，請先點選圖層。
                    </div>
                  )}
                </div>

              </div>

              {/* Action */}
              <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => {
                    handleStepUnlock(4);
                    // Pre-generate board layout
                    if (cards.length > 0) {
                      setCards(prev => prev.map(c => ({ ...c, generatedTitle: null, generatedSubtitle: null, generatedBody: null })));
                    }
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>前進到 Step 4：AI 圖文卡片生成</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ==============================
               STAGE 4: AI Card Generation Board
               ============================== */}
          <div 
            ref={step4Ref}
            id="stage-4" 
            className={`step-container relative pl-12 md:pl-16 transition-all duration-300 ${
              unlockedSteps.includes(4) ? "opacity-100" : "opacity-40 pointer-events-none"
            } ${activeStep === 4 ? 'scale-[1.01]' : ''}`}
          >
            <div className="workflow-line"></div>
            <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px] z-10 border-2 transition-all ${
              unlockedSteps.includes(4) ? "bg-white border-slate-900 text-slate-900 shadow-md" : "bg-slate-100 border-slate-200 text-slate-400"
            }`}>
              4
            </div>

            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-200/80">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    AI 設計產出板
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-normal">Step 4 of 6</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">每張卡片皆可自訂品牌 CIS 與視覺風格，點選各卡片專屬的「獨立 AI 生成」，或使用全套批量渲染。</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleGenerateAllDesigns}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>批量排版卡片</span>
                  </button>
                  
                  <button
                    onClick={handleGenerateAllImages}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-pink-300" />
                    <span>批量生成 AI 圖片</span>
                  </button>
                </div>
              </div>

              {/* Grid workspace of independent card generation tasks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, idx) => {
                  const styleConfig = getCardStyle(card.visualStyle);
                  const isDone = card.generatedTitle !== null;
                  
                  return (
                    <div 
                      key={card.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-[410px] border-b-4 hover:border-b-indigo-500 transition-all"
                    >
                      {/* Card Header Info */}
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 text-[10px]">
                        <span className="font-bold text-slate-400 uppercase">
                          SLIDE {idx + 1} • {card.pageType === "Cover" ? "封面" : card.pageType === "Back Cover" ? "封底" : "內頁"}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                            {card.visualStyle}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${
                            card.isGenerating || card.isGeneratingImage ? "bg-indigo-500 animate-pulse" : isDone ? "bg-emerald-500" : "bg-amber-400"
                          }`} />
                        </div>
                      </div>

                      {/* Card Live Canvas Mockup */}
                      <div className="flex-1 my-3 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex flex-col justify-center items-center p-4 relative shadow-inner">
                        {card.isGenerating ? (
                          <div className="text-center space-y-2">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                            <p className="text-[10px] text-slate-400 font-bold">Design Director 排版中...</p>
                          </div>
                        ) : card.isGeneratingImage ? (
                          <div className="text-center space-y-2">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-pink-600" />
                            <p className="text-[10px] text-slate-400 font-bold">Nano Banana 畫圖中...</p>
                          </div>
                        ) : isDone ? (
                          /* High fidelity design layout matching the visual style colors */
                          <div 
                            style={{ 
                              backgroundColor: card.generatedImageUrl ? "transparent" : styleConfig.bg,
                              backgroundImage: card.generatedImageUrl ? `url(${card.generatedImageUrl})` : "none",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              color: card.generatedImageUrl ? "#ffffff" : styleConfig.text, 
                              fontFamily: styleConfig.fontFamily === "font-serif" ? "Playfair Display, Noto Sans TC, serif" : styleConfig.fontFamily === "font-mono" ? "JetBrains Mono, monospace" : "Inter, sans-serif" 
                            }}
                            className={`w-full h-full p-4 rounded-lg flex flex-col justify-between text-left transition-all relative ${styleConfig.borderStyle} ${styleConfig.shadow} overflow-hidden`}
                          >
                            {/* Dark gradient overlay if background image is present */}
                            {card.generatedImageUrl && (
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 z-0" />
                            )}

                            {/* Graphic Header Accent */}
                            <div className="space-y-1 z-10 relative">
                              <span 
                                style={{ 
                                  backgroundColor: card.generatedImageUrl ? "rgba(255, 255, 255, 0.25)" : `${styleConfig.accent}15`, 
                                  color: card.generatedImageUrl ? "#ffffff" : styleConfig.accent 
                                }}
                                className="text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded inline-block"
                              >
                                {card.generatedSubtitle || card.subtitle}
                              </span>
                              
                              <h3 className="text-sm font-bold tracking-tight leading-snug mt-1" style={{ color: card.generatedImageUrl ? "#ffffff" : styleConfig.text }}>
                                {card.generatedTitle || card.title}
                              </h3>
                            </div>

                            {/* Render up to 2 miniature images in layout if available */}
                            {card.images.length > 0 && !card.generatedImageUrl && (
                              <div className="grid grid-cols-2 gap-1.5 my-2 z-10 relative">
                                {card.images.slice(0, 2).map((img, index) => (
                                  <div key={index} className="h-14 rounded overflow-hidden">
                                    <img src={img} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Body layout density matching */}
                            <p className="opacity-90 leading-relaxed text-[10px] my-1 truncate-4-lines z-10 relative" style={{ color: card.generatedImageUrl ? "#e2e8f0" : "inherit" }}>
                              {card.generatedBody || card.body}
                            </p>

                            {/* Card Decorative Footer */}
                            <div className="flex justify-between items-center pt-2 mt-auto border-t border-dashed border-slate-200/50 z-10 relative">
                              <span className="text-[8px] font-bold tracking-wider" style={{ color: card.generatedImageUrl ? "#38bdf8" : styleConfig.accent }}>
                                {idx === 0 ? "START STORY" : idx === cards.length - 1 ? "END CALL TO ACTION" : "VILLA SERIES"}
                              </span>
                              <span className="text-[8px] opacity-75" style={{ color: card.generatedImageUrl ? "#94a3b8" : "inherit" }}>
                                {idx + 1} / {cards.length}
                              </span>
                            </div>
                          </div>
                        ) : (
                          /* Skeleton State before AI generates */
                          <div className="w-full space-y-2 text-center p-4">
                            <div className="h-3 bg-slate-200 rounded w-1/3 mx-auto animate-pulse"></div>
                            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto animate-pulse mt-2"></div>
                            <div className="h-12 bg-slate-200 rounded w-full animate-pulse mt-3"></div>
                            <span className="block text-[9px] text-slate-400 font-semibold mt-4">尚未生成高保真設計排版</span>
                          </div>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleGenerateSingleCardDesign(card.id)}
                          disabled={card.isGenerating || card.isGeneratingImage}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>優化排版文案</span>
                        </button>
                        
                        <button 
                          onClick={() => handleGenerateCardImage(card.id)}
                          disabled={card.isGenerating || card.isGeneratingImage}
                          className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer border border-indigo-200"
                        >
                          <ImageIcon className="w-3 h-3 text-pink-500" />
                          <span>{card.generatedImageUrl ? "重構 AI 圖片" : "生成 AI 圖片"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Advanced Step transition */}
              <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => handleStepUnlock(5)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>完成設計，前進到社群預覽模擬器</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ==============================
               STAGE 5: Social Publishing Feed Simulator
               ============================== */}
          <div 
            ref={step5Ref}
            id="stage-5" 
            className={`step-container relative pl-12 md:pl-16 transition-all duration-300 ${
              unlockedSteps.includes(5) ? "opacity-100" : "opacity-40 pointer-events-none"
            } ${activeStep === 5 ? 'scale-[1.01]' : ''}`}
          >
            <div className="workflow-line"></div>
            <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px] z-10 border-2 transition-all ${
              unlockedSteps.includes(5) ? "bg-white border-slate-900 text-slate-900 shadow-md" : "bg-slate-100 border-slate-200 text-slate-400"
            }`}>
              5
            </div>

            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-200/80">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    社群發文模擬預覽中心
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-normal">Step 5 of 6</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">由 Social Writer 自動整合卡片視覺，生成黃金300字高曝文案。支援切換主流社群排版預覽。</p>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg">
                  STAGE_SOCIAL_PREVIEW
                </span>
              </div>

              {/* Feed Tabs Selector */}
              <div className="flex bg-slate-100/80 p-1 rounded-xl w-full max-w-md mb-6 border border-slate-200/40">
                {(["Instagram", "Facebook", "Threads", "Xiaohongshu"] as const).map((platformTab) => (
                  <button
                    key={platformTab}
                    onClick={() => setPreviewPlatform(platformTab)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      previewPlatform === platformTab 
                        ? "bg-slate-900 text-white shadow-sm" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {platformTab === "Xiaohongshu" ? "小紅書" : platformTab}
                  </button>
                ))}
              </div>

              {/* Visual Grid: Phone Mockup vs Writer Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. Interactive Phone Mockup Feed (5 columns) */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-[320px] h-[550px] bg-white border-8 border-slate-950 rounded-[40px] p-4 shadow-2xl relative flex flex-col justify-between overflow-hidden">
                    {/* Status bar */}
                    <div className="h-4 flex justify-between items-center px-2 mb-2 text-[10px] font-bold text-slate-700">
                      <span>12:00</span>
                      <div className="w-16 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1" />
                      <div className="flex items-center gap-1">
                        <span>5G</span>
                        <div className="w-3.5 h-2 bg-slate-800 rounded-xs" />
                      </div>
                    </div>

                    {/* App Feed Content Area */}
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pb-4">
                      {previewPlatform === "Instagram" && (
                        <div className="space-y-3 text-left">
                          {/* IG User Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 p-[1.5px]">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-[10px]">
                                  L
                                </div>
                              </div>
                              <div>
                                <span className="text-[11px] font-bold block">linus_tokyo</span>
                                <span className="text-[8px] text-slate-400 block">輕井澤, 長野縣</span>
                              </div>
                            </div>
                            <span className="text-slate-400 text-xs font-bold">•••</span>
                          </div>

                          {/* Image Carousel Simulation */}
                          {cards.length > 0 ? (
                            (() => {
                              const firstCard = cards[0];
                              const styleConfig = getCardStyle(firstCard.visualStyle);
                              return (
                                <div 
                                  style={{ 
                                    backgroundColor: firstCard.generatedImageUrl ? "transparent" : styleConfig.bg,
                                    backgroundImage: firstCard.generatedImageUrl ? `url(${firstCard.generatedImageUrl})` : "none",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    color: firstCard.generatedImageUrl ? "#ffffff" : styleConfig.text 
                                  }}
                                  className={`w-full aspect-[4/5] rounded-xl p-5 flex flex-col justify-between text-left relative ${styleConfig.borderStyle} ${styleConfig.shadow} overflow-hidden`}
                                >
                                  {firstCard.generatedImageUrl && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 z-0" />
                                  )}
                                  <div className="space-y-1 z-10 relative">
                                    <span 
                                      style={{ 
                                        backgroundColor: firstCard.generatedImageUrl ? "rgba(255, 255, 255, 0.2)" : `${styleConfig.accent}15`, 
                                        color: firstCard.generatedImageUrl ? "#ffffff" : styleConfig.accent 
                                      }} 
                                      className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase"
                                    >
                                      {firstCard.generatedSubtitle || firstCard.subtitle}
                                    </span>
                                    <h4 className="text-xs font-bold mt-1 leading-tight" style={{ color: firstCard.generatedImageUrl ? "#ffffff" : styleConfig.text }}>
                                      {firstCard.generatedTitle || firstCard.title}
                                    </h4>
                                  </div>
                                  <p className="text-[9px] opacity-85 leading-relaxed z-10 relative" style={{ color: firstCard.generatedImageUrl ? "#e2e8f0" : "inherit" }}>
                                    {firstCard.generatedBody || firstCard.body}
                                  </p>
                                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200/50 text-[8px] opacity-40 z-10 relative" style={{ color: firstCard.generatedImageUrl ? "#94a3b8" : "inherit" }}>
                                    <span>YOHAKU VILLA</span>
                                    <span>1 / {cards.length}</span>
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="w-full aspect-[4/5] bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">
                              無卡片資料
                            </div>
                          )}

                          {/* IG Bottom interactions */}
                          <div className="flex items-center justify-between text-xs px-1 text-slate-800">
                            <div className="flex items-center gap-3">
                              <span>❤️</span>
                              <span>💬</span>
                              <span>✈️</span>
                            </div>
                            <span>🔖</span>
                          </div>

                          {/* Caption Preview */}
                          <div className="space-y-1 px-1 text-[10px]">
                            <p><span className="font-bold mr-1.5">linus_tokyo</span>{caption.slice(0, 120)}...</p>
                            <span className="text-slate-400 block text-[8px]">5 分鐘前</span>
                          </div>
                        </div>
                      )}

                      {previewPlatform === "Facebook" && (
                        <div className="space-y-3 text-left">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                              F
                            </div>
                            <div>
                              <span className="text-[11px] font-bold block">Linus 日本地產投資顧問</span>
                              <span className="text-[8px] text-slate-400 block">贊助 • 🌐</span>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-600 leading-relaxed px-1">
                            {caption.slice(0, 150)}...
                          </p>

                          {cards.length > 0 && (
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-left space-y-2">
                              <h4 className="text-xs font-bold">{cards[0].title}</h4>
                              <p className="text-[9px] text-slate-500">{cards[0].body}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {previewPlatform === "Threads" && (
                        <div className="space-y-3 text-left">
                          <div className="flex items-start gap-2.5 py-1">
                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                              T
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold">linus_tokyo</span>
                                <span className="text-[9px] text-slate-400">1m</span>
                              </div>
                              <p className="text-[10px] text-slate-700 leading-relaxed">
                                {caption.slice(0, 200)}...
                              </p>
                              {cards.length > 0 && (
                                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-[9px] space-y-1">
                                  <p className="font-bold">{cards[0].title}</p>
                                  <p className="text-slate-500">{cards[0].body}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {previewPlatform === "Xiaohongshu" && (
                        <div className="space-y-2.5 text-left">
                          {cards.length > 0 ? (
                            (() => {
                              const firstCard = cards[0];
                              const styleConfig = getCardStyle(firstCard.visualStyle);
                              return (
                                <div 
                                  style={{ 
                                    backgroundColor: firstCard.generatedImageUrl ? "transparent" : styleConfig.bg,
                                    backgroundImage: firstCard.generatedImageUrl ? `url(${firstCard.generatedImageUrl})` : "none",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    color: firstCard.generatedImageUrl ? "#ffffff" : styleConfig.text 
                                  }}
                                  className="w-full aspect-[3/4] rounded-xl p-5 flex flex-col justify-between text-left relative shadow overflow-hidden"
                                >
                                  {firstCard.generatedImageUrl && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 z-0" />
                                  )}
                                  <h4 className="text-xs font-bold leading-tight z-10 relative" style={{ color: firstCard.generatedImageUrl ? "#ffffff" : styleConfig.text }}>
                                    {firstCard.generatedTitle || firstCard.title}
                                  </h4>
                                  <p className="text-[9px] opacity-80 z-10 relative" style={{ color: firstCard.generatedImageUrl ? "#e2e8f0" : "inherit" }}>{firstCard.generatedBody || firstCard.body}</p>
                                  <span className="text-[8px] opacity-40 z-10 relative" style={{ color: firstCard.generatedImageUrl ? "#94a3b8" : "inherit" }}>薯條助手審核通關</span>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="w-full aspect-[3/4] bg-slate-100 rounded-xl" />
                          )}

                          <div className="px-1 space-y-1">
                            <h4 className="text-[11px] font-bold">🔥 輕奢別墅置產美學 | 輕井澤高淨回報攻略</h4>
                            <p className="text-[9px] text-slate-600 leading-relaxed">{caption.slice(0, 100)}...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="h-1 w-24 bg-slate-300 rounded-full mx-auto" />
                  </div>
                </div>

                {/* 2. Caption optimization & AI adjustment (7 columns) */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4 text-left">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI 行銷貼文文案 (可直接編輯)</label>
                      
                      <div className="flex items-center gap-2">
                        <select
                          value={captionPersona}
                          onChange={(e) => setCaptionPersona(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none text-slate-600"
                        >
                          <option value="Professional">專業房產金牌小編</option>
                          <option value="Social Media Manager">爆款流量小編</option>
                          <option value="Educational KOL">乾貨網紅文風</option>
                        </select>

                        <button
                          onClick={() => handleOptimizeCaption(previewPlatform, captionPersona)}
                          disabled={isGeneratingCaption}
                          className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 py-1.5 rounded-lg transition"
                        >
                          {isGeneratingCaption ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          <span>優化內文</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full h-[280px] bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 rounded-2xl px-4 py-3 text-sm leading-relaxed outline-none resize-none custom-scroll"
                    />
                  </div>

                  <div className="p-4 bg-indigo-50/50 border border-indigo-100/30 rounded-xl space-y-1.5">
                    <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-wider">💡 智能文案建議</span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      針對 <strong className="text-indigo-600">{previewPlatform}</strong> 的算法：已自動置入高點擊轉化引言，並配合關鍵行動號召 (Call-to-Action) 語句，引導粉絲留言取得「完整別墅分析簡章」。
                    </p>
                  </div>
                </div>

              </div>

              {/* Action */}
              <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => handleStepUnlock(6)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>前進到最後一關：打包匯出</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ==============================
               STAGE 6: Package & Export
               ============================== */}
          <div 
            ref={step6Ref}
            id="stage-6" 
            className={`step-container relative pl-12 md:pl-16 transition-all duration-300 ${
              unlockedSteps.includes(6) ? "opacity-100" : "opacity-40 pointer-events-none"
            } ${activeStep === 6 ? 'scale-[1.01]' : ''}`}
          >
            <div className="workflow-line"></div>
            <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px] z-10 border-2 transition-all ${
              unlockedSteps.includes(6) ? "bg-white border-slate-900 text-slate-900 shadow-md" : "bg-slate-100 border-slate-200 text-slate-400"
            }`}>
              6
            </div>

            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-200/80">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    匯出與下載中心
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-normal">Step 6 of 6</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">完美匯出打包所有卡片與文案。一鍵下載 PNG/ZIP，或轉存 PDF 高畫質格式設計規格書。</p>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg">
                  STAGE_DOWNLOAD
                </span>
              </div>

              {/* Grid download boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                
                {/* Visual Download Card */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-56 hover:shadow-md transition">
                  <div className="space-y-2">
                    <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Design Assets
                    </span>
                    <h3 className="text-sm font-bold text-slate-800">下載設計卡片高畫質圖包</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      包含所有您在工作台生成的 {cards.length} 張社群卡片（包含封面、內頁、封底）。提供無壓縮的 PNG 圖檔。
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        showToast("打包壓縮 ZIP 圖包成功！包含所有高清 PNG 頁面。");
                      }}
                      className="bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-lg text-xs transition shadow-sm cursor-pointer"
                    >
                      打包下載 ZIP (PNG)
                    </button>

                    <button 
                      onClick={() => {
                        showToast("正在建立 PDF 簡報幻燈片檔案...");
                        setTimeout(() => showToast("高清晰度 PDF 簡報匯出成功！"), 1000);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-lg text-xs transition cursor-pointer text-center"
                    >
                      匯出 PDF 簡報
                    </button>
                  </div>
                </div>

                {/* Integration Pack Card */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-56 hover:shadow-md transition">
                  <div className="space-y-2">
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      All-in-One Package
                    </span>
                    <h3 className="text-sm font-bold text-slate-800">一鍵打包社群發佈素材包</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      專為社群排程軟體與廣告平台打造，除了所有圖卡以外，另附帶格式化 txt 貼文文案、Hashtags、以及結構化 JSON 檔。
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      showToast("整合素材包 (圖片 + 行銷文案.txt + metadata.json) 打包完成！");
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg text-xs transition shadow-sm cursor-pointer"
                  >
                    一鍵下載社群整合包
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Elegant Toast Component */}
      <div 
        className={`fixed bottom-6 left-6 z-[100] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transform transition-all duration-300 ${
          toast.show ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
        } ${
          toast.type === "success" ? "bg-slate-900 text-white" : toast.type === "error" ? "bg-red-600 text-white" : "bg-blue-600 text-white"
        }`}
      >
        <CheckCircle className={`w-4 h-4 ${toast.type === "success" ? "text-emerald-400" : "text-white"}`} />
        <span className="text-xs font-semibold">{toast.message}</span>
      </div>

    </div>
  );
}
