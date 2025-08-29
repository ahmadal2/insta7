const { createClient } = require('@supabase/supabase-js');

// Using actual Supabase credentials from .env.local
const supabaseUrl = 'https://ufkrpnudqproxnyhsild.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVma3JwbnVkcXByb3hueWhzaWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjg3MDIsImV4cCI6MjA3MTgwNDcwMn0.r--q2pdigSsudsyF5k91_HPnJE356Twlwz0r8PFgmbQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function comprehensiveTest() {
  try {
    console.log('=== Comprehensive Database Structure Test ===\n');
    
    // 1. Get all tables
    console.log('1. Getting list of tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('Error getting tables:', tablesError);
    } else {
      console.log('Tables in database:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    // 2. Check posts table structure
    console.log('\n2. Checking posts table structure...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_columns', { table_name: 'posts' })
      .select('*');

    if (columnsError) {
      console.log('Alternative method to get columns...');
      // Try a different approach
      const { data: altColumns, error: altError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'posts')
        .eq('table_schema', 'public')
        .order('ordinal_position');

      if (altError) {
        console.error('Error getting posts table structure:', altError);
      } else {
        console.log('Posts table columns:');
        altColumns.forEach(col => {
          console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
        });
      }
    } else {
      console.log('Posts table columns:');
      columns.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type}`);
      });
    }
    
    // 3. Check if we can query posts
    console.log('\n3. Querying posts table...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(3);

    if (postsError) {
      console.error('Error querying posts:', postsError);
    } else {
      console.log(`Found ${posts.length} posts:`);
      posts.forEach((post, index) => {
        console.log(`  Post ${index + 1}:`, JSON.stringify(post, null, 2));
      });
    }
    
    // 4. Test inserting a post with actual user ID
    console.log('\n4. Testing post insertion...');
    // First, let's get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('Not logged in, skipping insert test');
    } else if (user) {
      console.log(`Current user ID: ${user.id}`);
      
      // Try to insert a post
      const { data: insertData, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: 'https://example.com/test.jpg',
          caption: 'Test post from comprehensive test'
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
    } else {
      console.log('No user session, skipping insert test');
    }
    
    console.log('\n=== Test Complete ===');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

comprehensiveTest();