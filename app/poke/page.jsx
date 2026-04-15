"use client";

import { useEffect, useState } from "react";

export default function PokemonPage() {
  // Setting up some state variables here.  Gotta keep track of stuff.
  const [pokemonList, setPokemonList] = useState([]); // The list of Pokemon
  const [nextUrl, setNextUrl] = useState(null); // URL for the next page of Pokemon
  const [prevUrl, setPrevUrl] = useState(null); // URL for the previous page
  const [totalCount, setTotalCount] = useState(0); // Total number of Pokemon

  const [selectedPokemon, setSelectedPokemon] = useState(null); // The Pokemon you click on
  const [pokemonDetails, setDetails] = useState(null); // Details for the selected Pokemon
  const [activeTab, setActiveTab] = useState(""); // Which type tab is showing
  const [offset, setOffset] = useState(0); // For the table's "Sr No" column

  const [loading, setLoading] = useState(false); // Are we waiting for data?
  const [error, setError] = useState(""); // Any errors along the way

  // This function fetches the Pokemon data from the API.
  const loadPokemonData = async (url) => {
    // Show that we're loading, and clear any old errors.
    setLoading(true);
    setError("");

    try {
      // Get the data from the API.  Use a default URL if none is provided.
      const response = await fetch(
        url || "https://pokeapi.co/api/v2/pokemon?limit=10&offset=0"
      );
      const data = await response.json();

      // Update the state with the received data.
      setPokemonList(data.results);
      setNextUrl(data.next);
      setPrevUrl(data.previous);
      setTotalCount(data.count);

      // Need to figure out the offset for the table's numbering.
      const urlObject = new URL(url || "https://pokeapi.co/api/v2/pokemon?limit=10&offset=0");
      const currentOffset = urlObject.searchParams.get("offset") || 0;
      setOffset(Number(currentOffset)); // Convert to a number
    } catch (err) {
      // If something goes wrong, log it and set an error message.
      console.log("Error fetching data:", err);
      setError("Couldn't load Pokemon data, sorry!");
    } finally {
      // Whether it worked or not, stop the loading indicator.
      setLoading(false);
    }
  };

  // When a Pokemon's details are loaded, automatically select its first type.
  useEffect(() => {
    if (pokemonDetails && pokemonDetails.types.length) {
      setActiveTab(pokemonDetails.types[0].type.name);
    }
  }, [pokemonDetails]);

  // Run this when the page first loads to get the initial Pokemon list.
  useEffect(() => {
    loadPokemonData(); // Call the function to load the data.
  }, []); // Empty dependency array, so it only runs once on load

  // Whenever a Pokemon is selected from the list, get its details.
  useEffect(() => {
    if (!selectedPokemon) return; // Don't do anything if nothing's selected

    const loadDetails = async () => {
      try {
        console.log("Fetching details for:", selectedPokemon.name);
        const response = await fetch(selectedPokemon.url);
        const pokemonData = await response.json();
        setDetails(pokemonData);
      } catch (err) {
        console.log("Error loading details:", err);
      }
    };

    loadDetails();
  }, [selectedPokemon]); // Trigger this effect when `selectedPokemon` changes.

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex justify-center">
      {loading ? (
        <p className="text-blue-500">Loading...</p>
      ) : null}

      {error && (
        <p className="text-red-500 bg-red-100 p-2 mb-2">
          {error}
        </p>
      )}

      <div className="flex gap-6">
        {/* The Pokemon List side */}
        <div className="w-1/2 bg-white p-4 shadow rounded overflow-hidden">
          <h2 className="text-lg font-semibold mb-3">Pokemon Table</h2>
          <table className="w-full border table-fixed">
            <thead>
              <tr className="bg-gray-200">
                <th>Sr No</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {pokemonList.map((pokemon, index) => (
                <tr key={index} className="text-center border">
                  <td>{offset + index + 1}</td>
                  <td
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={() => setSelectedPokemon(pokemon)}
                  >
                    {pokemon.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination at the bottom */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <p>Total: {totalCount}</p>
            <div className="flex gap-2">
              <button
                disabled={!prevUrl}
                onClick={() => loadPokemonData(prevUrl)}
                className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={!nextUrl}
                onClick={() => loadPokemonData(nextUrl)}
                className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Pokemon Details side */}
        <div className="w-1/2 bg-white p-4 shadow rounded">
          {pokemonDetails && (
            <>
              <h2 className="text-lg font-semibold mb-3">
                Pokemon Types ({pokemonDetails.name})
              </h2>

              {/* Type tabs */}
              <div className="flex border-b mb-3">
                {pokemonDetails.types.map((type, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(type.type.name)}
                    className={`px-4 py-2 ${
                      activeTab === type.type.name
                        ? "border-b-2 border-black font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    {type.type.name}
                  </button>
                ))}
              </div>

              {/* Type info */}
              <div>
                <p>
                  Showing data for type: <b>{activeTab}</b>
                </p>
                <p>Game Indices: {pokemonDetails.game_indices.length}</p>
                <p>Moves: {pokemonDetails.moves.length}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}