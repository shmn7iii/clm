import { Hono } from 'hono';
import { faker } from '@faker-js/faker';
import { serveStatic } from 'hono/cloudflare-workers';
import Layout from './components/layout';

interface Bindings {
	URL_BINDING: KVNamespace;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use('/favicon.ico', serveStatic({ root: 'public' }));

app.get('/', (c) => {
	const header_emoji = faker.internet.emoji({ types: ['food', 'nature', 'travel', 'activity'] });

	return c.html(
		<Layout header_emoji={header_emoji}>
			<div class="w-full">
				<form action="/api/links" method="post">
					<label for="search" class="block mb-2 text-xl font-bold text-gray-900">
						Let's shorten the URL!
					</label>
					<div class="relative">
						<input
							type="url"
							name="url"
							id="url"
							class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
							placeholder="URL"
							required
						/>
						<button
							type="submit"
							class="text-white absolute end-2.5 bottom-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
						>
							Submit
						</button>
					</div>
				</form>
			</div>
		</Layout>
	);
});

app.post('/api/links', async (c) => {
	const body = await c.req.parseBody();
	const url = body['url'];

	if (!url || typeof url != 'string') {
		return c.text('Missing URL', 400);
	}

	let key = '';
	for (let i = 0; i < 6; i++) {
		key = key + faker.internet.emoji({ types: ['food', 'nature', 'travel', 'activity'] });
	}

	await c.env.URL_BINDING.put(encodeURI(key), url);

	const shortened = `${new URL(c.req.url).origin}/${key}`;

	return c.html(
		<Layout header_emoji={[...key][0]}>
			<div>
				<h1 class="mb-8 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
					<span
						class="h-2 bg-no-repeat bg-bottom bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
						style="background-size: 100% 15%;"
					>
						<a href={shortened}>{shortened}</a>
					</span>
				</h1>
				<p class="text-xl font-bold">
					was issued as a shortened URL to{' '}
					<a href={url} class="font-medium text-blue-600 hover:underline">
						{url}
					</a>
				</p>
			</div>
		</Layout>
	);
});

app.get('/:key', async (c) => {
	const key = c.req.param('key');
	const url = await c.env.URL_BINDING.get(encodeURI(key));

	if (url == null) {
		return c.notFound();
	}

	return c.redirect(url);
});

export default app;
