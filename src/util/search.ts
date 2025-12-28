export const fuzzyMatch = (text: string, query: string): boolean => {
    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    return lowerText.includes(lowerQuery)
}
