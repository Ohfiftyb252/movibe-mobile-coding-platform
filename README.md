# Movibe: Mobile Coding Platform

> A minimalist, mobile-first coding platform for quick edits and previews on the go, inspired by build.cloudflare.dev.

Movibe is a minimalist, mobile-first coding platform designed for quick edits, prototyping, and learning on the go. Inspired by the clean interface of build.cloudflare.dev, Movibe provides a seamless and intuitive coding environment that is fully responsive and touch-friendly. The core of the application is a three-part interface: a file navigator, a code editor, and a live preview pane. On mobile devices, these components are smartly arranged into a tab-based navigation system to maximize screen real estate, while on desktop, it expands into a traditional multi-pane IDE layout.

[cloudflarebutton]

## ✨ Key Features

*   **Mobile-First Design:** A beautiful and functional interface optimized for touch devices.
*   **Responsive Layout:** Seamlessly transitions from a tab-based mobile view to a multi-pane desktop IDE.
*   **Live Preview:** See your changes reflected instantly in a sandboxed `iframe`.
*   **Resizable Panels:** Customize your desktop workspace with resizable panels for the file tree, editor, and preview.
*   **Minimalist UI:** A clean, uncluttered design that helps you focus on your code.
*   **Client-Side State:** Fast and responsive state management powered by Zustand.

## 🛠️ Technology Stack

*   **Framework:** React (Vite)
*   **Backend:** Hono on Cloudflare Workers
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui
*   **State Management:** Zustand
*   **Routing:** React Router
*   **Persistence:** Cloudflare Durable Objects
*   **Icons:** Lucide React
*   **Animation:** Framer Motion
*   **Editor:** React Simple Code Editor with PrismJS for syntax highlighting

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- A Cloudflare account and the `wrangler` CLI installed and configured.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/movibe.git
    cd movibe
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

## 💻 Development

### Running the Development Server

To start the local development server, which includes both the Vite frontend and the Hono worker backend, run:

```sh
bun dev
```

The application will be available at `http://localhost:3000`.

### Project Structure

The codebase is organized into three main directories:

-   `src/`: Contains the React frontend application code, including pages, components, hooks, and utility functions.
-   `worker/`: Contains the Cloudflare Worker backend code, built with Hono. This is where API routes and Durable Object logic reside.
-   `shared/`: Contains types and interfaces shared between the frontend and the backend to ensure type safety.

### Available Scripts

-   `bun dev`: Starts the development server.
-   `bun build`: Builds the frontend application for production.
-   `bun deploy`: Builds and deploys the application to Cloudflare Workers.
-   `bun lint`: Lints the codebase.

## ☁️ Deployment

This project is designed for easy deployment to Cloudflare Pages.

1.  **Login to Wrangler:**
    ```sh
    wrangler login
    ```

2.  **Deploy the application:**
    ```sh
    bun run deploy
    ```

This command will build the application and deploy it to your Cloudflare account.

Alternatively, you can deploy directly from your GitHub repository.

[cloudflarebutton]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or feature requests.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.