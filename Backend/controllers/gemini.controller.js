import fetch from "node-fetch";

export const chatWithGemini = async (req, res) => {
    try {
        const { message, image } = req.body; // image will be base64 string

        if (!message && !image) {
            return res.status(400).json({ error: "Message or image is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Gemini API key not configured" });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const test = " Write with clear reasoning. Use short sentences. Speak like a real person. Include small details that show how people talk. Explain why you choose each point. Avoid vague statements. Stay practical. Keep the tone natural.";

        // Build parts array - can include both text and image
        const parts = [];
        
        if (message) {
            parts.push({ text: message + test });
        }
        
        if (image) {
            // Extract mime type and base64 data from data URL
            const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                parts.push({
                    inline_data: {
                        mime_type: matches[1],
                        data: matches[2]
                    }
                });
            }
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: parts
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);
            return res.status(response.status).json({ error: "Failed to fetch from Gemini API" });
        }

        // Extract the text from the response
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
            return res.status(500).json({ error: "Invalid response format from Gemini API" });
        }

        res.status(200).json({ reply: aiResponse });

    } catch (error) {
        console.log("Error in chatWithGemini controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
