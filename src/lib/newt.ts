import { createClient } from "newt-client-js";

export const newtClient = createClient({
  spaceUid: import.meta.env.NEWT_SPACE_UID,
  token: import.meta.env.NEWT_API_TOKEN,
  apiType: "cdn",
});

// ✅ HTMLタグを削除する関数をエクスポート
export function stripTags(html: string): string {
  return html.replace(/<\/?[^>]+(>|$)/g, "");
}

// ✅ 記事の型を定義
export interface Article {
  _id: string;
  _sys: {
    createdAt: string;
  };
  title: string;
  slug: string;
  body: string; // ✅ HTMLタグを削除済みの文字列
  meta?: {
    description: string;
  };
  coverImage?: {
    src: string;
    altText?: string;
    width: number;
    height: number;
  };
}

// ✅ 記事一覧を取得する関数
export const getArticles = async (): Promise<Article[]> => {
  try {
    const res = await newtClient.getContents({
      appUid: import.meta.env.NEWT_APP_UID,
      modelUid: "article",
      query: { limit: 10, order: ["-createdAt"] },
    });

    console.log("🚀 Newt API Response (Articles):", res.items);

    // ✅ `body` の HTMLタグを削除
    const items: Article[] = res.items.map((article) => ({
      ...article,
      body: article.body ? stripTags(article.body) : "", // 🔹 HTMLタグを削除
    }));

    return items;
  } catch (error) {
    console.error("❌ Newt API から記事の取得に失敗:", error);
    return [];
  }
};

// ✅ About ページの型を定義
export interface About {
  _id: string;
  title: string; // 挨拶
  mongon: string; // 自己紹介の本体 (HTMLとして保存される可能性あり)
}

// ✅ About データを取得する関数
export const getAbout = async (): Promise<About | null> => {
  try {
    console.log("🚀 Newt API に `about` のデータをリクエスト中...");
    const res = await newtClient.getContents({
      appUid: import.meta.env.NEWT_APP_UID, // ✅ `blog` アプリを指定
      modelUid: "about", // ✅ `about` モデルを指定
      query: { limit: 1 },
    });

    console.log("✅ Newt API Response (About):", res);

    if (!res.items.length) {
      console.warn("⚠️ `about` のデータが見つかりません！");
      return null;
    }

    return res.items[0] as About;
  } catch (error) {
    console.error("❌ Newt API から `about` データの取得に失敗:", error);
    return null;
  }
};

// ✅ タグの型を定義
export interface Tag {
  _id: string;
  name: string;
  slug: string;
}

// ✅ タグ一覧を取得する関数
export const getTags = async (): Promise<Tag[]> => {
  try {
    console.log("🚀 Newt API に `tags` のデータをリクエスト中...");
    const res = await newtClient.getContents({
      appUid: import.meta.env.NEWT_APP_UID, // ✅ `appUid` を適用
      modelUid: "tags", // ✅ `tags` モデルを指定
      query: { limit: 100 }, // 最大100個取得
    });

    console.log("✅ Newt API Response (Tags):", res);

    return res.items.map(tag => ({
      _id: tag._id,
      name: tag.name ?? "No Name",
      slug: tag.slug ?? "unknown" // ✅ `slug` のフォールバック処理
    })) as Tag[];
  } catch (error) {
    console.error("❌ Newt API から `tags` データの取得に失敗:", error);
    return [];
  }
};

// ✅ タグごとの記事を取得する関数
export const getArticlesByTag = async (tagSlug: string): Promise<{ tag: Tag | null, articles: Article[] }> => {
  try {
    console.log(`🚀 Newt API に「${tagSlug}」の投稿をリクエスト中...`);
    const tagRes = await newtClient.getContents({
      appUid: import.meta.env.NEWT_APP_UID,
      modelUid: "tags",
      query: { slug: tagSlug },
    });

    if (!tagRes.items.length) {
      return { tag: null, articles: [] };
    }

    const tag = tagRes.items[0];

    const articlesRes = await newtClient.getContents<Article>({
      appUid: import.meta.env.NEWT_APP_UID,
      modelUid: "article",
      query: { "tags": tag._id, limit: 10 },
    });

    return { tag, articles: articlesRes.items };
  } catch (error) {
    console.error(`❌ Newt API から「${tagSlug}」の投稿取得に失敗:`, error);
    return { tag: null, articles: [] };
  }
};