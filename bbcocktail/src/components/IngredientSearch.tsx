import React, { useState, KeyboardEvent } from 'react'
import { useActions } from 'kea'
import { cocktailsLogic } from '../logic/cocktailsLogic'

export function IngredientSearch() {
  const [ingredientInput, setIngredientInput] = useState('')
  const { addSelectedIngredient } = useActions(cocktailsLogic)

  const handleAddIngredient = () => {
    const ingredient = ingredientInput.trim()
    if (ingredient) {
      addSelectedIngredient(ingredient)
      setIngredientInput('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddIngredient()
    }
  }

  return (
    <div className="flex justify-center mb-4">
      <div className="w-full max-w-md">
        <div className="flex rounded-md shadow-sm">
          <input
            type="text"
            className="flex-1 block w-full rounded-l-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter an ingredient..."
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            type="button"
            className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={handleAddIngredient}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}