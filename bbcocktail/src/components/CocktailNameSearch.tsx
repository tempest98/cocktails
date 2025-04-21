import React, { useState, useEffect } from 'react'
import { useActions, useValues } from 'kea'
import { cocktailsLogic } from '../logic/cocktailsLogic'

export function CocktailNameSearch() {
  const { searchMode, cocktailNameSearch } = useValues(cocktailsLogic)
  const { setCocktailNameSearch } = useActions(cocktailsLogic)
  const [searchText, setSearchText] = useState(cocktailNameSearch)

  // Update local state when the global cocktailNameSearch changes
  useEffect(() => {
    setSearchText(cocktailNameSearch)
  }, [cocktailNameSearch])

  // Update global state with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCocktailNameSearch(searchText)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchText])

  if (searchMode !== 'name') {
    return null
  }

  return (
    <div className="flex justify-center mb-4">
      <div className="w-full max-w-md">
        <div className="flex rounded-md shadow-sm">
          <input
            type="text"
            className="flex-1 block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter cocktail name..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
