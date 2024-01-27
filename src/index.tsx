import { Hono } from 'hono';
import { html } from 'hono/html';
import { customAlphabet } from 'nanoid';
import { serveStatic } from 'hono/cloudflare-workers';

interface Bindings {
	URL_BINDING: KVNamespace;
}

const app = new Hono<{ Bindings: Bindings }>();
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 8);

const Layout = (props: { children?: any }) => html`<!DOCTYPE html>
	<html>
		<head>
			<title>clm</title>
			<script src="https://cdn.tailwindcss.com"></script>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
			<link href="https://fonts.googleapis.com/css2?family=Fugaz+One&display=swap" rel="stylesheet" />
		</head>
		<body class="h-screen w-screen px-44 py-6">
			<a href="/" class="absolute">
				<h1 class="mb-4 text-3xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl" style="font-family: 'Fugaz One';">
					<span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">clm</span>
					<small class="ms-2 text-2xl font-sans font-bold"> URL Shortener</small>
				</h1>
			</a>
			<div class="h-full w-full flex items-center">${props.children}</div>
		</body>
	</html>`;
app.use('/favicon.ico', serveStatic({ root: 'public' }));

app.get('/', (c) => {
	return c.html(
		<Layout>
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

	const key = nanoid();
	await c.env.URL_BINDING.put(key, url);

	const shortened = `${new URL(c.req.url).origin}/${key}`;

	return c.html(
		<Layout>
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
	const url = await c.env.URL_BINDING.get(key);

	if (url == null) {
		return c.notFound();
	}

	return c.redirect(url);
});

export default app;
