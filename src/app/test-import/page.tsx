'use client'

import ClientThemeProvider from "@/components/ClientThemeProvider"

export default function TestImportPage() {
  console.log('ClientThemeProvider:', ClientThemeProvider)
  
  return (
    <div>
      <h1>Test Import Page</h1>
      <p>Check the console to see if ClientThemeProvider is properly imported.</p>
    </div>
  )
}