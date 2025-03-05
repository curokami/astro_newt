import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { z } from "zod";

// ✅ 記事データの型を Zod で定義
const ArticleSchema = z.object({
  _id: z.string().min(1, "ID が空です"),  // `_id` は必須
  slug: z.string().min(1, "スラッグが空です"), // ✅ `slug` を追加
  title: z.string().min(1, "タイトルが空です"),
  body: z.string().min(1, "本文が空です"),
});

// ✅ 記事データの配列のスキーマ
const ArticlesSchema = z.array(ArticleSchema);

// ✅ TypeScript の型定義
interface Article extends z.infer<typeof ArticleSchema> {} // ✅ `slug` を含めた型

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const dataElement = document.getElementById("articles-data");
    if (!dataElement) {
      console.warn("⚠️ `articles-data` が見つかりませんでした。");
      return;
    }
  
    const jsonData = dataElement.textContent?.trim();
    console.log("🔍 `articles-data` の中身:", jsonData);
  
    if (!jsonData) {
      console.error("⚠️ `articles-data` の JSON が空です！");
      return;
    }
  
    try {
      const parsedData = JSON.parse(jsonData);
      console.log("✅ JSON パース成功:", parsedData);
  
      setArticles(parsedData);
      setResults(parsedData);
    } catch (error) {
      console.error("❌ JSON パースエラー:", error, "\n--- JSON Data ---\n", jsonData);
    }
  }, []);

  const fuse = new Fuse(articles, {
    keys: [{ name: "title", weight: 2 }, { name: "body", weight: 1 }],
    threshold: 0.3,
    minMatchCharLength: 2,
    ignoreLocation: true,
    findAllMatches: true,
    includeScore: true,
  });

  const handleSearch = (searchQuery: string) => {
    console.log("🔍 検索ワード:", searchQuery);

    if (!searchQuery.trim()) {
      setResults(articles);
      return;
    }

    const searchResults = fuse.search(searchQuery).map(res => res.item);
    setResults(searchResults);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="検索..."
        value={query}
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);
          handleSearch(value);
        }}
        className="search-box"
      />
      <button onClick={() => handleSearch(query)} className="search-button">検索</button>

      <ul>
        {results.length > 0 ? (
          results.map((post) => (
          <li key={post._id}> {/* ✅ `_id` をキーに設定 */}
          <a href={`/blog/${post.slug || post._id}`} target="_blank" rel="noopener noreferrer">
          {post.title}
        </a>
      </li>
    ))
  ) : (
    <p>⚠️ 検索結果が見つかりません。</p>
  )}
</ul>
    </div>
  );
}