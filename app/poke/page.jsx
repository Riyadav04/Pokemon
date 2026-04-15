"use client";

import { useEffect, useState } from "react";

export default function PokemonPage() {
  const [pokemonList, setPokemonList] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [totalCount,setTotalCount]=useState(0);

  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [pokemonDetails, setDetails] = useState(null);
  const  [activeTab,setActiveTab]=useState("");
  const [offset, setOffset] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

// fetch  pokemon list
  const loadPokemonData = async (url) => {
  try {
    setLoading(true);
    setError("");

    const res = await fetch(
      url || "https://pokeapi.co/api/v2/pokemon?limit=10&offset=0"
    );
    const apiData = await res.json();

    setPokemonList(apiData.results);
    setNextUrl(apiData.next);
    setPrevUrl(apiData.previous);
    setTotalCount(apiData.count);

    // extract offset from URL
    const urlObj = new URL(url || "https://pokeapi.co/api/v2/pokemon?limit=10&offset=0");
    const currentOffset = urlObj.searchParams.get("offset") || 0;
    setOffset(Number(currentOffset));

  } catch (err) {
    console.log("Error while fetching:", err);
    setError("Unable to load pokemon data");
  } finally {
    setLoading(false);
  }
};
  
  useEffect(() => {
  if (pokemonDetails && pokemonDetails.types.length > 0) {
    setActiveTab(pokemonDetails.types[0].type.name);
  }
}, [pokemonDetails]);

  useEffect(() => {
    loadPokemonData();
  }, []);

  // handle user click to load details
  useEffect(() => {
    if (!selectedPokemon) return;

    const loadDetails = async () => {
      try {
        console.log("Fetching details for:", selectedPokemon.name);

        const res = await fetch(selectedPokemon.url);
        const data = await res.json();

        setDetails(data);
      } catch (err) {
        console.log("Error loading details:", err);
      }
    };

    loadDetails();
  }, [selectedPokemon]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex justify-center">
      {loading && <p className="text-blue-500">Loading...</p>}

      {error && (
        <p className="text-red-500 bg-red-100 p-2 mb-2">
          {error}
        </p>
      )}

      <div className="flex gap-6">
        
        {/* Left side table */}
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
              {pokemonList.map((pokemonItem, index) => (
                <tr key={index} className="text-center border">
                  <td>{offset + index + 1}</td>
                  <td
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={() => setSelectedPokemon(pokemonItem)}
                  >
                    {pokemonItem.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
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

        {/* Right side details  */}
  <div className="w-1/2 bg-white p-4 shadow rounded">
  {pokemonDetails && (
    <>
      <h2 className="text-lg font-semibold mb-3">
        Pokémon Types ({pokemonDetails.name})
      </h2>

     {/* Tabs */}
<div className="flex border-b mb-3">
  {pokemonDetails.types.map((t, i) => (
    <button
      key={i}
      onClick={() => setActiveTab(t.type.name)}
      className={`px-4 py-2 ${
        activeTab === t.type.name
          ? "border-b-2 border-black font-semibold"
          : "text-gray-500"
      }`}
    >
      {t.type.name}
    </button>
  ))}
</div>

{/* Tab Content */}
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