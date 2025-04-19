import React, { useState, useRef, useEffect, useMemo, KeyboardEvent } from 'react'
import { useActions, useValues } from 'kea'
import { cocktailsLogic } from '../logic/cocktailsLogic'
import { IngredientSearchItem } from '../types/ingredientTypes'
import Fuse from 'fuse.js'

export function IngredientSearch() {
  const [searchText, setSearchText] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const { sortedIngredientNames } = useValues(cocktailsLogic)
  const { addSelectedIngredient } = useActions(cocktailsLogic)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get filtered ingredients based on search text
  const filteredIngredients = useMemo(() => {
    const trimmedSearch = searchText.trim().toLowerCase()

    // If search is empty, return all ingredients
    if (trimmedSearch === '') {
      return sortedIngredientNames
    }

    // Combine two search methods, simple containment and fuzzy search
    // if search string is more than one character
    const directMatches = sortedIngredientNames.filter(
      (ingredient: IngredientSearchItem) =>
        ingredient.name.toLowerCase().includes(trimmedSearch) ||
        ingredient.id.toLowerCase().includes(trimmedSearch) ||
        (ingredient.category && ingredient.category.toLowerCase().includes(trimmedSearch))
    )
    // const directMatches: IngredientSearchItem[] = []

    let fuseMatches: IngredientSearchItem[]
    if (trimmedSearch.length > 1) {
      const fuse = new Fuse(sortedIngredientNames, {
        threshold: 0.3, // More strict matching to avoid incorrect matches
        includeScore: true,
        keys: ['name', 'id'],
        ignoreLocation: true,
        minMatchCharLength: 2,
        findAllMatches: true,
      })

      const fuseResults = fuse.search(trimmedSearch)
      fuseMatches = fuseResults.map<IngredientSearchItem>((result) => result.item)
    } else {
      fuseMatches = []
    }

    const combinedResults = [...new Set(directMatches.concat(fuseMatches))]

    return combinedResults
  }, [searchText, sortedIngredientNames])

  // Update highlighted index when filtered ingredients change
  // If there's an exact match, highlight it; otherwise select the first item
  useEffect(() => {
    if (filteredIngredients.length > 0) {
      const trimmedSearch = searchText.trim().toLowerCase()

      // If search is empty, just select the first item
      if (trimmedSearch === '') {
        setHighlightedIndex(0)
        return
      }

      // Find an exact match on name if available
      const exactMatchIndex = filteredIngredients.findIndex(
        (ingredient) => ingredient.name.toLowerCase() === trimmedSearch
      )

      // If found, highlight the exact match; otherwise default to first item
      setHighlightedIndex(exactMatchIndex !== -1 ? exactMatchIndex : 0)
    } else {
      setHighlightedIndex(0)
    }
  }, [filteredIngredients, searchText])

  // Scroll to highlighted item when it changes or dropdown opens
  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current) {
      const dropdownList = dropdownRef.current.querySelector('.overflow-auto')
      const highlightedItem = dropdownRef.current.querySelector(`li:nth-child(${highlightedIndex + 1})`)

      if (dropdownList && highlightedItem) {
        // Get positions
        const listRect = dropdownList.getBoundingClientRect()
        const itemRect = highlightedItem.getBoundingClientRect()

        // Check if the item is outside the visible area of the dropdown
        if (itemRect.bottom > listRect.bottom) {
          // Item is below the visible area
          dropdownList.scrollTop += itemRect.bottom - listRect.bottom
        } else if (itemRect.top < listRect.top) {
          // Item is above the visible area
          dropdownList.scrollTop -= listRect.top - itemRect.top
        }
      }
    }
  }, [highlightedIndex, isDropdownOpen])

  // Find exact match for enter key
  const findExactMatch = () => {
    const trimmedSearch = searchText.trim().toLowerCase()

    // First try exact match (case insensitive)
    const exactMatch = sortedIngredientNames.find(
      (ingredient) => ingredient.name.toLowerCase() === trimmedSearch || ingredient.id.toLowerCase() === trimmedSearch
    )

    if (exactMatch) {
      return exactMatch
    }

    // If no exact match and we have filtered results, use the first one
    if (filteredIngredients.length > 0) {
      return filteredIngredients[highlightedIndex]
    }

    return null
  }

  const handleSelectIngredient = (ingredient: IngredientSearchItem) => {
    addSelectedIngredient(ingredient.name)
    setSearchText('')

    // Keep the dropdown open but update the state to trigger a re-render
    setIsDropdownOpen((state) => {
      // Toggle state off and on to correctly refresh the dropdown visibility
      setTimeout(() => setIsDropdownOpen(true), 0)
      return false
    })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key
    if (e.key === 'Enter') {
      const matchedIngredient = findExactMatch()
      if (matchedIngredient) {
        handleSelectIngredient(matchedIngredient)
        e.preventDefault()
      }
    }

    // Show dropdown on arrow down
    if (e.key === 'ArrowDown') {
      setIsDropdownOpen(true)
      if (filteredIngredients.length > 0) {
        setHighlightedIndex((prevIndex) => (prevIndex < filteredIngredients.length - 1 ? prevIndex + 1 : prevIndex))
      }
      e.preventDefault() // Prevent cursor movement
    }

    // Navigate up the list
    if (e.key === 'ArrowUp') {
      if (filteredIngredients.length > 0) {
        setHighlightedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0))
      }
      e.preventDefault() // Prevent cursor movement
    }

    // Close with Escape
    if (e.key === 'Escape') {
      setIsDropdownOpen(false)
      e.preventDefault()
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Update dropdown visibility when search text changes
  useEffect(() => {
    if (searchText.trim() !== '') {
      setIsDropdownOpen(true)
    }
  }, [searchText])

  return (
    <div className="flex justify-center mb-4">
      <div className="w-full max-w-md relative" ref={dropdownRef}>
        <div className="flex rounded-md shadow-sm">
          <input
            type="text"
            className="flex-1 block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Search for an ingredient..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {isDropdownOpen && filteredIngredients.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <ul className="py-1">
              {filteredIngredients.map((ingredient, index) => (
                <li
                  key={index}
                  className={`px-4 py-2 text-sm cursor-pointer ${
                    index === highlightedIndex ? 'bg-blue-100' : 'hover:bg-blue-50'
                  }`}
                  onClick={() => handleSelectIngredient(ingredient)}
                >
                  <div className="flex justify-between">
                    <span>{ingredient.name}</span>
                    <span className="text-gray-500 text-xs">{ingredient.category || 'Uncategorized'}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
