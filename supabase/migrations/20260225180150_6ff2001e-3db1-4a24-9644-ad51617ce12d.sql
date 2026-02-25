
-- Chores master table
CREATE TABLE public.chores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  difficulty smallint NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  frequency text NOT NULL DEFAULT 'weekly',
  estimated_minutes smallint NOT NULL DEFAULT 15,
  category text NOT NULL DEFAULT 'other',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read chores
CREATE POLICY "Authenticated users can view chores"
  ON public.chores FOR SELECT TO authenticated
  USING (true);

-- Only admins can manage chores
CREATE POLICY "Admins can insert chores"
  ON public.chores FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update chores"
  ON public.chores FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete chores"
  ON public.chores FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Assigned chores table
CREATE TABLE public.assigned_chores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chore_id uuid NOT NULL REFERENCES public.chores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date date NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  week_start date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assigned_chores ENABLE ROW LEVEL SECURITY;

-- Users can see their own assignments
CREATE POLICY "Users can view own assignments"
  ON public.assigned_chores FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can see all assignments
CREATE POLICY "Admins can view all assignments"
  ON public.assigned_chores FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert assignments
CREATE POLICY "Admins can insert assignments"
  ON public.assigned_chores FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete assignments (for redistribution)
CREATE POLICY "Admins can delete assignments"
  ON public.assigned_chores FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can update their own assignments (mark complete)
CREATE POLICY "Users can update own assignments"
  ON public.assigned_chores FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Admins can update any assignment
CREATE POLICY "Admins can update all assignments"
  ON public.assigned_chores FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed some default chores
INSERT INTO public.chores (name, description, difficulty, frequency, estimated_minutes, category) VALUES
  ('Wash Dishes', 'Wash and dry all dishes in the sink', 1, 'daily', 15, 'kitchen'),
  ('Vacuum Living Room', 'Vacuum the entire living room floor', 2, 'weekly', 30, 'livingRoom'),
  ('Clean Bathroom', 'Scrub toilet, sink, and shower', 3, 'weekly', 45, 'bathroom'),
  ('Take Out Trash', 'Empty all trash cans and take bags to bin', 1, 'daily', 10, 'other'),
  ('Mop Kitchen Floor', 'Sweep and mop the kitchen floor', 2, 'weekly', 25, 'kitchen'),
  ('Clean Windows', 'Wipe down all windows inside', 2, 'monthly', 40, 'other'),
  ('Do Laundry', 'Wash, dry, and fold shared laundry', 2, 'weekly', 60, 'other'),
  ('Grocery Shopping', 'Buy weekly groceries from the list', 2, 'weekly', 60, 'other');
