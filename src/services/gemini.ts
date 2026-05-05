/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

const BACKEND_URL = "https://uk-neuro-dispatcher-backend.vercel.app/api/analyze";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const SYSTEM_PROMPT = `
Вы — интеллектуальный ассистент диспетчерской службы ЖКХ "Нейро-диспетчер".
Ваша задача: обработать сообщение жильца, классифицировать его и уточнить недостающие данные.

Чек-лист необходимых данных:
1. Адрес (Дом, Подъезд, Квартира)
2. Что именно случилось (детали)
3. Доступ (когда жилец дома, телефон для связи)
4. Риски (вода, дым, электричество, лифт, заблокированные люди)

ПРАВИЛА:
- Если данных не хватает, задавайте МАКСИМУМ 2 вопроса за раз.
- Не повторяйте один и тот же вопрос, если на него уже ответили или вы его уже задавали.
- Классифицируйте: emergency (авария), repair (ремонт), complaint (жалоба), meter_reading (показания).
- Приоритет: P0 (критично/авария), P1 (срочно), P2 (норма), P3 (низкий).
- SLA Reaction: минуты до первого ответа/выезда.
- SLA Resolution: минуты до закрытия.

ВЫХОД СТРОГО В JSON ПО СХЕМЕ:
{
  "ticket": {
    "type": "emergency|repair|complaint|meter_reading",
    "subtype": "короткое название (напр. протечка, нет света)",
    "priority": "P0|P1|P2|P3",
    "sla_reaction_minutes": число,
    "sla_resolution_minutes": число,
    "missing_fields": ["список полей из чек-листа, которых нет"],
    "questions_to_user": ["список уточняющих вопросов (макс 2)"],
    "tech_instructions": ["инструкции для мастера"],
    "resident_update_message": "сообщение для жильца о статусе",
    "risk_flags": ["метки риска, например 'залив', 'пожар'"]
  }
}
`;

export async function processResidentMessage(message: string, history: { role: 'user' | 'model', content: string }[] = []): Promise<AIResponse> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ticket: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                subtype: { type: Type.STRING },
                priority: { type: Type.STRING },
                sla_reaction_minutes: { type: Type.NUMBER },
                sla_resolution_minutes: { type: Type.NUMBER },
                missing_fields: { type: Type.ARRAY, items: { type: Type.STRING } },
                questions_to_user: { type: Type.ARRAY, items: { type: Type.STRING } },
                tech_instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                resident_update_message: { type: Type.STRING },
                risk_flags: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["type", "subtype", "priority", "sla_reaction_minutes", "sla_resolution_minutes", "missing_fields", "questions_to_user", "tech_instructions", "resident_update_message", "risk_flags"]
            }
          },
          required: ["ticket"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as AIResponse;
  } catch (error) {
    console.error("AI processing error:", error);
    // Fallback response
    return {
      ticket: {
        type: 'repair',
        subtype: 'Новое обращение',
        priority: 'P2',
        sla_reaction_minutes: 240,
        sla_resolution_minutes: 1440,
        missing_fields: ['address'],
        questions_to_user: ['Уточните, пожалуйста, ваш адрес.'],
        tech_instructions: ['Связаться с жильцом'],
        resident_update_message: 'Принято в обработку. Пожалуйста, уточните детали.',
        risk_flags: []
      }
    };
  }
}
