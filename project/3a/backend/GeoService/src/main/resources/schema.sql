CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS locations (
     id SERIAL PRIMARY KEY,
     restaurant_id BIGINT,
     name VARCHAR(100) NOT NULL,
     type VARCHAR(50) NOT NULL,
     latitude DOUBLE PRECISION NOT NULL,
     longitude DOUBLE PRECISION NOT NULL,
     geom geometry(Point, 4326) GENERATED ALWAYS AS (
         ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
         ) STORED
);

CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_locations_restaurant_id ON locations (restaurant_id);

INSERT INTO locations (id, restaurant_id, name, type, latitude, longitude)
VALUES
    (1001, 1001, 'Kanka Peru',          'RESTAURANT',  4.648283,  -74.107807),
    (1002, 1002, 'Kong',                'RESTAURANT',  4.666353,  -74.056624),
    (1003, 1003, 'El Carnal',           'RESTAURANT',  6.208763,  -75.567833),
    (1004, 1004, 'La Susheria',         'RESTAURANT',  4.701594,  -74.041616),
    (1005, 1005, 'Mr Ribs - Parrilla',  'RESTAURANT',  4.683985,  -74.048659),
    (1006, 1006, 'Lopez & Gracia',      'CAFE',        3.451647,  -76.532593),
    (1007, 1007, 'Tortas Deli - Postres','RESTAURANT', 4.620977,  -74.072932),
    (1008, 1008, 'Maikki - Hamburguesa','RESTAURANT', 10.987004,  -74.799316),
    (1009, 1009, 'El Boliche - Pastas', 'RESTAURANT',  4.711000,  -74.072100),
    (1010, 1010, 'Los Pollitos',        'RESTAURANT',  6.251840,  -75.563591),
    (1011, 1011, 'Marea',               'RESTAURANT', 10.391000,  -75.479400),
    (1012, 1012, 'Carbón de Palo',      'RESTAURANT',  7.119300,  -73.122700),
    (1013, 1013, 'El Rancherito',       'RESTAURANT',  4.813300,  -75.696100),
    (1014, 1014, 'Quintonil',           'RESTAURANT', 19.432600,  -99.133200),
    (1015, 1015, 'La Docena',           'RESTAURANT', 20.659700, -103.349600),
    (1016, 1016, 'Don Julio',           'RESTAURANT',-34.603700,  -58.381600),
    (1017, 1017, 'Maido',               'RESTAURANT',-12.046400,  -77.042800),
    (1018, 1018, 'Boragó',              'RESTAURANT',-33.448900,  -70.669300),
    (1019, 1019, 'Tickets',             'RESTAURANT', 41.385100,    2.173400),
    (1020, 1020, 'Sala de Despiece',    'RESTAURANT', 40.416800,   -3.703800),
    (1021, 1021, 'Zuma',                'RESTAURANT', 25.761700,  -80.191800),
    (1022, 1022, 'Cosme',               'RESTAURANT', 40.712800,  -74.006000),
    (1023, 1023, 'Mocotó',              'RESTAURANT',-23.548900,  -46.638800),
    (1024, 1024, 'Brasserie Flo',       'RESTAURANT', 48.858400,    2.294500),
    (1025, 1025, 'Narisawa',            'RESTAURANT', 35.676200,  139.650300)
ON CONFLICT (id) DO NOTHING;

SELECT setval('locations_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM locations), 1));