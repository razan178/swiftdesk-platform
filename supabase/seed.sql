-- ============================================================================
-- OPTIONAL demo data — NOT real inventory.
-- Run this only if you want a few sample products to see how the store looks
-- populated. Delete them anytime from the admin dashboard, or run the "clean
-- up" statement at the bottom. Photos are intentionally left empty so the app
-- shows its built-in placeholder (add real photos via the admin panel).
-- ============================================================================

insert into public.products (name, brand, category, gender, size, price, condition, description, status) values
  ('Air Max 90 "Grey Suede"', 'Nike', 'Sneakers', 'Men', '42', 6500, 'Excellent', 'Clean pair, minimal wear on the soles. A timeless silhouette.', 'available'),
  ('Ultraboost Runners', 'Adidas', 'Sports Shoes', 'Unisex', '40', 5200, 'Good', 'Super comfortable daily trainer. Some creasing but plenty of life left.', 'available'),
  ('Chelsea Leather Boots', 'Zara', 'Boots', 'Women', '38', 4500, 'Like New', 'Barely worn. Perfect for autumn fits.', 'available'),
  ('Classic Oxford Formals', 'Bata', 'Formal Shoes', 'Men', '43', 3200, 'Good', 'Solid formal pair for the office or events.', 'available'),
  ('Chuck Taylor All-Star', 'Converse', 'Sneakers', 'Unisex', '39', 2800, 'Fair', 'Well-loved but characterful. Great budget grab.', 'available'),
  ('Retro Running Trainers', 'New Balance', 'Sports Shoes', 'Women', '37', 4900, 'Excellent', 'That dad-shoe look everyone wants. Fresh condition.', 'sold');

-- Clean up demo data (uncomment and run to remove):
-- delete from public.products where brand in ('Nike','Adidas','Zara','Bata','Converse','New Balance') and images = '{}';
