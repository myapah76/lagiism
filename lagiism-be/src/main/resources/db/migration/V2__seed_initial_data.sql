-- ==============================================================================
-- V2__seed_initial_data.sql
-- Initial LAGIISM Drop 01 CMS, Categories, Settings & Catalog Seed
-- ==============================================================================

INSERT INTO cms_heroes (headline, subheadline, badge_text, primary_cta_label, secondary_cta_label, image_url, active)
VALUES (
    'LAGIISM // DROP 01',
    'EST. 2026 | LA GI, BÌNH THUẬN & TP.HCM',
    'NEW ARRIVALS // 10°39''40"N 107°46''22"E',
    'EXPLORE DROP 01',
    'SHOP THE SET',
    '/src/assets/images/hero_campaign_lagi_1795607741441.jpg',
    TRUE
);

INSERT INTO cms_sections (section_key, title, subtitle, content, image_url, sort_order, active)
VALUES
    ('about_manifesto',
     'LA GI COASTAL GRIT MEETS SAIGON ASPHALT',
     'LAGIISM — EST. 2026 | LA GI, BÌNH THUẬN & TP.HCM',
     'Founded in 2026 between the salt-corroded concrete seawalls of La Gi, Bình Thuận and the dense midnight asphalt of Ho Chi Minh City, LAGIISM constructs stripped-back streetwear uniforms engineered for heat, monsoon, and abrasion.',
     '/src/assets/images/hero_campaign_lagi_1795607741441.jpg',
     1, TRUE),
    ('lookbook_saigon',
     'LOOK 02 — QUẬN 1 ASPHALT ARCHIVE',
     '10°46''37"N 106°42''03"E',
     'Drop 01 documents the physical tension between coastal stillness and urban motion—delivered as modular tops, wide-silhouette trousers, and weather-sealed shells.',
     '/src/assets/images/lookbook_saigon_skate_1795607747130.jpg',
     2, TRUE);

INSERT INTO cms_reviews (author_name, author_location, rating, comment, featured, sort_order)
VALUES
    ('MINH K.', 'TP.HCM', 5, '280GSM boxy tee holds its architectural shoulder line even after heavy Saigon humidity.', TRUE, 1),
    ('HUY T.', 'LA GI, BÌNH THUẬN', 5, 'The 14oz raw selvedge wide-leg denim stacks cleanly over skate shoes. Zero excess branding.', TRUE, 2),
    ('LINH N.', 'ĐÀ NẴNG', 5, 'Technical Seawall Shell handles coastal rain effortlessly. Clinical packaging and exact sizing.', TRUE, 3);

INSERT INTO site_settings (setting_key, setting_value, description)
VALUES
    ('brand_name', 'LAGIISM', 'Primary brand name'),
    ('brand_established', 'EST. 2026', 'Establishment label'),
    ('brand_locations', 'LA GI, BÌNH THUẬN & TP.HCM', 'Origin locations'),
    ('brand_coordinates', '10°39''40"N 107°46''22"E', 'Primary coordinates'),
    ('drop_label', 'DROP 01 // NEW COLLECTION', 'Current drop label'),
    ('footer_copyright', '© 2026 LAGIISM ARCHIVE. ALL RIGHTS RESERVED.', 'Footer copyright text'),
    ('contact_email', 'studio@lagiism.com', 'Public studio contact email');

INSERT INTO categories (code, title, subtitle, image_url, sort_order, active)
VALUES
    ('TEES', 'TEES & TOPS', '280–330 GSM HEAVY JERSEY', '/src/assets/images/tee_boxy_washed_black_1795607742483.jpg', 1, TRUE),
    ('DENIM', 'RAW DENIM', '14 OZ SELVEDGE & CARPENTER', '/src/assets/images/denim_raw_wide_indigo_1795607742352.jpg', 2, TRUE),
    ('OUTERWEAR', 'OUTERWEAR', 'TECHNICAL SHELL & 500GSM FLEECE', '/src/assets/images/outerwear_shell_jacket_1795607744107.jpg', 3, TRUE),
    ('ACCESSORIES', 'ACCESSORIES', 'WAXED CANVAS CARRY', '/src/assets/images/accessory_canvas_tote_1795607745951.jpg', 4, TRUE);

