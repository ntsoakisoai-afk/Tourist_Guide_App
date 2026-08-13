const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON request bodies
app.use(express.json());

// Serve frontend files from the public folder
app.use(express.static(path.join(__dirname, 'public')));


// Sample destination data
// These are inserted into SQLite if they do not already exist
const hardCodedDestinations = [
    {
        name: 'Central Park',
        description: 'A large public park in New York City with walking trails and lakes',
        category: 'sightseeing',
        location: 'New York, USA',
        rating: 5
    },
    {
        name: 'Tsukiji Outer Market',
        description: 'Famous street food market with fresh seafood and local delicacies',
        category: 'food',
        location: 'Tokyo, Japan',
        rating: 4
    },
    {
        name: 'Berghain',
        description: 'Legendary techno nightclub known for its industrial setting',
        category: 'nightlife',
        location: 'Berlin, Germany',
        rating: 5
    },
    {
        name: 'Eiffel Tower',
        description: 'Iconic iron tower with panoramic city views from observation decks',
        category: 'sightseeing',
        location: 'Paris, France',
        rating: 5
    },
    {
        name: 'Borough Market',
        description: 'Historic food market with artisan producers and street food stalls',
        category: 'food',
        location: 'London, UK',
        rating: 4
    },
    {
        name: 'Skybar Lebua',
        description: 'Rooftop bar with stunning city views from one of Bangkok’s tallest buildings',
        category: 'nightlife',
        location: 'Bangkok, Thailand',
        rating: 4
    }
];


// Insert the sample destinations into SQLite
// only if they are not already present
const insertDestination = db.prepare(`
    INSERT INTO destinations
    (name, description, category, location, rating)
    VALUES (?, ?, ?, ?, ?)
`);

for (const destination of hardCodedDestinations) {

    const existing = db.prepare(`
        SELECT id
        FROM destinations
        WHERE name = ?
    `).get(destination.name);

    if (!existing) {
        insertDestination.run(
            destination.name,
            destination.description,
            destination.category,
            destination.location,
            destination.rating
        );
    }
}


// GET destinations with optional category and search filters
app.get('/api/destinations', (req, res) => {
    try {

        const { category, search } = req.query;

        let query = `
            SELECT *
            FROM destinations
            WHERE 1 = 1
        `;

        const params = [];


        // Category filter
        if (category && category !== 'all') {

            query += `
                AND category = ?
            `;

            params.push(category);
        }


        // Search filter
        if (search && search.trim() !== '') {

            query += `
                AND (
                    name LIKE ?
                    OR description LIKE ?
                    OR location LIKE ?
                )
            `;

            const searchTerm = `%${search.trim()}%`;

            params.push(searchTerm);
            params.push(searchTerm);
            params.push(searchTerm);
        }


        // Sort results
        query += `
            ORDER BY id ASC
        `;


        // Run SQLite query
        const destinations = db
            .prepare(query)
            .all(...params);


        res.json(destinations);

    } catch (error) {

        console.error('Error fetching destinations:', error);

        res.status(500).json({
            error: 'Failed to fetch destinations'
        });
    }
});

// POST a new destination
app.post('/api/destinations', (req, res) => {
    try {

        const {
            name,
            description,
            category,
            location,
            rating
        } = req.body;

        // Basic validation
        if (
            !name ||
            !description ||
            !category ||
            !location ||
            rating === undefined
        ) {
            return res.status(400).json({
                error: 'All destination fields are required'
            });
        }

        const numericRating = Number(rating);

        if (
            Number.isNaN(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                error: 'Rating must be a number between 1 and 5'
            });
        }


        // Make sure the category is valid
        const allowedCategories = [
            'food',
            'sightseeing',
            'nightlife'
        ];

        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                error: 'Invalid category'
            });
        }


        // Save the destination to SQLite
        const result = db.prepare(`
            INSERT INTO destinations
            (name, description, category, location, rating)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            name,
            description,
            category,
            location,
            numericRating
        );


        // Get the newly created destination
        const newDestination = db
            .prepare(`
                SELECT *
                FROM destinations
                WHERE id = ?
            `)
            .get(result.lastInsertRowid);


        res.status(201).json(newDestination);

    } catch (error) {

        console.error('Error adding destination:', error);

        res.status(500).json({
            error: 'Failed to add destination'
        });
    }
});


// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(
        `Tourist Guide server running at http://localhost:${PORT}`
    );
});
