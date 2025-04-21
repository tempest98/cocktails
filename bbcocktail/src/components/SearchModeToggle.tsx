import React from 'react'
import { useActions, useValues } from 'kea'
import { cocktailsLogic } from '../logic/cocktailsLogic'

export function SearchModeToggle() {
  const { searchMode } = useValues(cocktailsLogic)
  const { setSearchMode } = useActions(cocktailsLogic)

  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
            searchMode === 'missing'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => setSearchMode('missing')}
        >
          Uses selected ingredients
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
            searchMode === 'complete'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => setSearchMode('complete')}
        >
          Made from selected ingredients
        </button>
      </div>
    </div>
  )
}
