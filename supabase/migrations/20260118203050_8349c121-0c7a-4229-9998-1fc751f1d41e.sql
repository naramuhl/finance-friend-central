-- Create table for patrimony history snapshots
CREATE TABLE public.patrimony_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_balance NUMERIC NOT NULL DEFAULT 0,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- Enable Row Level Security
ALTER TABLE public.patrimony_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own patrimony history" 
ON public.patrimony_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own patrimony history" 
ON public.patrimony_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patrimony history" 
ON public.patrimony_history 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_patrimony_history_user_date ON public.patrimony_history(user_id, snapshot_date DESC);