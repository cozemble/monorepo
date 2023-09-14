<script>
  import {useCompletion} from 'ai/svelte';

  const {input, handleSubmit, completion} = useCompletion({
    api: '/vercel-ai',
  });
  $input = "I'm a web developer who loves to build things with Svelte."
</script>

<main class="w-1/2 mx-auto">
    <!--    <form on:submit={handleSubmit}>-->
    <!--        <input type="text" bind:value={$input} placeholder="Describe your business..." />-->
    <!--        <button type="submit">Generate Slogan</button>-->
    <!--    </form>-->
    <p>{$completion}</p>
    <form on:submit={handleSubmit}>
        <input type="text" class="input input-bordered w-full" bind:value={$input} placeholder="Describe your database..."/>
        <br/>
        <button type="submit" class="btn btn-primary mt-2">Generate</button>
    </form>
</main>
