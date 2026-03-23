-- ============================================================
-- RSVP Online - Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  location TEXT,
  theme_url TEXT,
  rsvp_start TIMESTAMPTZ NOT NULL,
  rsvp_end TIMESTAMPTZ NOT NULL,
  creator_token TEXT NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RSVPs table
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  response TEXT CHECK (response IN ('yes', 'no', 'maybe')) NOT NULL,
  pin_hash TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, name)
);

-- Auto-update updated_at on rsvp changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rsvps_updated_at
  BEFORE UPDATE ON rsvps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Events: public read, public insert, public update (creator_token checked in app)
CREATE POLICY "events_select" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "events_update" ON events FOR UPDATE USING (true);

-- RSVPs: public read, public insert, public update (PIN checked in app)
CREATE POLICY "rsvps_select" ON rsvps FOR SELECT USING (true);
CREATE POLICY "rsvps_insert" ON rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "rsvps_update" ON rsvps FOR UPDATE USING (true);

-- ============================================================
-- Storage bucket for event themes
-- ============================================================
-- Run this in the Storage section OR via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('themes', 'themes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "themes_select" ON storage.objects FOR SELECT USING (bucket_id = 'themes');
CREATE POLICY "themes_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'themes');
