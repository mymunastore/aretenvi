/*
  # Supabase Storage and File Processing Configuration

  ## Overview
  Configure Supabase Storage buckets for handling images, documents, and media files.
  Includes file metadata tracking, processing status, and AI analysis integration.

  ## Storage Buckets
  1. **waste-images** - User-uploaded waste images for classification
  2. **documents** - PDF documents, reports, invoices
  3. **profile-avatars** - User profile images
  4. **environmental-reports** - Generated PDF reports
  5. **temp-uploads** - Temporary file storage (auto-cleanup)

  ## New Tables
  1. **file_uploads**
     - Track all file uploads with metadata
     - Link to AI processing results

  2. **file_processing_queue**
     - Queue for async file processing tasks
     - Status tracking and retry logic

  3. **processed_files**
     - Store results of file processing
     - OCR text, thumbnails, analysis results

  ## Features
     - Automatic file metadata extraction
     - Image optimization and thumbnail generation
     - OCR for document text extraction
     - AI-powered image analysis
     - Virus scanning integration ready
     - Automatic cleanup of temp files
     - File version tracking

  ## Security
     - RLS policies for all tables
     - Bucket-level access control
     - File size and type restrictions
     - Malware scanning hooks
*/

-- File uploads tracking
CREATE TABLE IF NOT EXISTS file_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_bucket text NOT NULL,
  storage_path text NOT NULL,
  original_filename text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  file_extension text,
  upload_status text DEFAULT 'completed' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed', 'deleted')),
  is_public boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  width integer,
  height integer,
  duration_seconds integer,
  checksum text,
  virus_scan_status text DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'error')),
  virus_scan_result text,
  ai_processed boolean DEFAULT false,
  ai_processing_status text CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- File processing queue
CREATE TABLE IF NOT EXISTS file_processing_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_upload_id uuid REFERENCES file_uploads(id) ON DELETE CASCADE,
  processing_type text NOT NULL CHECK (processing_type IN ('thumbnail', 'optimize', 'ocr', 'ai_analysis', 'virus_scan', 'transcription')),
  priority integer DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  error_message text,
  processing_params jsonb DEFAULT '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Processed files results
CREATE TABLE IF NOT EXISTS processed_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_upload_id uuid REFERENCES file_uploads(id) ON DELETE CASCADE,
  processing_type text NOT NULL,
  result_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  thumbnail_path text,
  optimized_path text,
  extracted_text text,
  ai_analysis_result jsonb,
  confidence_score decimal(3,2),
  processing_duration_ms integer,
  created_at timestamptz DEFAULT now()
);

-- File access log
CREATE TABLE IF NOT EXISTS file_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_upload_id uuid REFERENCES file_uploads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  access_type text NOT NULL CHECK (access_type IN ('view', 'download', 'share', 'delete', 'update')),
  ip_address inet,
  user_agent text,
  access_granted boolean DEFAULT true,
  denial_reason text,
  created_at timestamptz DEFAULT now()
);

