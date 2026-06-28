
-- Read access for any authenticated user on both buckets
CREATE POLICY "lesson_media_select_auth" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('lesson-videos', 'lesson-thumbnails'));

-- Admin can write
CREATE POLICY "lesson_media_admin_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('lesson-videos', 'lesson-thumbnails') AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "lesson_media_admin_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('lesson-videos', 'lesson-thumbnails') AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "lesson_media_admin_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('lesson-videos', 'lesson-thumbnails') AND public.has_role(auth.uid(), 'admin'));
