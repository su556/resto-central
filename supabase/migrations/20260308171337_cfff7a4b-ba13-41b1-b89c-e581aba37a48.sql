
-- Restaurants table
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tagline text,
  description text,
  phone text,
  address text,
  rating numeric DEFAULT 4.5,
  review_count integer DEFAULT 0,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Restaurant admins linking table (create BEFORE policies that reference it)
CREATE TABLE public.restaurant_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

ALTER TABLE public.restaurant_admins ENABLE ROW LEVEL SECURITY;

-- Now create policies for both tables
CREATE POLICY "Public can view restaurants" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Restaurant admins can update their restaurant" ON public.restaurants FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurant_admins ra WHERE ra.restaurant_id = restaurants.id AND ra.user_id = auth.uid()));
CREATE POLICY "Super admins full access restaurants" ON public.restaurants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view restaurant_admins" ON public.restaurant_admins FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Super admins manage restaurant_admins" ON public.restaurant_admins FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Dishes table
CREATE TABLE public.dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text NOT NULL DEFAULT 'Main Course',
  image_url text,
  is_veg boolean NOT NULL DEFAULT true,
  is_popular boolean NOT NULL DEFAULT false,
  rating numeric DEFAULT 4.0,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view available dishes" ON public.dishes FOR SELECT USING (true);
CREATE POLICY "Restaurant admins can manage dishes" ON public.dishes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurant_admins ra WHERE ra.restaurant_id = dishes.restaurant_id AND ra.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurant_admins ra WHERE ra.restaurant_id = dishes.restaurant_id AND ra.user_id = auth.uid()));
CREATE POLICY "Super admins manage all dishes" ON public.dishes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  address text NOT NULL,
  total numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  rider_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own orders" ON public.orders FOR SELECT TO authenticated
  USING (customer_id = auth.uid());
CREATE POLICY "Customers can insert orders" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Restaurant admins can view their orders" ON public.orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurant_admins ra WHERE ra.restaurant_id = orders.restaurant_id AND ra.user_id = auth.uid()));
CREATE POLICY "Restaurant admins can update their orders" ON public.orders FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurant_admins ra WHERE ra.restaurant_id = orders.restaurant_id AND ra.user_id = auth.uid()));
CREATE POLICY "Riders can view assigned orders" ON public.orders FOR SELECT TO authenticated
  USING (rider_id = auth.uid() OR (status = 'preparing' AND rider_id IS NULL AND public.has_role(auth.uid(), 'rider')));
CREATE POLICY "Riders can update assigned orders" ON public.orders FOR UPDATE TO authenticated
  USING (rider_id = auth.uid() AND public.has_role(auth.uid(), 'rider'));
CREATE POLICY "Super admins manage all orders" ON public.orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Order items table
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  dish_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price numeric NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order items follow order access" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (
    o.customer_id = auth.uid() OR o.rider_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.restaurant_admins ra WHERE ra.restaurant_id = o.restaurant_id AND ra.user_id = auth.uid()) 
    OR public.has_role(auth.uid(), 'admin')
  )));
CREATE POLICY "Customers can insert order items" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));

-- Offers table
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  discount_percent numeric NOT NULL,
  min_order numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  valid_until date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Restaurant admins can manage offers" ON public.offers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurant_admins ra WHERE ra.restaurant_id = offers.restaurant_id AND ra.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurant_admins ra WHERE ra.restaurant_id = offers.restaurant_id AND ra.user_id = auth.uid()));
CREATE POLICY "Super admins manage all offers" ON public.offers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Helper function: get admin's restaurant_id
CREATE OR REPLACE FUNCTION public.get_my_restaurant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT restaurant_id FROM public.restaurant_admins WHERE user_id = auth.uid() LIMIT 1
$$;
