-- Migration: Create panels table
-- Stores the 6 panels extracted from each brochure

CREATE TABLE public.panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brochure_id UUID NOT NULL REFERENCES public.brochures(id) ON DELETE CASCADE,
  position VARCHAR(20) NOT NULL
    CHECK (position IN ('cover', 'back', 'inside_flap', 'left_panel', 'center_panel', 'right_panel')),
  image_url TEXT NOT NULL,
  sort_order SMALLINT NOT NULL CHECK (sort_order BETWEEN 0 AND 5),
  UNIQUE (brochure_id, position),
  UNIQUE (brochure_id, sort_order)
);

-- Index for fast panel retrieval
CREATE INDEX idx_panel_brochure_id ON public.panels(brochure_id);

-- Enable RLS
ALTER TABLE public.panels ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Panels follow brochure access
CREATE POLICY "Panels follow brochure access"
  ON public.panels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.brochures b
      WHERE b.id = brochure_id
      AND (b.visibility = 'public' OR b.share_token IS NOT NULL OR b.user_id = auth.uid())
    )
  );

CREATE POLICY "Owners can insert panels"
  ON public.panels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brochures b
      WHERE b.id = brochure_id AND (b.user_id = auth.uid() OR b.user_id IS NULL)
    )
  );

CREATE POLICY "Owners can update panels"
  ON public.panels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.brochures b
      WHERE b.id = brochure_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete panels"
  ON public.panels FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.brochures b
      WHERE b.id = brochure_id AND b.user_id = auth.uid()
    )
  );

-- Comment
COMMENT ON TABLE public.panels IS 'Individual panels extracted from brochures';
COMMENT ON COLUMN public.panels.position IS 'Panel position: cover, back, inside_flap, left_panel, center_panel, right_panel';
