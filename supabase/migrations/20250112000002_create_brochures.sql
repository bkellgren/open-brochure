-- Migration: Create brochures table
-- Stores uploaded tri-fold brochures with metadata and sharing status

-- Create updated_at trigger function first
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE public.brochures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  visibility VARCHAR(10) NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('public', 'private')),
  original_file_url TEXT NOT NULL,
  original_file_type VARCHAR(10) NOT NULL
    CHECK (original_file_type IN ('image', 'pdf')),
  thumbnail_url TEXT,
  share_token VARCHAR(32) UNIQUE,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_brochure_user_id ON public.brochures(user_id);
CREATE INDEX idx_brochure_share_token ON public.brochures(share_token);
CREATE INDEX idx_brochure_visibility ON public.brochures(user_id, visibility);

-- Updated at trigger
CREATE TRIGGER brochures_updated_at
  BEFORE UPDATE ON public.brochures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE public.brochures ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view public brochures"
  ON public.brochures FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Anyone can view shared brochures"
  ON public.brochures FOR SELECT
  USING (share_token IS NOT NULL);

CREATE POLICY "Owners can view own brochures"
  ON public.brochures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can insert brochures"
  ON public.brochures FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Owners can update own brochures"
  ON public.brochures FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete own brochures"
  ON public.brochures FOR DELETE
  USING (auth.uid() = user_id);

-- Comment
COMMENT ON TABLE public.brochures IS 'Uploaded tri-fold brochures with metadata and sharing';
COMMENT ON COLUMN public.brochures.view_count IS 'Total views excluding owner views';
