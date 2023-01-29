<script lang="ts">
    import { createClient } from '@supabase/supabase-js'
    import { PUBLIC_SUPABASE_KEY } from '$env/static/public';
    const supabaseUrl = 'https://hxtxpwuuosksrtzditay.supabase.co'
    const supabase = createClient(supabaseUrl, PUBLIC_SUPABASE_KEY)
    console.log({PUBLIC_SUPABASE_KEY,supabase})
</script>
<h1>Welcome to Cozemble App</h1>
