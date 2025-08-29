const { createClient } = require('@supabase/supabase-js');

// Using actual Supabase credentials from .env.local
const supabaseUrl = 'https://ufkrpnudqproxnyhsild.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVma3JwbnVkcXByb3hueWhzaWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjg3MDIsImV4cCI6MjA3MTgwNDcwMn0.r--q2pdigSsudsyF5k91_HPnJE356Twlwz0r8PFgmbQ';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSchema() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test connection by getting table info
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying posts table:', error);
    } else {
      console.log('Successfully connected to posts table');
      console.log('Sample data:', data);
    }
    
    // Check table structure
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'posts')
      .eq('table_schema', 'public');

    if (columnsError) {
      console.error('Error getting table structure:', columnsError);
    } else {
      console.log('Posts table structure:');
      columns.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type}`);
      });
    }
    
    // Try to insert a test post without media_type
    console.log('\nTesting post insertion without media_type...');
    const { data: insertData, error: insertError } = await supabase
      .from('posts')
      .insert({
        user_id: 'test-user-id',
        image_url: 'https://example.com/test.jpg',
        caption: 'Test post'
      })
      .select();

    if (insertError) {
      console.error('Error inserting test post:', insertError);
    } else {
      console.log('Successfully inserted test post:', insertData);
      
      // Clean up test post
      if (insertData && insertData[0]) {
        await supabase
          .from('posts')
          .delete()
          .eq('id', insertData[0].id);
        console.log('Cleaned up test post');
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testSchema();