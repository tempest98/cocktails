import React from 'react'
import { useActions, useValues } from 'kea'
import { cocktailsLogic } from '../logic/cocktailsLogic'

export function SelectedIngredients() {
  const { selectedIngredients } = useValues(cocktailsLogic)
  const { removeSelectedIngredient } = useActions(cocktailsLogic)

  if (selectedIngredients.size === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      {Array.from(selectedIngredients).map((ingredient: string) => (
        <div key={ingredient} className="flex items-center px-3 py-1 bg-gray-200 rounded-full text-sm">
          <span className="mr-1">{ingredient}</span>
          <button
            type="button"
            className="ml-1 inline-flex rounded-full p-0.5 hover:bg-gray-300"
            onClick={() => removeSelectedIngredient(ingredient)}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
