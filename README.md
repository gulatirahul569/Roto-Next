# Roto

A modern e-commerce storefront built with **Next.js**. Roto offers a clean shopping experience across fashion, footwear, home essentials, and accessories, with category browsing, price filters, a wishlist, and a shopping bag.

**Live demo:** [roto-next.vercel.app](https://roto-next.vercel.app)

---

## Features

- **Category browsing:** Men, Women, Kids, Home, Accessories, All Products, and New Drops
- **Price filters:** Under ₹1,000, ₹1,000 – ₹3,000, ₹3,000 – ₹5,000, ₹5,000 – ₹10,000, and above ₹10,000
- **Sorting:** sort products by newest and more
- **Shopping bag:** add, remove, and update items
- **Wishlist:** save products for later
- **Location selector:** set your delivery location
- **Order tracking:** check shipment status with an order number
- **Help pages:** Shipping, Returns, Size Guide, Contact, Privacy Policy, Terms, and Cookies
- **Responsive design:** works on mobile, tablet, and desktop

## Tech Stack

| Area        | Technology                                  |
| ----------- | ------------------------------------------- |
| Framework   | [Next.js](https://nextjs.org) (App Router)  |
| UI library  | [React](https://react.dev)                  |
| Styling     | [Tailwind CSS](https://tailwindcss.com) (via PostCSS) |
| Fonts       | [Geist](https://vercel.com/font) via `next/font` |
| Linting     | ESLint                                      |
| Media       | Vercel Blob Storage (banners)               |
| Deployment  | [Vercel](https://vercel.com)                |

> Update this table to match your actual dependencies (database, auth, payment gateway, etc.).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18.18 or later
- npm, yarn, pnpm, or bun

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/gulatirahul569/Roto-Next.git
cd Roto-Next

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# then fill in the values (see below)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the project root. Never commit this file.

```env
# Example, replace with the variables your project actually uses
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
```

| Variable                | Description                              | Required |
| ----------------------- | ---------------------------------------- | -------- |
| `NEXT_PUBLIC_SITE_URL`  | Public URL of the site                   | Yes      |
| `DATABASE_URL`          | Database connection string               | Yes      |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for image uploads      | Optional |

> Edit this list to match your project. Tip: commit a `.env.example` file with empty values so others know what to set.

## Available Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the development server         |
| `npm run build`   | Create an optimized production build |
| `npm run start`   | Run the production build             |
| `npm run lint`    | Check code with ESLint               |

The `scripts/` folder contains helper scripts. Document what each one does here, for example:

```bash
node scripts/<script-name>.js
```

## Project Structure

```
Roto-Next/
├── public/            # Static assets (images, videos, logos)
├── scripts/           # Utility / maintenance scripts
├── src/
│   ├── app/           # App Router pages, layouts, and API routes
│   ├── components/    # Reusable UI components
│   └── ...            # Hooks, utilities, data helpers
├── eslint.config.mjs  # ESLint configuration
├── jsconfig.json      # Path aliases
├── next.config.mjs    # Next.js configuration
├── postcss.config.mjs # PostCSS / Tailwind configuration
└── package.json
```

> Adjust the `src/` breakdown to match your actual folders.

## Deployment

The easiest way to deploy is with [Vercel](https://vercel.com):

1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Add your environment variables under **Project → Settings → Environment Variables**.
4. Deploy. Every push to `main` creates a new production deployment.

To use a custom domain, go to **Project → Settings → Domains** and follow the DNS instructions.

## Roadmap

- [ ] Product search with suggestions
- [ ] Server-rendered product and category pages for better SEO
- [ ] Per-page SEO metadata, sitemap, and Product structured data
- [ ] Secure order tracking (order number plus email or phone)
- [ ] Payment gateway integration
- [ ] User accounts and order history
- [ ] Automated tests (Playwright)

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## Author

**Rahul Gulati**
GitHub: [@gulatirahul569](https://github.com/gulatirahul569/Roto-Next)

---

*Product images and brand assets shown in the demo are for demonstration purposes. Make sure you have the rights to any images used in production.*