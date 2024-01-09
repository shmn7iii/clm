import { Hono } from 'hono';
const app = new Hono();
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

export default app;
