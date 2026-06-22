interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const id = params.id as string;

  // Capture the original response (which will be index.html due to SPA routing)
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  // If not HTML, just return the response
  if (!contentType.includes("text/html")) {
    return response;
  }

  try {
    // 1. Fetch story details from Supabase using REST API
    const supabaseResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/love_stories?id=eq.${id}&select=partner1_name,partner2_name,photos`,
      {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );

    if (supabaseResponse.ok) {
      const data = await supabaseResponse.json() as any[];
      if (data && data.length > 0) {
        const story = data[0];
        const names = `${story.partner1_name} & ${story.partner2_name}`;
        
        let coverImage = 'https://howmuchlove.com/og-default.jpg'; // default fallback
        if (story.photos && Array.isArray(story.photos) && story.photos.length > 0) {
           // get public URL of first photo
           coverImage = `${env.SUPABASE_URL}/storage/v1/object/public/story-images/${story.photos[0]}`;
        }

        // 2. Rewrite HTML with dynamic Open Graph tags
        return new HTMLRewriter()
          .on("head", {
            element(el) {
              el.append(`<meta property="og:title" content="A História de Amor de ${names}">`, { html: true });
              el.append(`<meta property="og:description" content="Nossa história eternizada para sempre.">`, { html: true });
              el.append(`<meta property="og:image" content="${coverImage}">`, { html: true });
              el.append(`<meta property="og:url" content="${request.url}">`, { html: true });
              el.append(`<meta property="og:type" content="website">`, { html: true });
              el.append(`<meta name="twitter:card" content="summary_large_image">`, { html: true });
            },
          })
          .transform(response);
      }
    }
  } catch (error) {
    // If Supabase fails, just return the original HTML so the page doesn't break
    console.error("Error fetching story for OG tags:", error);
  }

  return response;
};
