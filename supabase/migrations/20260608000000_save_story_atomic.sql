BEGIN;

CREATE OR REPLACE FUNCTION public.save_story_with_images(
  p_user_id uuid,
  p_start_date timestamptz,
  p_story_text text,
  p_layout_position text,
  p_youtube_url text,
  p_entry_button_text text,
  p_story_password text,
  p_images jsonb
)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
  v_story_id bigint;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));

  SELECT id
  INTO v_story_id
  FROM public.love_stories
  WHERE user_id = p_user_id
  LIMIT 1;

  IF v_story_id IS NULL THEN
    INSERT INTO public.love_stories (
      user_id,
      start_date,
      story_text,
      layout_position,
      youtube_url,
      entry_button_text,
      story_password
    ) VALUES (
      p_user_id,
      p_start_date,
      p_story_text,
      p_layout_position,
      p_youtube_url,
      p_entry_button_text,
      p_story_password
    )
    RETURNING id INTO v_story_id;
  ELSE
    UPDATE public.love_stories
    SET
      start_date = p_start_date,
      story_text = p_story_text,
      layout_position = p_layout_position,
      youtube_url = p_youtube_url,
      entry_button_text = p_entry_button_text,
      story_password = p_story_password
    WHERE id = v_story_id;
  END IF;

  DELETE FROM public.story_images
  WHERE story_id = v_story_id;

  IF p_images IS NOT NULL THEN
    INSERT INTO public.story_images (
      story_id,
      image_url,
      display_order
    )
    SELECT
      v_story_id,
      image_item->>'image_url',
      image_index - 1
    FROM jsonb_array_elements(p_images) WITH ORDINALITY AS image_items(image_item, image_index);
  END IF;

  RETURN v_story_id;
END;
$$;

COMMIT;
