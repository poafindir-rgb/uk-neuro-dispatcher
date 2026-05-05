import { AIResponse } from "../types";

const BACKEND_URL = "https://uk-neuro-dispatcher-backend.vercel.app/api/analyze";

const SYSTEM_PROMPT = `
Вы — интеллектуальный ассистент диспетчерской службы ЖКХ "Нейро-диспетчер".

Ваша задача:
обработать сообщение жильца, классифицировать обращение, определить приоритет, SLA, риски, инструкции для мастера и уточняющие вопросы.

Чек-лист необходимых данных:
1. Адрес: дом, подъезд, квартира.
2. Что именно случилось: детали проблемы.
3. Доступ: когда жилец дома, телефон для связи.
4. Риски: вода, дым, электричество, лифт, заблокированные люди.

ПРАВИЛА:
- Если данных не хватает, задавайте максимум 2 вопроса за раз.
- Не повторяйте один и тот же вопрос, если на него уже ответили или вы его уже задавали.
- Классифицируйте type:
  emergency — авария,
  repair — ремонт,
  complaint — жалоба,
  meter_reading — показания счётчиков.
- Приоритет:
  P0 — критично / авария,
  P1 — срочно,
  P2 — норма,
  P3 — низкий.
- SLA Reaction: минуты до первого ответа / выезда.
- SLA Resolution: минуты до закрытия.
- Не придумывайте данные, которых нет в сообщении.
- Ответ должен быть строго JSON без markdown и без пояснений.

ВЫХОД СТРОГО В JSON:
{
  "ticket": {
    "type": "emergency|repair|complaint|meter_reading",
    "subtype": "короткое название проблемы",
    "priority": "P0|P1|P2|P3",
    "sla_reaction_minutes": 0,
    "sla_resolution_minutes": 0,
    "missing_fields": [],
    "questions_to_user": [],
    "tech_instructions": [],
    "resident_update_message": "",
    "risk_flags": []
  }
}
`;

async function callOpenAIBackend(prompt: string): Promise<string> {
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Backend error:", errorText);
    throw new Error("Ошибка backend AI");
  }

  const data = await response.json();

  return data.text || "";
}

function parseJsonFromText(text: string): any {
  const cleanText = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleanText);
  } catch (error) {
    const match = cleanText.match(/\{[\s\S]*\}/);

    if (!match) {
      console.error("Не найден JSON в ответе AI:", cleanText);
      throw error;
    }

    return JSON.parse(match[0]);
  }
}

export async function processResidentMessage(
  message: string,
  history: { role: "user" | "model"; content: string }[] = []
): Promise<AIResponse> {
  try {
    const historyText = history
      .map((h) => `${h.role === "user" ? "Жилец" : "AI"}: ${h.content}`)
      .join("\n");

    const prompt = `
${SYSTEM_PROMPT}

История диалога:
${historyText || "Истории пока нет."}

Новое сообщение жильца:
"${message}"

Верни только JSON по указанной схеме.
`;

    const resultText = await callOpenAIBackend(prompt);
    const result = parseJsonFromText(resultText);

    return result as AIResponse;
  } catch (error) {
    console.error("AI processing error:", error);

    return {
      ticket: {
        type: "repair",
        subtype: "Новое обращение",
        priority: "P2",
        sla_reaction_minutes: 240,
        sla_resolution_minutes: 1440,
        missing_fields: ["address"],
        questions_to_user: ["Уточните, пожалуйста, ваш адрес."],
        tech_instructions: ["Связаться с жильцом и уточнить детали обращения."],
        resident_update_message:
          "Принято в обработку. Пожалуйста, уточните адрес и детали проблемы.",
        risk_flags: [],
      },
    };
  }
}
