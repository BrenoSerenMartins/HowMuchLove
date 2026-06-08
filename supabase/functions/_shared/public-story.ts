const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const resolvePublicStoryUserId = (storyKey: string): string | null => {
  let normalizedStoryKey = storyKey.trim();
  try {
    normalizedStoryKey = decodeURIComponent(normalizedStoryKey).trim();
  } catch {
    // Keep the raw value when it is not URI-encoded.
  }

  return UUID_REGEX.test(normalizedStoryKey) ? normalizedStoryKey : null;
};
