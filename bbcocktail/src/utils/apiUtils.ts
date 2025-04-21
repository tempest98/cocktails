export const fetchData = async <T>(url: string, errorMessage: string): Promise<T[]> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(errorMessage)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error loading data from ${url}:`, error)
    return []
  }
}
