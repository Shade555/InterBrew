-- =============================================
-- INTERBREW DATABASE SETUP
-- Run this in your Supabase SQL Editor
-- =============================================

-- =============================================
-- STEP 1: DROP EXISTING TABLES (if they exist)
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =============================================
-- STEP 2: CREATE PROFILES TABLE
-- =============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT,
    domain TEXT,
    interviews_taken INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on id

-- Enable Row Level Security

-- Policy: Users can read their own profile


-- =============================================
-- STEP 3: CREATE BADGES TABLE
-- =============================================

-- Enable Row Level Security


-- =============================================
-- STEP 4: CREATE CERTIFICATIONS TABLE
-- =============================================


-- =============================================
-- STEP 5: CREATE INDEXES FOR BETTER PERFORMANCE
-- =============================================
CREATE INDEX idx_badges_user_id ON badges(user_id);
CREATE INDEX idx_certifications_user_id ON certifications(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- =============================================
-- STEP 6: CREATE TRIGGER FUNCTION FOR AUTO-PROFILE CREATION
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'name',
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- STEP 7: SETUP STORAGE FOR PROFILE IMAGES
-- =============================================
-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Enable storage policies
-- Policy: Anyone can view profile images
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-images');

-- Policy: Authenticated users can upload profile images
CREATE POLICY "Auth Upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');

-- Policy: Users can update their own profile images
CREATE POLICY "Auth Update" ON storage.objects
    FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Users can delete their own profile images
CREATE POLICY "Auth Delete" ON storage.objects
    FOR DELETE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- COMPLETE!
-- =============================================

