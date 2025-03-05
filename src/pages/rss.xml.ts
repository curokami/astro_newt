import { getCollection } from "astro:content";
import rss from "@astro/rss";

export async function GET() {
  const articles = await getCollection("blog"); // 記事を取得（適宜変更）
  
  return rss({
    title: "DevRun Blog RSS Feed",
    description: "DevRun の最新記事を配信",
    site: "https://your-site-url.com",
    items: articles.map((post) => ({
      title: post.data.title,
      link: `/blog/${post.slug}`,
      pubDate: post.data.date,
      description: post.data.description,
    })),
  });
}