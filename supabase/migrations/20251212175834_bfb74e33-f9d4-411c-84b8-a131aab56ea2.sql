-- Create linkedin_accounts table for storing OAuth tokens
CREATE TABLE public.linkedin_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  linkedin_user_id TEXT,
  name TEXT,
  profile_url TEXT,
  avatar_url TEXT,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create linkedin_posts table for content portfolio
CREATE TABLE public.linkedin_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.linkedin_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_index INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'scheduled', 'published', 'failed')),
  published_at TIMESTAMP WITH TIME ZONE,
  linkedin_post_id TEXT,
  engagement_likes INTEGER DEFAULT 0,
  engagement_comments INTEGER DEFAULT 0,
  engagement_shares INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create linkedin_listening table for active monitoring
CREATE TABLE public.linkedin_listening (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.linkedin_accounts(id) ON DELETE CASCADE,
  source_url TEXT,
  source_author TEXT,
  source_content TEXT,
  detected_topic TEXT,
  relevance_score DECIMAL(3,2) DEFAULT 0,
  action_taken TEXT CHECK (action_taken IN ('commented', 'posted', 'pending', 'ignored')),
  response_content TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  actioned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create linkedin_activity_logs table
CREATE TABLE public.linkedin_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.linkedin_accounts(id) ON DELETE CASCADE,
  log_type TEXT NOT NULL CHECK (log_type IN ('success', 'error', 'warning', 'info')),
  action TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create linkedin_settings table
CREATE TABLE public.linkedin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.linkedin_accounts(id) ON DELETE CASCADE UNIQUE,
  auto_post_enabled BOOLEAN DEFAULT true,
  post_start_hour INTEGER DEFAULT 6,
  post_end_hour INTEGER DEFAULT 22,
  post_interval_minutes INTEGER DEFAULT 60,
  min_posts_ready INTEGER DEFAULT 10,
  listening_keywords TEXT[] DEFAULT ARRAY['NR01', 'riscos psicossociais', 'saúde mental trabalho', 'bem-estar corporativo'],
  auto_comment_enabled BOOLEAN DEFAULT true,
  auto_promote_enabled BOOLEAN DEFAULT true,
  last_post_at TIMESTAMP WITH TIME ZONE,
  next_scheduled_post TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.linkedin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_listening ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for linkedin_accounts
CREATE POLICY "Users can view their own LinkedIn accounts"
ON public.linkedin_accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own LinkedIn accounts"
ON public.linkedin_accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LinkedIn accounts"
ON public.linkedin_accounts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LinkedIn accounts"
ON public.linkedin_accounts FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for linkedin_posts (via account ownership)
CREATE POLICY "Users can view their own posts"
ON public.linkedin_posts FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.linkedin_accounts 
  WHERE id = linkedin_posts.account_id AND user_id = auth.uid()
));

CREATE POLICY "Users can insert their own posts"
ON public.linkedin_posts FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.linkedin_accounts 
  WHERE id = linkedin_posts.account_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update their own posts"
ON public.linkedin_posts FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.linkedin_accounts 
  WHERE id = linkedin_posts.account_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete their own posts"
ON public.linkedin_posts FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.linkedin_accounts 
  WHERE id = linkedin_posts.account_id AND user_id = auth.uid()
));

-- Create policies for linkedin_listening
CREATE POLICY "Users can view their own listening data"
ON public.linkedin_listening FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.linkedin_accounts 
  WHERE id = linkedin_listening.account_id AND user_id = auth.uid()
));

CREATE POLICY "Users can manage their own listening data"
ON public.linkedin_listening FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.linkedin_accounts 
  WHERE id = linkedin_listening.account_id AND user_id = auth.uid()
));

-- Create policies for linkedin_activity_logs
CREATE POLICY "Users can view their own logs"
ON public.linkedin_activity_logs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.linkedin_accounts 
  WHERE id = linkedin_activity_logs.account_id AND user_id = auth.uid()
));

CREATE POLICY "Users can insert their own logs"
ON public.linkedin_activity_logs FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.linkedin_accounts 
  WHERE id = linkedin_activity_logs.account_id AND user_id = auth.uid()
));

-- Create policies for linkedin_settings
CREATE POLICY "Users can view their own settings"
ON public.linkedin_settings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.linkedin_accounts 
  WHERE id = linkedin_settings.account_id AND user_id = auth.uid()
));

CREATE POLICY "Users can manage their own settings"
ON public.linkedin_settings FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.linkedin_accounts 
  WHERE id = linkedin_settings.account_id AND user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_linkedin_accounts_updated_at
BEFORE UPDATE ON public.linkedin_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_linkedin_posts_updated_at
BEFORE UPDATE ON public.linkedin_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_linkedin_settings_updated_at
BEFORE UPDATE ON public.linkedin_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for activity logs and listening
ALTER PUBLICATION supabase_realtime ADD TABLE public.linkedin_activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.linkedin_listening;