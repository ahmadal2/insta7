'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { CheckCircle, XCircle, AlertCircle, Database, User as UserIcon } from 'lucide-react'

interface TableCheck {
  name: string
  exists: boolean
  error?: string
}

export default function DatabaseDebugPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<TableCheck[]>([])
  const [testResults, setTestResults] = useState<{ [key: string]: {
    success: boolean
    data?: unknown
    error?: string
  } }>({})

  const checkDatabaseSetup = useCallback(async () => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)

      // Check if tables exist
      const tableChecks: TableCheck[] = []
      const tablesToCheck = ['posts', 'profiles', 'comments', 'likes', 'follows', 'reposts']

      for (const tableName of tablesToCheck) {
        try {
          const { error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)

          if (error) {
            tableChecks.push({
              name: tableName,
              exists: false,
              error: error.message
            })
          } else {
            tableChecks.push({
              name: tableName,
              exists: true
            })
          }
        } catch (err: unknown) {
          tableChecks.push({
            name: tableName,
            exists: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          })
        }
      }

      setTables(tableChecks)

      // Test specific operations if user is logged in
      if (session?.user) {
        await testOperations(session.user)
      }
    } catch (error) {
      console.error('Database check error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkDatabaseSetup()
  }, [checkDatabaseSetup])

  const testOperations = async (currentUser: User) => {
    const results: { [key: string]: {
      success: boolean
      data?: unknown
      error?: string
    } } = {}

    // Test profile check
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      results.profile = {
        success: !error && !!profile,
        data: profile,
        error: error?.message
      }
    } catch (err: unknown) {
      results.profile = { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }
    }

    // Test comments table access
    try {
      const { error } = await supabase
        .from('comments')
        .select('*')
        .limit(1)

      results.comments = {
        success: !error,
        error: error?.message
      }
    } catch (err: unknown) {
      results.comments = { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }
    }

    // Test follows table access
    try {
      const { error } = await supabase
        .from('follows')
        .select('*')
        .limit(1)

      results.follows = {
        success: !error,
        error: error?.message
      }
    } catch (err: unknown) {
      results.follows = { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }
    }

    setTestResults(results)
  }

  const StatusIcon = ({ success, exists }: { success?: boolean, exists?: boolean }) => {
    if (success === true || exists === true) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (success === false || exists === false) {
      return <XCircle className="w-5 h-5 text-red-500" />
    } else {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Database className="w-8 h-8 animate-pulse text-blue-500 mx-auto mb-2" />
          <p>Checking database setup...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4 flex items-center">
            <Database className="w-6 h-6 mr-2" />
            Database Debug Information
          </h1>
          
          {/* Authentication Status */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Authentication Status
            </h2>
            <div className="flex items-center space-x-2">
              <StatusIcon success={!!user} />
              <span>{user ? `Logged in as: ${user.email}` : 'Not logged in'}</span>
            </div>
            {user && (
              <div className="mt-2 text-sm text-gray-600">
                <p>User ID: {user.id}</p>
                <p>Email confirmed: {user.email_confirmed_at ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>

          {/* Table Existence Check */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Database Tables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tables.map((table: TableCheck) => (
                <div key={table.name} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-2">
                    <StatusIcon exists={table.exists} />
                    <span className="font-medium">{table.name}</span>
                  </div>
                  <span className={`text-sm ${table.exists ? 'text-green-600' : 'text-red-600'}`}>
                    {table.exists ? 'EXISTS' : 'MISSING'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Operation Tests */}
          {user && Object.keys(testResults).length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Operation Tests</h2>
              <div className="space-y-3">
                {Object.entries(testResults).map(([operation, result]) => {
                  const typedResult = result as { success: boolean; data?: unknown; error?: string }
                  return (
                    <div key={operation} className="p-3 border rounded">
                      <div className="flex items-center space-x-2 mb-2">
                        <StatusIcon success={typedResult.success} />
                        <span className="font-medium capitalize">{operation} Access</span>
                      </div>
                      {typedResult.error && (
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          Error: {typedResult.error}
                        </p>
                      )}
                      {Boolean(typedResult.data) && (
                        <p className="text-sm text-green-600">
                          Data found: {JSON.stringify(typedResult.data, null, 2)}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Setup Instructions</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>If you see missing tables or errors above:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Open your Supabase Dashboard</li>
                <li>Go to the SQL Editor</li>
                <li>Copy and paste the content from <code>instagram_advanced_setup.sql</code></li>
                <li>Click RUN to execute the script</li>
                <li>Refresh this page to check again</li>
              </ol>
              <p className="mt-3">
                📖 For detailed instructions, see: <code>FIX_COMMENTS_AND_FOLLOWS.md</code>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={checkDatabaseSetup}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Re-check Database
            </button>
            {!user && (
              <a
                href="/auth/login"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Login to Test More
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}