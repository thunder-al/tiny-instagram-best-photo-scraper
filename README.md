# Tiny Instagram Photo Matcher

A simple application that retrieves publicly accessible photos from non-private Instagram accounts using your
credentials. It then uses a provided LLM to rank the best solo photos of the user.

## Features

- Scrapes publicly accessible Instagram photos
- Uses AI to analyze and rank solo photos
- Simple REST API endpoint
- Docker/OCI support for easy deployment

## Requirements

* Node.js 20+
* Instagram account
* Any OpenAI-compatible LLM API with key (can be used with local LLMs)

## Installation & Usage

```bash
# Copy example environment file
cp .env.example .env

# Install dependencies and start the application
pnpm install
pnpm build
pnpm start
```

After successful startup, you can make an API call to get a ranked list of a user's photos:

```
GET http://localhost:8000/api/scrape/best-user-picture?username=USERNAME
```

## OCI/Docker Image

You can use the provided Containerfile to build an OCI image:

```bash
docker build -t instagram-photos -f Containerfile .
```

Deploy it as usual. It's recommended to use environment variables instead of a `.env` file in production for
convenience.

## Configuration

The application is configured using either a `.env` file or environment variables:

| Variable              | Description                                                                                  |
|-----------------------|----------------------------------------------------------------------------------------------|
| **SCRAPER_USERAGENT** | User agent string for the scraper (use one from your browser)                                |
| **SCRAPER_COOKIES**   | Cookies from your Instagram account (see `.env.example` for details)                         |
| **AI_API_URL**        | Base URL for the AI API (e.g., `https://api.openai.com/` or any other, including local LLMs) |
| **AI_API_KEY**        | API key for the AI API                                                                       |

&copy; 2025 ThunderAl Apache-2.0