INSERT INTO products (
    slug, sku, name, name_vi, price_vnd, category_code, set_slot,
    color_name, color_hex, sizes_csv, image_url, secondary_image_url,
    glb_model_slot, description, gsm, fabric, fit, origin, coordinates, badge_text, active, sort_order
)
VALUES
    ('lg-tee-01', 'LG-D01-T01', 'LAGIISM BOXY WASHED TEE', 'ÁO THUN BOXY WASHED ĐEN BẠC', 450000, 'TEES', 'TOP',
     'WASHED CHARCOAL', '#2C2C2E', 'S,M,L,XL',
     '/src/assets/images/tee_boxy_washed_black_1795607742483.jpg', '/src/assets/images/hero_campaign_lagi_1795607741441.jpg',
     '/models/lg_boxy_washed_tee.glb',
     'Dropped-shoulder boxy silhouette enzyme-washed to replicate sun-bleached La Gi coastal concrete. Cut from dense 280GSM combed Vietnamese cotton with reinforced rib collar.',
     '280 GSM HEAVY JERSEY', '100% ENZYME-WASHED COTTON', 'ARCHITECTURAL BOXY / CROPPED', 'LA GI — TP.HCM, VN', '10°39''40"N 107°46''22"E', 'DROP 01', TRUE, 1),

    ('lg-tee-02', 'LG-D01-T02', 'COASTAL RAW SEAM L/S', 'ÁO DÀI TAY ĐƯỜNG MAY THÔ', 520000, 'TEES', 'TOP',
     'CONCRETE ASH', '#8E8E8B', 'S,M,L,XL',
     '/src/assets/images/tee_coastal_acid_ash_1795607742449.jpg', '/src/assets/images/hero_campaign_lagi_1795607741441.jpg',
     '/models/lg_coastal_raw_ls.glb',
     'Overdyed bone-ash long-sleeve jersey featuring inverted raw-edge shoulder seams that fray naturally through wear and salt air.',
     '310 GSM INTERLOCK KNIT', '100% PIGMENT-DYED COTTON', 'OVERSIZED / DROPPED SLEEVE', 'LA GI — TP.HCM, VN', '10°39''40"N 107°46''22"E', NULL, TRUE, 2),

    ('lg-tee-03', 'LG-D01-T03', 'ASPHALT MOCK-NECK TOP', 'ÁO MOCK-NECK NHỰA ĐƯỜNG', 490000, 'TEES', 'TOP',
     'PITCH ASPHALT', '#18181A', 'S,M,L,XL',
     '/src/assets/images/tee_longsleeve_asphalt_1795607743160.jpg', '/src/assets/images/lookbook_saigon_skate_1795607747130.jpg',
     '/models/lg_asphalt_mockneck.glb',
     'High-collar structured jersey designed for Saigon night transit. Clean concealed cuff construction and boxy drape.',
     '330 GSM DOUBLE JERSEY', '95% COTTON / 5% ELASTANE', 'RELAXED ARCHITECTURAL', 'TP.HCM ATELIER, VN', '10°46''37"N 106°42''03"E', NULL, TRUE, 3),

    ('lg-denim-01', 'LG-D01-D01', 'RAW WIDE-LEG SELVEDGE DENIM', 'QUẦN JEAN ỐNG RỘNG SELVEDGE', 850000, 'DENIM', 'BOTTOM',
     'RAW INDIGO', '#1B2436', 'S,M,L,XL',
     '/src/assets/images/denim_raw_wide_indigo_1795607742352.jpg', '/src/assets/images/hero_campaign_lagi_1795607741441.jpg',
     '/models/lg_raw_wide_denim.glb',
     'Unwashed 14oz rigid indigo denim cut with double front pleats and monolithic wide-leg volume designed to stack cleanly over skate footwear.',
     '14 OZ RIGID SELVEDGE', '100% UNWASHED COTTON DENIM', 'ULTRA WIDE / DOUBLE PLEATED', 'BÌNH THUẬN — TP.HCM, VN', '10°39''40"N 107°46''22"E', '14OZ RAW', TRUE, 4),

    ('lg-denim-02', 'LG-D01-D02', 'ABRASION CARPENTER DENIM', 'QUẦN DENIM CARPENTER MÀI XÁM', 880000, 'DENIM', 'BOTTOM',
     'WASHED CONCRETE', '#636568', 'S,M,L,XL',
     '/src/assets/images/denim_washed_concrete_1795607743568.jpg', '/src/assets/images/lookbook_saigon_skate_1795607747130.jpg',
     '/models/lg_abrasion_carpenter.glb',
     'Stone-washed slate carpenter trousers with utility pocket architecture, hammer loop, and controlled Saigon asphalt distressing.',
     '13.5 OZ STONE-WASH DENIM', '100% HEAVY TWILL DENIM', 'WIDE SKATE CUT', 'TP.HCM ATELIER, VN', '10°46''37"N 106°42''03"E', NULL, TRUE, 5),

    ('lg-outer-01', 'LG-D01-O01', 'TECHNICAL SEAWALL SHELL JACKET', 'ÁO KHOÁC TECHNICAL SEAWALL', 900000, 'OUTERWEAR', 'TOP',
     'MATTE BLACK', '#0E0E10', 'S,M,L,XL',
     '/src/assets/images/outerwear_shell_jacket_1795607744107.jpg', '/src/assets/images/hero_campaign_lagi_1795607741441.jpg',
     '/models/lg_seawall_shell.glb',
     'Cropped windproof matte nylon shell built for coastal squalls and tropical downpours. Features stand funnel collar and concealed storm placket.',
     '240 GSM RIPSTOP NYLON', '100% DWR COATED NYLON', 'CROPPED BOXY SHELL', 'LA GI — TP.HCM, VN', '10°39''40"N 107°46''22"E', 'LIMITED', TRUE, 6),

    ('lg-outer-02', 'LG-D01-O02', '500GSM FADED ZIP HOODIE', 'ÁO HOODIE ZIP 500GSM BẠC MÀU', 780000, 'OUTERWEAR', 'TOP',
     'SUN-FADED SLATE', '#434446', 'S,M,L,XL',
     '/src/assets/images/outerwear_heavy_hoodie_1795607744797.jpg', '/src/assets/images/lookbook_saigon_skate_1795607747130.jpg',
     '/models/lg_faded_zip_hoodie.glb',
     'Heavyweight French terry zip-through hoodie featuring two-way oxidized metal zipper, double-layered structured hood, and sun-faded wash.',
     '500 GSM FRENCH TERRY', '100% LOOPBACK COTTON', 'BOXY DROPPED SHOULDER', 'TP.HCM ATELIER, VN', '10°46''37"N 106°42''03"E', NULL, TRUE, 7),

    ('lg-acc-01', 'LG-D01-A01', 'WAXED CANVAS UTILITY TOTE', 'TÚI TOTE CANVAS ĐEN CHỐNG NƯỚC', 420000, 'ACCESSORIES', 'NONE',
     'WAXED BLACK', '#141414', 'S,M,L,XL',
     '/src/assets/images/accessory_canvas_tote_1795607745951.jpg', '/src/assets/images/hero_campaign_lagi_1795607741441.jpg',
     '/models/lg_waxed_tote.glb',
     'Architectural cross-body utility tote built from 18oz dry-waxed canvas with industrial webbing strap and matte hardware.',
     '18 OZ WAXED CANVAS', '100% PARAFFIN COTTON CANVAS', 'ONE SIZE (42 × 38 × 14 CM)', 'LA GI — TP.HCM, VN', '10°39''40"N 107°46''22"E', NULL, TRUE, 8);
