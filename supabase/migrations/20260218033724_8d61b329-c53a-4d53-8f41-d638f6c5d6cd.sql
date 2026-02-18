-- Allow admins to update application status
CREATE POLICY "Admins can update application status"
ON public.applications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));