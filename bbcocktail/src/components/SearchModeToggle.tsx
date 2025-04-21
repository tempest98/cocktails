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
          className={`px-4 py-2 text-sm font-medium ${
            searchMode === 'missing'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
          } ${searchMode === 'missing' ? '' : 'border-r-0'} rounded-l-lg`}
          onClick={() => setSearchMode('missing')}
        >
          Uses selected ingredients
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            searchMode === 'complete'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
          } ${searchMode === 'complete' ? '' : 'border-r-0'}`}
          onClick={() => setSearchMode('complete')}
        >
          Made from selected ingredients
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
            searchMode === 'name'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => setSearchMode('name')}
        >
          Find by name
        </button>
      </div>
    </div>
  )
}
