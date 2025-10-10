import { defineCollection, z } from 'astro:content';

const walkthroughsCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		week: z.number(),
		publishDate: z.coerce.date(),
		ciphers: z.array(z.string()),
		difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
		description: z.string(),
		draft: z.boolean().default(false),
	}),
});

const ciphersCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
		relatedCiphers: z.array(z.string()).optional(),
		description: z.string(),
		order: z.number().optional(),
	}),
});

const analysisCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		relatedCiphers: z.array(z.string()).optional(),
		order: z.number().optional(),
	}),
});

const toolsCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		category: z.enum(['cipher', 'analysis', 'utility']),
		relatedCiphers: z.array(z.string()).optional(),
	}),
});

export const collections = {
	walkthroughs: walkthroughsCollection,
	ciphers: ciphersCollection,
	analysis: analysisCollection,
	tools: toolsCollection,
};
