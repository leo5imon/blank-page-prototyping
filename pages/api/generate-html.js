import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { base64Image } = req.body;

      if (!base64Image) {
        return res.status(400).json({ error: "Base64 image data is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Generate an HTML website based on this image. Try to respect the spacing in the page. Do not answer, directly return the HTML code. Try",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const generatedHtml = response.choices[0].message.content;

      res.setHeader("Content-Type", "text/html");
      res.status(200).send(generatedHtml);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to analyze image" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