-- File versions (for document versioning)
CREATE TABLE IF NOT EXISTS file_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_upload_id uuid REFERENCES file_uploads(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  storage_path text NOT NULL,
  file_size bigint NOT NULL,
  checksum text NOT NULL,
  change_description text,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_file_version UNIQUE (file_upload_id, version_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_storage_bucket ON file_uploads(storage_bucket);
CREATE INDEX IF NOT EXISTS idx_file_uploads_upload_status ON file_uploads(upload_status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON file_uploads(created_at);
CREATE INDEX IF NOT EXISTS idx_file_uploads_deleted_at ON file_uploads(deleted_at);

CREATE INDEX IF NOT EXISTS idx_file_processing_queue_status ON file_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_file_processing_queue_priority ON file_processing_queue(priority);
CREATE INDEX IF NOT EXISTS idx_file_processing_queue_processing_type ON file_processing_queue(processing_type);
CREATE INDEX IF NOT EXISTS idx_file_processing_queue_created_at ON file_processing_queue(created_at);

CREATE INDEX IF NOT EXISTS idx_processed_files_file_upload_id ON processed_files(file_upload_id);
CREATE INDEX IF NOT EXISTS idx_processed_files_processing_type ON processed_files(processing_type);

CREATE INDEX IF NOT EXISTS idx_file_access_log_file_upload_id ON file_access_log(file_upload_id);
CREATE INDEX IF NOT EXISTS idx_file_access_log_user_id ON file_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_file_access_log_created_at ON file_access_log(created_at);

CREATE INDEX IF NOT EXISTS idx_file_versions_file_upload_id ON file_versions(file_upload_id);

-- Enable Row Level Security
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for file_uploads
CREATE POLICY "Users can view own files"
  ON file_uploads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can upload files"
  ON file_uploads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own files"
  ON file_uploads FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own files"
  ON file_uploads FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for processed_files
CREATE POLICY "Users can view own processed files"
  ON processed_files FOR SELECT
  TO authenticated
  USING (
    file_upload_id IN (
      SELECT id FROM file_uploads WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for file_access_log
CREATE POLICY "Users can view own access logs"
  ON file_access_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for file_versions
CREATE POLICY "Users can view own file versions"
  ON file_versions FOR SELECT
  TO authenticated
  USING (
    file_upload_id IN (
      SELECT id FROM file_uploads WHERE user_id = auth.uid()
    )
  );

-- Function to queue file for processing
CREATE OR REPLACE FUNCTION queue_file_processing(
  file_upload_id_param uuid,
  processing_type_param text,
  priority_param integer DEFAULT 50,
  processing_params_param jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  queue_id uuid;
BEGIN
  INSERT INTO file_processing_queue (
    file_upload_id, processing_type, priority, processing_params
  ) VALUES (
    file_upload_id_param, processing_type_param, priority_param, processing_params_param
  )
  RETURNING id INTO queue_id;
  
  RETURN queue_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log file access
CREATE OR REPLACE FUNCTION log_file_access(
  file_upload_id_param uuid,
  user_id_param uuid,
  access_type_param text,
  ip_address_param inet DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO file_access_log (
    file_upload_id, user_id, access_type, ip_address
  ) VALUES (
    file_upload_id_param, user_id_param, access_type_param, ip_address_param
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create file version
CREATE OR REPLACE FUNCTION create_file_version(
  file_upload_id_param uuid,
  new_storage_path text,
  new_file_size bigint,
  new_checksum text,
  change_description_param text,
  user_id_param uuid
)
RETURNS integer AS $$
DECLARE
  next_version integer;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM file_versions
  WHERE file_upload_id = file_upload_id_param;
  
  INSERT INTO file_versions (
    file_upload_id, version_number, storage_path, file_size, 
    checksum, change_description, changed_by
  ) VALUES (
    file_upload_id_param, next_version, new_storage_path, new_file_size,
    new_checksum, change_description_param, user_id_param
  );
  
  RETURN next_version;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old temp files
CREATE OR REPLACE FUNCTION cleanup_temp_files(
  older_than_hours integer DEFAULT 24
)
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  UPDATE file_uploads
  SET deleted_at = now(),
      upload_status = 'deleted'
  WHERE storage_bucket = 'temp-uploads'
    AND created_at < (now() - (older_than_hours || ' hours')::interval)
    AND deleted_at IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get file statistics
CREATE OR REPLACE FUNCTION get_user_file_stats(
  user_id_param uuid
)
RETURNS TABLE (
  total_files bigint,
  total_size_bytes bigint,
  total_size_mb decimal,
  files_by_type jsonb,
  recent_uploads bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint,
    SUM(file_size)::bigint,
    (SUM(file_size) / 1048576.0)::decimal,
    jsonb_object_agg(file_type, type_count),
    COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::bigint
  FROM (
    SELECT 
      file_type,
      file_size,
      created_at,
      COUNT(*) as type_count
    FROM file_uploads
    WHERE user_id = user_id_param
      AND deleted_at IS NULL
    GROUP BY file_type, file_size, created_at
  ) stats;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically queue AI processing for waste images
CREATE OR REPLACE FUNCTION auto_queue_image_processing()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.storage_bucket = 'waste-images' AND NEW.upload_status = 'completed' THEN
    PERFORM queue_file_processing(
      NEW.id,
      'ai_analysis',
      80,
      '{"analysis_type": "waste_classification"}'::jsonb
    );
    
    PERFORM queue_file_processing(
      NEW.id,
      'thumbnail',
      50,
      '{"width": 300, "height": 300}'::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_queue_image_processing
  AFTER INSERT ON file_uploads
  FOR EACH ROW
  EXECUTE FUNCTION auto_queue_image_processing();

-- Storage bucket configurations (for reference)
-- These would be created via Supabase Dashboard or API
/*
STORAGE BUCKETS:
1. waste-images
   - Public: false
   - File size limit: 10MB
   - Allowed MIME types: image/jpeg, image/png, image/webp
   
2. documents
   - Public: false
   - File size limit: 20MB
   - Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
   
3. profile-avatars
   - Public: true
   - File size limit: 2MB
   - Allowed MIME types: image/jpeg, image/png
   
4. environmental-reports
   - Public: false
   - File size limit: 50MB
   - Allowed MIME types: application/pdf
   
5. temp-uploads
   - Public: false
   - File size limit: 20MB
   - Auto-cleanup: 24 hours
*/