"use client";

import React, { useState, useEffect } from 'react';

function MainComponent() {
  const [players, setPlayers] = useState([]);
  const [previousSeasonStats, setPreviousSeasonStats] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState({
    name: "",
    goals: 0,
    assists: 0,
    gamesPlayed: 0,
    selected: false,
  });
  const [showAssistModal, setShowAssistModal] = useState(false);
  const [selectedScorer, setSelectedScorer] = useState("");
  const [games, setGames] = useState([]);
  const [showAddGame, setShowAddGame] = useState(false);
  const [newGame, setNewGame] = useState({
    date: new Date().toISOString().split("T")[0],
    opponent: "",
    goalsFor: 0,
    goalsAgainst: 0,
    scorers: [],
  });
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState("");
  const [showOpponentModal, setShowOpponentModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    fetch("/api/db/sstracker", {
      method: "POST",
      body: JSON.stringify({
        query: "SELECT * FROM `players`",
        values: [],
      }),
    })
      .then((response) => response.json())
      .then((data) => setPlayers(data))
      .catch((error) => console.error("Error fetching players:", error));

    fetch("/api/db/sstracker", {
      method: "POST",
      body: JSON.stringify({
        query: "SELECT * FROM `games`",
        values: [],
      }),
    })
      .then((response) => response.json())
      .then((data) => setGames(data))
      .catch((error) => console.error("Error fetching games:", error));
  }, []);

  const addPlayer = (e) => {
    e.preventDefault();
    if (currentPlayer.name.trim()) {
      const newPlayers = [...players, currentPlayer];
      setPlayers(newPlayers);
      fetch("/api/db/sstracker", {
        method: "POST",
        body: JSON.stringify({
          query:
            "INSERT INTO `players` (name, goals, assists, games_played, selected) VALUES (?, ?, ?, ?, ?)",
          values: [
            currentPlayer.name,
            currentPlayer.goals,
            currentPlayer.assists,
            currentPlayer.gamesPlayed,
            currentPlayer.selected,
          ],
        }),
      });
      setCurrentPlayer({
        name: "",
        goals: 0,
        assists: 0,
        gamesPlayed: 0,
        selected: false,
      });
    }
  };

  const addGame = () => {
    const gameData = {
      ...newGame,
      id: games.length + 1,
      date: new Date().toISOString(),
    };
    const newGames = [gameData, ...games];
    setGames(newGames);
    fetch("/api/db/sstracker", {
      method: "POST",
      body: JSON.stringify({
        query:
          "INSERT INTO `games` (date, opponent, goals_for, goals_against, scorers) VALUES (?, ?, ?, ?, ?)",
        values: [
          gameData.date,
          gameData.opponent,
          gameData.goalsFor,
          gameData.goalsAgainst,
          JSON.stringify(gameData.scorers),
        ],
      }),
    });
    setNewGame({
      date: new Date().toISOString().split("T")[0],
      opponent: "",
      goalsFor: 0,
      goalsAgainst: 0,
      scorers: [],
    });
    setActiveView("");
  };

  const removePlayer = (playerName) => {
    const newPlayers = players.filter((player) => player.name !== playerName);
    setPlayers(newPlayers);
    fetch("/api/db/sstracker", {
      method: "POST",
      body: JSON.stringify({
        query: "DELETE FROM `players` WHERE `name` = ?",
        values: [playerName],
      }),
    });
  };

  const resetAllData = () => {
    if (window.confirm("ARE YOU SURE?")) {
      setPlayers([]);
      setPreviousSeasonStats([]);
      setGames([]);
      fetch("/api/db/sstracker", {
        method: "POST",
        body: JSON.stringify({
          query: "DELETE FROM `players`",
          values: [],
        }),
      });
      fetch("/api/db/sstracker", {
        method: "POST",
        body: JSON.stringify({
          query: "DELETE FROM `games`",
          values: [],
        }),
      });
    }
  };

  return (
    <>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2c5282" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <div
        className={`min-h-screen p-4 font-roboto ${
          darkMode ? "bg-gray-900 text-white" : "bg-[#f0f4f8]"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          {activeView !== "new-game" &&
            activeView !== "stats" &&
            activeView !== "history" &&
            activeView !== "players" &&
            activeView !== "settings" &&
            activeView !== "adjust-stats" &&
            activeView !== "previous-stats" && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h1
                    className={`text-3xl font-bold ${
                      darkMode ? "text-white" : "text-[#1a365d]"
                    }`}
                  >
                    Soccer Stats Tracker
                  </h1>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveView("settings")}
                      className={`p-3 rounded ${
                        darkMode ? "bg-gray-800" : "bg-white"
                      }`}
                    >
                      <i className="fas fa-cog text-[#2c5282]"></i>
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {!newGame.opponent ? (
                    <button
                      onClick={() => setShowOpponentModal(true)}
                      className={`p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
                        darkMode ? "bg-gray-800" : "bg-white"
                      }`}
                    >
                      <i className="fas fa-plus-circle text-3xl text-[#2c5282] mb-2"></i>
                      <div>New Game</div>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveView("new-game")}
                      className={`p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
                        darkMode ? "bg-gray-800" : "bg-white"
                      }`}
                    >
                      <i className="fas fa-gamepad text-3xl text-[#2c5282] mb-2"></i>
                      <div>Current Game</div>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveView("stats")}
                    className={`p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <i className="fas fa-chart-bar text-3xl text-[#2c5282] mb-2"></i>
                    <div>Stats</div>
                  </button>
                  <button
                    onClick={() => setActiveView("history")}
                    className={`p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <i className="fas fa-history text-3xl text-[#2c5282] mb-2"></i>
                    <div>Game History</div>
                  </button>
                  <button
                    onClick={() => setActiveView("players")}
                    className={`p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <i className="fas fa-users text-3xl text-[#2c5282] mb-2"></i>
                    <div>Players</div>
                  </button>
                </div>
              </>
            )}

          {showOpponentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div
                className={`p-6 rounded-lg w-[90%] max-w-md ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">Select Players</h2>
                <div className="max-h-60 overflow-y-auto mb-4">
                  {players.map((player, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id={`player-${index}`}
                        checked={player.selected}
                        onChange={() => {
                          const updatedPlayers = players.map((p, i) =>
                            i === index ? { ...p, selected: !p.selected } : p
                          );
                          setPlayers(updatedPlayers);
                        }}
                        className="w-4 h-4"
                      />
                      <label htmlFor={`player-${index}`}>{player.name}</label>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Opponent Name"
                  value={newGame.opponent}
                  onChange={(e) =>
                    setNewGame({ ...newGame, opponent: e.target.value })
                  }
                  className="w-full p-2 border rounded mb-4 bg-transparent"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowOpponentModal(false);
                      setPlayers(
                        players.map((p) => ({ ...p, selected: false }))
                      );
                    }}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (newGame.opponent.trim()) {
                        const selectedPlayers = players.filter(
                          (p) => p.selected
                        );
                        setPlayers(
                          players.map((p) => ({
                            ...p,
                            gamesPlayed: p.selected
                              ? p.gamesPlayed + 1
                              : p.gamesPlayed,
                          }))
                        );
                        setActiveView("new-game");
                        setShowOpponentModal(false);
                      }
                    }}
                    className="px-4 py-2 bg-[#2c5282] text-white rounded"
                  >
                    Start Game
                  </button>
                </div>
              </div>
            </div>
          )}

          {(activeView === "stats" ||
            activeView === "history" ||
            activeView === "settings" ||
            activeView === "players" ||
            activeView === "new-game" ||
            activeView === "adjust-stats" ||
            activeView === "previous-stats") && (
            <div className="flex items-center mb-4">
              <button
                onClick={() => {
                  setActiveView("");
                  setSelectedGame(null);
                }}
                className={`p-3 rounded ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <i className="fas fa-home text-[#2c5282]"></i>
              </button>
            </div>
          )}

          {activeView === "settings" && (
            <div
              className={`rounded-lg p-6 shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-bold mb-6">Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span>Dark Mode</span>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-12 h-6 rounded-full relative ${
                      darkMode ? "bg-[#2c5282]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                        darkMode ? "right-1" : "left-1"
                      }`}
                    ></div>
                  </button>
                </div>
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Player Stats</h3>
                  <button
                    onClick={() => setActiveView("adjust-stats")}
                    className="w-full p-4 bg-[#2c5282] text-white rounded mb-4"
                  >
                    Adjust Player Stats
                  </button>
                  <button
                    onClick={() => {
                      setPreviousSeasonStats(players);
                      setPlayers([]);
                      setGames([]);
                      setActiveView("");
                    }}
                    className="w-full p-4 bg-red-500 text-white rounded mb-12"
                  >
                    Start New Season
                  </button>
                </div>
                <div className="mt-12">
                  <button
                    onClick={resetAllData}
                    className="w-full p-4 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reset ALL DATA
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeView === "previous-stats" && (
            <div
              className={`rounded-lg p-6 shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-bold mb-6">Previous Season Stats</h2>
              <div className="overflow-x-auto">
                <table className="w-full mb-6">
                  <thead>
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Goals</th>
                      <th className="p-2 text-left">Assists</th>
                      <th className="p-2 text-left">Games</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previousSeasonStats.map((player, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{player.name}</td>
                        <td className="p-2">{player.goals}</td>
                        <td className="p-2">{player.assists}</td>
                        <td className="p-2">{player.gamesPlayed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === "adjust-stats" && (
            <div
              className={`rounded-lg p-6 shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-bold mb-6">Adjust Player Stats</h2>
              <div className="space-y-4">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className="p-4 rounded bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="font-semibold mb-2">{player.name}</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm mb-1">Goals</label>
                        <input
                          type="number"
                          value={player.goals}
                          onChange={(e) => {
                            const newPlayers = [...players];
                            newPlayers[index].goals =
                              parseInt(e.target.value) || 0;
                            setPlayers(newPlayers);
                          }}
                          className="w-full p-2 border rounded bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Assists</label>
                        <input
                          type="number"
                          value={player.assists}
                          onChange={(e) => {
                            const newPlayers = [...players];
                            newPlayers[index].assists =
                              parseInt(e.target.value) || 0;
                            setPlayers(newPlayers);
                          }}
                          className="w-full p-2 border rounded bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Games</label>
                        <input
                          type="number"
                          value={player.gamesPlayed}
                          onChange={(e) => {
                            const newPlayers = [...players];
                            newPlayers[index].gamesPlayed =
                              parseInt(e.target.value) || 0;
                            setPlayers(newPlayers);
                          }}
                          className="w-full p-2 border rounded bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === "new-game" && (
            <div
              className={`rounded-lg p-6 shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-bold mb-4">
                Game vs {newGame.opponent}
              </h2>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="text-4xl font-bold text-center mb-4">
                    {newGame.goalsFor} - {newGame.goalsAgainst}
                  </div>
                  <div className="flex flex-col gap-4">
                    <select
                      className="w-full p-4 bg-[#2c5282] text-white rounded"
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedScorer(e.target.value);
                          setShowAssistModal(true);
                        }
                      }}
                      value=""
                    >
                      <option value="">Select Goal Scorer</option>
                      {players
                        .filter((p) => p.selected)
                        .map((player, index) => (
                          <option key={index} value={player.name}>
                            {player.name}
                          </option>
                        ))}
                    </select>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() =>
                          setNewGame({
                            ...newGame,
                            goalsAgainst: Math.max(0, newGame.goalsAgainst - 1),
                          })
                        }
                        className="p-2 bg-gray-500 text-white rounded w-12"
                      >
                        -
                      </button>
                      <div className="flex items-center">
                        <span>Opponent Goals: {newGame.goalsAgainst}</span>
                      </div>
                      <button
                        onClick={() =>
                          setNewGame({
                            ...newGame,
                            goalsAgainst: newGame.goalsAgainst + 1,
                          })
                        }
                        className="p-2 bg-gray-500 text-white rounded w-12"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={addGame}
                className="w-full mt-6 p-4 bg-[#2c5282] text-white rounded"
              >
                End Game
              </button>
            </div>
          )}

          {activeView === "stats" && (
            <div
              className={`rounded-lg p-6 shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Team Stats</h2>
                <div className="text-xl font-bold">
                  {games.filter((g) => g.goalsFor > g.goalsAgainst).length}-
                  {games.filter((g) => g.goalsFor === g.goalsAgainst).length}-
                  {games.filter((g) => g.goalsFor < g.goalsAgainst).length}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full mb-6">
                  <thead>
                    <tr>
                      <th
                        className="p-2 text-left cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("name")}
                      >
                        Name{" "}
                        {sortConfig.key === "name" &&
                          (sortConfig.direction === "ascending" ? "↑" : "↓")}
                      </th>
                      <th
                        className="p-2 text-left cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("goals")}
                      >
                        Goals{" "}
                        {sortConfig.key === "goals" &&
                          (sortConfig.direction === "ascending" ? "↑" : "↓")}
                      </th>
                      <th
                        className="p-2 text-left cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("assists")}
                      >
                        Assists{" "}
                        {sortConfig.key === "assists" &&
                          (sortConfig.direction === "ascending" ? "↑" : "↓")}
                      </th>
                      <th
                        className="p-2 text-left cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("gamesPlayed")}
                      >
                        Games{" "}
                        {sortConfig.key === "gamesPlayed" &&
                          (sortConfig.direction === "ascending" ? "↑" : "↓")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayers.map((player, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{player.name}</td>
                        <td className="p-2">{player.goals}</td>
                        <td className="p-2">{player.assists}</td>
                        <td className="p-2">{player.gamesPlayed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-4 bg-green-100 rounded">
                  <h3
                    className={`font-bold mb-2 ${darkMode ? "text-black" : ""}`}
                  >
                    Top Scorer
                  </h3>
                  {topScorer && (
                    <div>
                      {topScorer.name}: {topScorer.goals} goals
                    </div>
                  )}
                </div>
                <div className="p-4 bg-blue-100 rounded">
                  <h3
                    className={`font-bold mb-2 ${darkMode ? "text-black" : ""}`}
                  >
                    Top Assister
                  </h3>
                  {topAssister && (
                    <div>
                      {topAssister.name}: {topAssister.assists} assists
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setActiveView("previous-stats")}
                  className="px-4 py-2 bg-[#2c5282] text-white rounded"
                >
                  Previous Season Stats
                </button>
              </div>
            </div>
          )}

          {activeView === "players" && (
            <div
              className={`rounded-lg p-6 shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <form onSubmit={addPlayer} className="mb-6">
                <input
                  type="text"
                  value={currentPlayer.name}
                  onChange={(e) =>
                    setCurrentPlayer({ ...currentPlayer, name: e.target.value })
                  }
                  placeholder="Player Name"
                  className="w-full p-2 border rounded mb-2 bg-transparent"
                />
                <button
                  type="submit"
                  className="w-full p-2 bg-[#2c5282] text-white rounded"
                >
                  Add Player
                </button>
              </form>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayers.map((player, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{player.name}</td>
                        <td className="p-2">
                          <button
                            onClick={() => removePlayer(player.name)}
                            className="text-red-500"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === "history" && (
            <div
              className={`rounded-lg p-6 shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="space-y-4">
                {games.map((game, index) => (
                  <div key={index}>
                    <button
                      onClick={() => setSelectedGame(game)}
                      className="w-full flex justify-between items-center p-3 border-b hover:bg-gray-100"
                    >
                      <span>
                        GSA {game.goalsFor} - {game.opponent}{" "}
                        {game.goalsAgainst}
                      </span>
                      <span className="text-gray-500">
                        {new Date(game.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </button>
                    {selectedGame && selectedGame.id === game.id && (
                      <div className="p-4 bg-gray-50 rounded mt-2">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-[#edf2f7]">
                                <th className="p-2 text-left">Name</th>
                                <th className="p-2 text-left">Goals</th>
                                <th className="p-2 text-left">Assists</th>
                              </tr>
                            </thead>
                            <tbody>
                              {players
                                .filter((p) => p.goals > 0 || p.assists > 0)
                                .map((player, index) => (
                                  <tr key={index} className="border-b">
                                    <td className="p-2">{player.name}</td>
                                    <td className="p-2">{player.goals}</td>
                                    <td className="p-2">{player.assists}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showAssistModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div
                className={`p-6 rounded-lg w-[90%] max-w-md ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Goal scored by {selectedScorer}
                </h2>
                <h3 className="text-lg mb-4">Assisted by:</h3>
                <select
                  className="w-full p-2 border rounded mb-4"
                  onChange={(e) => {
                    const assister = e.target.value;
                    const updatedPlayers = players.map((p) => {
                      if (p.name === selectedScorer) {
                        return { ...p, goals: p.goals + 1 };
                      }
                      if (assister && p.name === assister) {
                        return { ...p, assists: p.assists + 1 };
                      }
                      return p;
                    });
                    setPlayers(updatedPlayers);
                    setNewGame({
                      ...newGame,
                      goalsFor: newGame.goalsFor + 1,
                      scorers: [
                        ...newGame.scorers,
                        {
                          scorer: selectedScorer,
                          assist: e.target.value || null,
                        },
                      ],
                    });
                    setShowAssistModal(false);
                    setSelectedScorer("");
                  }}
                >
                  <option value="">Select Player</option>
                  <option value="">No Assist</option>
                  {players
                    .filter((p) => p.selected && p.name !== selectedScorer)
                    .map((player, index) => (
                      <option key={index} value={player.name}>
                        {player.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MainComponent;
