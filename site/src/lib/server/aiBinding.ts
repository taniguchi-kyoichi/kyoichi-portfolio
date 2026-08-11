import type { Ai } from '@cloudflare/workers-types';

/**
 * Workers AI puts every token and every tool call in a chunk TWICE: once in the
 * native slot (`response` / `tool_calls`) and once in the OpenAI slot
 * (`choices[0].delta`). workers-ai-provider maps both slots without treating
 * them as alternatives, so each one is emitted twice — text arrives doubled
 * ("谷谷口口さんは…") and tool arguments concatenate into `{}{}`, which fails to
 * parse and makes every tool call error out before it runs.
 *
 * Wrapping the binding drops the native copy of anything the OpenAI slot already
 * carries, so the provider sees exactly one representation. Chunks that only use
 * the native slot are left alone, so native-only models keep working.
 */
export function withoutDuplicatedChunks(ai: Ai): Ai {
	return new Proxy(ai, {
		get(target, property, receiver) {
			if (property !== 'run') return Reflect.get(target, property, receiver);
			return async (...args: Parameters<Ai['run']>) => {
				const result = await target.run(...args);
				return result instanceof ReadableStream ? withoutDuplicatedSlots(result) : result;
			};
		}
	});
}

/** Rewrites an SSE byte stream chunk by chunk, preserving the SSE framing. */
function withoutDuplicatedSlots(stream: ReadableStream): ReadableStream {
	const decoder = new TextDecoder();
	const encoder = new TextEncoder();
	let pending = '';

	return (stream as ReadableStream<Uint8Array>).pipeThrough(
		new TransformStream<Uint8Array, Uint8Array>({
			transform(bytes, controller) {
				pending += decoder.decode(bytes, { stream: true });
				const lines = pending.split('\n');
				pending = lines.pop() ?? '';
				for (const line of lines) controller.enqueue(encoder.encode(`${rewriteLine(line)}\n`));
			},
			flush(controller) {
				pending += decoder.decode();
				if (pending) controller.enqueue(encoder.encode(rewriteLine(pending)));
			}
		})
	) as ReadableStream;
}

function rewriteLine(line: string): string {
	const prefix = line.startsWith('data: ') ? 'data: ' : line.startsWith('data:') ? 'data:' : null;
	if (!prefix) return line;

	const payload = line.slice(prefix.length);
	if (payload.trim() === '[DONE]') return line;

	let chunk: Record<string, unknown>;
	try {
		chunk = JSON.parse(payload);
	} catch {
		return line; // not JSON we understand — pass it through untouched
	}

	const deduped = withoutNativeDuplicates(chunk);
	return deduped === chunk ? line : `${prefix}${JSON.stringify(deduped)}`;
}

/**
 * Removes a native field only when the OpenAI slot provably carries the same
 * payload, so nothing that appears in just one slot is ever lost.
 */
function withoutNativeDuplicates(chunk: Record<string, unknown>): Record<string, unknown> {
	const choices = chunk.choices as Array<{ delta?: Record<string, unknown> }> | undefined;
	const delta = choices?.[0]?.delta;
	if (!delta || typeof delta !== 'object') return chunk;

	const duplicatesText =
		typeof delta.content === 'string' &&
		typeof chunk.response === 'string' &&
		delta.content === chunk.response;

	const duplicatesToolCalls =
		Array.isArray(delta.tool_calls) &&
		delta.tool_calls.length > 0 &&
		Array.isArray(chunk.tool_calls) &&
		chunk.tool_calls.length > 0;

	if (!duplicatesText && !duplicatesToolCalls) return chunk;

	const deduped = { ...chunk };
	if (duplicatesText) delete deduped.response;
	if (duplicatesToolCalls) delete deduped.tool_calls;
	return deduped;
}
