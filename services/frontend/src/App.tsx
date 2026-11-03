import { useEffect, useState } from "react";

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:3001";
const GAME_API_URL = import.meta.env.VITE_GAME_API_URL ?? "http://localhost:3002";

type Health = { status: string; service: string };
type Game = { id: string; title: string; genre: string };

export default function App() {
  const [authHealth, setAuthHealth] = useState<Health | string>("loading...");
  const [gameHealth, setGameHealth] = useState<Health | string>("loading...");
  const [games, setGames] = useState<Game[] | string>("loading...");

  useEffect(() => {
    fetch(`${AUTH_API_URL}/health`)
      .then((res) => res.json())
      .then(setAuthHealth)
      .catch((err) => setAuthHealth(`error: ${err.message}`));

    fetch(`${GAME_API_URL}/health`)
      .then((res) => res.json())
      .then(setGameHealth)
      .catch((err) => setGameHealth(`error: ${err.message}`));

    fetch(`${GAME_API_URL}/games`)
      .then((res) => res.json())
      .then((data) => setGames(data.games))
      .catch((err) => setGames(`error: ${err.message}`));
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Mock Azure PaaS Frontend</h1>

      <section>
        <h2>backend-auth</h2>
        <pre>{JSON.stringify(authHealth, null, 2)}</pre>
      </section>

      <section>
        <h2>backend-game</h2>
        <pre>{JSON.stringify(gameHealth, null, 2)}</pre>
      </section>

      <section>
        <h2>Games (from backend-game DB)</h2>
        {typeof games === "string" ? (
          <p>{games}</p>
        ) : (
          <ul>
            {games.map((g) => (
              <li key={g.id}>
                {g.title} — {g.genre}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
