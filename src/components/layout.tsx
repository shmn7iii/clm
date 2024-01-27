import { html } from 'hono/html';

const Layout = (props: { children?: any }) => {
	return html`<!DOCTYPE html>
		<html>
			<head>
				<title>clm</title>
				<link rel="icon" href="/favicon.ico" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
				<link href="https://fonts.googleapis.com/css2?family=Fugaz+One&display=swap" rel="stylesheet" />
				<script src="https://cdn.tailwindcss.com"></script>
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
};

export default Layout;
