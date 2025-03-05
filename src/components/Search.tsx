import { useState, useEffect } from "react";
import Fuse from "fuse.js";

// 🔹 記事データの型を定義
interface Article {
  _id: string;
  title: string;
  body: string;
}

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
      console.log("✅ JSON パース前:", jsonData);
      const parsedData: Article[] = JSON.parse(jsonData);
      console.log("✅ JSON パース成功:", parsedData);
      setArticles(parsedData);
      setResults(parsedData);
    } catch (error) {
      console.error("❌ JSON パースエラー:", error, "\n--- JSON Data ---\n", jsonData);
    }
  }, []);

  // 🔹 Fuse.js 設定
  const fuse = new Fuse(articles, { 
    keys: [
      { name: "title", weight: 2 }, 
      { name: "body", weight: 1 }
    ], 
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
      console.log("🔍 検索結果: 全件表示 (検索ワードなし)");
      return;
    }

    const searchResults = fuse.search(searchQuery).map(res => res.item);
    console.log("🔍 検索結果:", searchResults.length > 0 ? searchResults : "⚠️ ヒットなし");

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
            <li key={post._id}>
              <a href={`/blog/${post._id}`} target="_blank" rel="noopener noreferrer">
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