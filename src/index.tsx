import { Hono } from 'hono';
import { customAlphabet } from 'nanoid';

interface Bindings {
	URL_BINDING: KVNamespace;
}

const app = new Hono<{ Bindings: Bindings }>();
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 8);

app.get('/', (c) => {
	return c.html(
		<html>
			<h1>clm</h1>
			<form action="/api/links" method="post">
				<div>
					<label>URL</label>
					<input type="url" name="url" placeholder="URL" required />
					<button>Submit</button>
				</div>
			</form>
		</html>
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

	return c.html(
		<html>
			<h1>clm</h1>
			<p>{`${new URL(c.req.url).origin}/${key}`}</p>
			<p>{url}</p>
		</html>
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
