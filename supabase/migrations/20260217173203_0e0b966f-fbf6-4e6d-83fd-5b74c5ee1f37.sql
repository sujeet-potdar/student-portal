
-- Opportunities table (admin-created)
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  min_cgpa NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view opportunities
CREATE POLICY "Authenticated users can view opportunities"
ON public.opportunities FOR SELECT TO authenticated
USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert opportunities"
ON public.opportunities FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete opportunities"
ON public.opportunities FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  cgpa NUMERIC(3,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(opportunity_id, user_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Students can view own applications
CREATE POLICY "Users can view own applications"
ON public.applications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.applications FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Students can insert own applications
CREATE POLICY "Users can insert own applications"
ON public.applications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- CGPA validation trigger (backend enforcement)
CREATE OR REPLACE FUNCTION public.validate_application_cgpa()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  required_cgpa NUMERIC(3,2);
BEGIN
  SELECT min_cgpa INTO required_cgpa
  FROM public.opportunities
  WHERE id = NEW.opportunity_id;

  IF NEW.cgpa < required_cgpa THEN
    RAISE EXCEPTION 'CGPA % does not meet the minimum requirement of %', NEW.cgpa, required_cgpa;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER check_application_cgpa
BEFORE INSERT ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.validate_application_cgpa();
