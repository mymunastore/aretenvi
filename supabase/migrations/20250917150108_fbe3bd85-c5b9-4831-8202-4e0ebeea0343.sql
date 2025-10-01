-- Allow anonymous users to create live chat conversations
CREATE POLICY "Anonymous users can create live chat conversations"
ON public.support_conversations
FOR INSERT
TO anon
WITH CHECK (
  (metadata->>'channel' = 'live_chat')
);

-- Allow anonymous users to view their own live chat conversations
CREATE POLICY "Anonymous users can view live chat conversations"
ON public.support_conversations
FOR SELECT
TO anon
USING (
  (metadata->>'channel' = 'live_chat') AND
  (metadata->>'session_id' = current_setting('request.headers', true)::json->>'x-session-id')
);

-- Allow anonymous users to send messages in live chat conversations
CREATE POLICY "Anonymous users can send live chat messages"
ON public.support_messages
FOR INSERT
TO anon
WITH CHECK (
  conversation_id IN (
    SELECT id FROM support_conversations 
    WHERE metadata->>'channel' = 'live_chat'
    AND metadata->>'session_id' = current_setting('request.headers', true)::json->>'x-session-id'
  )
);

-- Allow anonymous users to view live chat messages
CREATE POLICY "Anonymous users can view live chat messages"
ON public.support_messages
FOR SELECT
TO anon
USING (
  conversation_id IN (
    SELECT id FROM support_conversations 
    WHERE metadata->>'channel' = 'live_chat'
    AND metadata->>'session_id' = current_setting('request.headers', true)::json->>'x-session-id'
  )
);