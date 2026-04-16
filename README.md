# Chinta

Chinta is a community-first social forum for the Ummah to share ideas, discuss issues, support each other, and build meaningful conversations. Members can create posts, follow people, vote on content, join category-based discussions, and chat through realtime messaging.

## Project Structure

This project is divided into two main parts:

1. `client` – Frontend built with [Vite](https://vitejs.dev/) and [React](https://reactjs.org/).
2. `server` – Backend built with [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Vite](https://vitejs.dev/)

### Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/chinta.git
cd chinta
```

### Setting up the client

1. Navigate to the `client` directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The client will be served at `http://localhost:5173` (or a different port if configured).

### Setting up the server

1. Navigate to the `server` directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file in the `server` directory. Example:

   ```bash
   PORT=5000
   ```

4. Start the server:

   ```bash
   npm start
   ```

   The server will be running at `http://localhost:5000`.

### Running the Project

To run both the client and server simultaneously, you can open two terminal windows:

1. One for the client:

   ```bash
   cd client
   npm run dev
   ```

2. Another for the server:
   ```bash
   cd server
   npm start
   ```

### Building for Production

#### Client

To build the frontend for production:

```bash
cd client
npm run build
```

## Features

- **Community Authentication**: Users can create accounts with standard credentials.
- **Forum Posting**: Members can publish posts with categories and tags.
- **Threaded Discussions**: Posts can have replies for deeper, structured conversations.
- **Follow System**: Members can follow each other and build social connections.
- **Realtime Messaging**: 1:1 chat with live updates using sockets.
- **Upvote/Downvote System**: The community can signal valuable content.

## Technologies

### Client:

- **Vite** – Fast build tool.
- **React** – User interface library.
- **Tailwind CSS** – Utility-first CSS framework (optional).

### Server:

- **Node.js** – JavaScript runtime.
- **Express.js** – Web framework for Node.js.
- **MongoDB** – Database for storing user information and posts.

## Contributing

We welcome contributions to the Chinta project. Please fork the repository and submit a pull request with any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.
