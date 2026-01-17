-- Add account_type field to bank_accounts table for categorizing accounts
ALTER TABLE public.bank_accounts 
ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'primary';

-- Add is_active field to allow soft-deletion/deactivation
ALTER TABLE public.bank_accounts 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Add description field for additional info
ALTER TABLE public.bank_accounts 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add icon field for visual customization
ALTER TABLE public.bank_accounts 
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'wallet';

-- Create income_sources table for tracking other income sources
CREATE TABLE IF NOT EXISTS public.income_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'monthly', -- monthly, weekly, biweekly, yearly, one-time
  is_active BOOLEAN NOT NULL DEFAULT true,
  color TEXT DEFAULT 'green',
  icon TEXT DEFAULT 'briefcase',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on income_sources
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for income_sources
CREATE POLICY "Users can view their own income sources" 
ON public.income_sources 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income sources" 
ON public.income_sources 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income sources" 
ON public.income_sources 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income sources" 
ON public.income_sources 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates on income_sources
CREATE TRIGGER update_income_sources_updated_at
BEFORE UPDATE ON public.income_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();