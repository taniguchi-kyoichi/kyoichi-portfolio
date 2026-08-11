import {
	streamText,
	convertToModelMessages,
	stepCountIs,
	createUIMessageStream,
	createUIMessageStreamResponse,
	type UIMessage
} from 'ai';
import { createWorkersAI } from 'workers-ai-provider';
import { error } from '@sveltejs/kit';
import { tools } from '$lib/server/tools';
import { checkRateLimit } from '$lib/server/rateLimit';
import { withoutDuplicatedChunks } from '$lib/server/aiBinding';
import type { RequestHandler } from './$types';

/** A friendly, SDK-correct error stream (so the client shows the message). */
function messageStream(text: string): Response {
	const stream = createUIMessageStream({
		execute: ({ writer }) => writer.write({ type: 'error', errorText: text })
	});
	return createUIMessageStreamResponse({ stream, headers: { 'Content-Encoding': 'identity' } });
}

// Llama 4 Scout returns *structured* tool calls and follows the JP persona well.
// (Tested alternatives on Workers AI: llama-3.3-70b-fp8-fast emits tool calls as
// plain-text JSON — never parsed. Scout is the reliable free option here.)
//
// Scout is sensitive to prompt weight: as the system prompt and tool block grow,
// it starts answering with an empty completion instead of a tool call. Keep the
// prompt below short and the tool schemas lean.
const MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct';

// Route Workers AI through this AI Gateway for caching (free repeated prompts),
// usage analytics, and a $10/month spend limit that hard-stops at the cap.
const AI_GATEWAY_ID = 'portfolio-ai';

const SYSTEM = `You are the AI assistant on Kyoichi Taniguchi's portfolio. Visitors ask about him in Japanese or English.

Answer by calling exactly one of these tools, which fetches the facts and renders a card:
getProfile (who he is, background), listProducts (his apps), getProductDetail (one specific app), listOSS (open source, libraries), getContact (contact, hiring), listWritings (blog posts), listReinArticles (Rein media), listVideos (YouTube).

Use those names exactly. Answer follow-ups from earlier tool results in text only, and never call the same tool twice.

Always answer in the language the visitor wrote in — a Japanese question gets a Japanese answer, an English question gets an English one. Call him 谷口さん in Japanese and Kyoichi in English.

The card already shows every item, so your text must never repeat them. With a card, write ONE short sentence naming nothing — no titles, URLs, bullets, or numbers — then stop. Good: "最新の記事はこちらです。" / "Here are his open-source projects." Without a card, keep it to two or three sentences. Never invent facts.`;

export const POST: RequestHandler = async ({ request, platform }) => {
	const ai = platform?.env?.AI;
	if (!ai) {
		throw error(503, 'AI binding is not available in this environment.');
	}

	// Abuse protection: per-IP rate limit + global daily cap (see rateLimit.ts).
	const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
	const limit = await checkRateLimit(platform?.env?.CHAT_LIMITS, ip, new Date().toISOString());
	if (!limit.ok) {
		return messageStream(
			limit.reason === 'global'
				? 'AI が一時的に混み合っています。少し時間をおいてお試しください。'
				: '短時間に質問が多すぎます。少し待ってからお試しください。'
		);
	}

	// Validate the payload: reject malformed JSON, oversized histories, and
	// oversized text so a crafted request can't burn extra inference cost.
	let body: { messages?: UIMessage[] };
	try {
		body = await request.json();
	} catch {
		return messageStream('リクエストの形式が不正です。');
	}
	const messages = body?.messages;
	if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
		return messageStream('リクエストが不正です。');
	}
	const totalChars = messages.reduce(
		(sum, m) =>
			sum + (m.parts ?? []).reduce((s, p) => s + (p.type === 'text' ? (p.text?.length ?? 0) : 0), 0),
		0
	);
	if (totalChars > 8000) {
		return messageStream('メッセージが長すぎます。短く分けてお試しください。');
	}

	const workersai = createWorkersAI({
		binding: withoutDuplicatedChunks(ai),
		gateway: { id: AI_GATEWAY_ID }
	});

	const result = streamText({
		model: workersai(MODEL),
		system: SYSTEM,
		messages: await convertToModelMessages(messages),
		tools,
		// 3 steps covers tool-call → (optional 2nd tool) → synthesize, while
		// keeping neuron usage down (Workers AI free tier is 10k neurons/day).
		stopWhen: stepCountIs(3),
		// Safety net so a reply never cuts off mid-sentence; the prompt keeps
		// answers short, so normal responses finish well under this.
		maxOutputTokens: 800
	});

	// `identity` avoids the workerd gzip-buffering issue where SSE chunks don't flush.
	return result.toUIMessageStreamResponse({
		headers: { 'Content-Encoding': 'identity' },
		onError: (error) => {
			const message = error instanceof Error ? error.message : String(error);
			// Workers AI daily free quota / capacity / rate errors → friendly copy.
			if (/neuron|4006|capacity|429|rate.?limit|too many/i.test(message)) {
				return 'AI が一時的に混み合っています。少し時間をおいてお試しください。';
			}
			return 'エラーが発生しました。もう一度お試しください。';
		}
	});
};
