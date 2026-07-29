import { tavily } from "@tavily/core";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

export async function liveSearch(query: string): Promise<string> {
  try {
    const response = await tvly.search(query, {
      searchDepth: "advanced",
      maxResults: 5,
      includeAnswer: true,
    });

    let output = "";

    if (response.answer) {
      output += `Summary:\n${response.answer}\n\n`;
    }

    if (response.results?.length) {
      output += "Sources:\n";

      for (const result of response.results) {
        output += `
Title: ${result.title}
URL: ${result.url}
Content: ${result.content}

`;
      }
    }

    return output;
  } catch (error) {
    console.error("Live Search Error:", error);
    return "";
  }
}