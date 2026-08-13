const Database = require('better-sqlite3');

const db = new Database('tourist_guide.db');

// Create the destinations table if it does not already exist
db.exec(`
    CREATE TABLE IF NOT EXISTS destinations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL
            CHECK (category IN ('food', 'sightseeing', 'nightlife')),
        location TEXT NOT NULL,
        rating INTEGER NOT NULL
            CHECK (rating >= 1 AND rating <= 5)
    )
`);

// Seed sample destinations if the database is empty
const count = db
    .prepare('SELECT COUNT(*) AS count FROM destinations')
    .get();

if (count.count === 0) {
    const insert = db.prepare(`
        INSERT INTO destinations
        (name, description, category, location, rating)
        VALUES (?, ?, ?, ?, ?)
    `);

    const sampleDestinations = [
        [
            'Central Park',
            'A large public park in New York City with walking trails and lakes',
            'sightseeing',
            'New York, USA',
            5
        ],
        [
            'Tsukiji Outer Market',
            'Famous street food market with fresh seafood and local delicacies',
            'food',
            'Tokyo, Japan',
            4
        ],
        [
            'Berghain',
            'Legendary techno nightclub known for its industrial setting',
            'nightlife',
            'Berlin, Germany',
            5
        ],
        [
            'Eiffel Tower',
            'Iconic iron tower with panoramic city views from observation decks',
            'sightseeing',
            'Paris, France',
            5
        ],
        [
            'Borough Market',
            'Historic food market with artisan producers and street food stalls',
            'food',
            'London, UK',
            4
        ],
        [
            'Skybar Lebua',
            'Rooftop bar on the 63rd floor with stunning city views',
            'nightlife',
            'Bangkok, Thailand',
            4
        ]
    ];

    const insertMany = db.transaction((destinations) => {
        for (const destination of destinations) {
            insert.run(...destination);
        }
    });

    insertMany(sampleDestinations);

    console.log('Database seeded with sample destinations');
}

module.exports = db;