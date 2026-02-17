const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Movie = require('./models/Movie');
const Show = require('./models/Show');

const movies = [
    // Movies
    {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
        poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
        trailer: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        duration: 166,
        rating: 8.8,
        releaseDate: new Date('2024-03-01'),
        format: { is3D: true, is4K: true, isIMAX: true, isDolby: true }
    },
    {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
        poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
        trailer: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        genre: ['Drama', 'History', 'Biography'],
        duration: 180,
        rating: 8.9,
        releaseDate: new Date('2023-07-21'),
        format: { is3D: false, is4K: true, isIMAX: true, isDolby: true }
    },
    {
        title: 'The Batman',
        description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate.',
        poster: 'https://m.media-amazon.com/images/M/MV5BMmU5NGJlMzAtMGNmOC00YjJjLTgyMzUtNjAyYmE4Njg5YWMyXkEyXkFqcGc@._V1_.jpg',
        backdrop: 'https://images.alphacoders.com/121/1213863.jpg',
        trailer: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
        genre: ['Action', 'Crime', 'Drama'],
        duration: 176,
        rating: 8.1,
        releaseDate: new Date('2022-03-04'),
        format: { is3D: false, is4K: true, isIMAX: true, isDolby: true }
    },
    {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
        trailer: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        genre: ['Sci-Fi', 'Drama', 'Adventure'],
        duration: 169,
        rating: 8.7,
        releaseDate: new Date('2014-11-07'),
        format: { is3D: false, is4K: true, isIMAX: true, isDolby: true }
    },
    {
        title: 'Avatar: The Way of Water',
        description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.',
        poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
        trailer: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        duration: 192,
        rating: 7.8,
        releaseDate: new Date('2022-12-16'),
        format: { is3D: true, is4K: true, isIMAX: true, isDolby: true }
    },
    {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People.',
        poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
        trailer: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        genre: ['Animation', 'Action', 'Adventure'],
        duration: 140,
        rating: 8.7,
        releaseDate: new Date('2023-06-02'),
        format: { is3D: true, is4K: true, isIMAX: false, isDolby: true }
    },

    // TV Series
    {
        title: 'Mr. Robot',
        description: 'Elliot, a brilliant but highly unstable young cyber-security engineer becomes a key figure in a complex game of global dominance.',
        poster: 'https://image.tmdb.org/t/p/w500/oKIBhzZzDX07SoE2bOLhq2EE8rf.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/mo0FP1GxOFZT4UDde7RFDz5APXF.jpg',
        trailer: 'https://www.youtube.com/watch?v=xIBiJ_SzJTA',
        genre: ['Drama', 'Thriller', 'Crime'],
        duration: 45,
        rating: 8.7,
        releaseDate: new Date('2015-06-24'),
        format: { is3D: false, is4K: true, isIMAX: false, isDolby: true }
    },
    {
        title: 'Peaky Blinders',
        description: 'A gangster family epic set in 1900s England, centering on a gang who sew razor blades in the peaks of their caps.',
        poster: 'https://picsum.photos/seed/peakyblinders/300/450',
        backdrop: 'https://picsum.photos/seed/peakyblinders/1280/720',
        trailer: 'https://www.youtube.com/watch?v=oVzVdvGIC7U',
        genre: ['Drama', 'Crime', 'History'],
        duration: 60,
        rating: 8.8,
        releaseDate: new Date('2013-09-12'),
        format: { is3D: false, is4K: true, isIMAX: false, isDolby: true }
    },
    {
        title: 'Game of Thrones',
        description: 'Nine noble families wage war against each other in order to gain control over the mythical land of Westeros.',
        poster: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
        trailer: 'https://www.youtube.com/watch?v=KPLWWIOCOOQ',
        genre: ['Drama', 'Fantasy', 'Adventure'],
        duration: 60,
        rating: 9.3,
        releaseDate: new Date('2011-04-17'),
        format: { is3D: false, is4K: true, isIMAX: false, isDolby: true }
    },
    {
        title: 'Breaking Bad',
        description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
        poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
        trailer: 'https://www.youtube.com/watch?v=HhesaQXLuRY',
        genre: ['Drama', 'Crime', 'Thriller'],
        duration: 47,
        rating: 9.5,
        releaseDate: new Date('2008-01-20'),
        format: { is3D: false, is4K: true, isIMAX: false, isDolby: true }
    },
    {
        title: 'The Walking Dead',
        description: 'Sheriff Deputy Rick Grimes wakes up from a coma to learn the world is in ruins and must lead a group of survivors.',
        poster: 'https://picsum.photos/seed/walkingdead/300/450',
        backdrop: 'https://picsum.photos/seed/walkingdead/1280/720',
        trailer: 'https://www.youtube.com/watch?v=R1v0uFms68U',
        genre: ['Drama', 'Horror', 'Thriller'],
        duration: 44,
        rating: 8.1,
        releaseDate: new Date('2010-10-31'),
        format: { is3D: false, is4K: true, isIMAX: false, isDolby: true }
    },
    {
        title: 'House of the Dragon',
        description: 'The story of the Targaryen civil war that took place about 200 years before the events of Game of Thrones.',
        poster: 'https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg',
        trailer: 'https://www.youtube.com/watch?v=DotnJ7tTA34',
        genre: ['Drama', 'Fantasy', 'Action'],
        duration: 60,
        rating: 8.5,
        releaseDate: new Date('2022-08-21'),
        format: { is3D: false, is4K: true, isIMAX: false, isDolby: true }
    },
    {
        title: 'A Knight of the Seven Kingdoms',
        description: 'Set a century before the events of Game of Thrones, the series follows the adventures of Ser Duncan the Tall.',
        poster: 'https://picsum.photos/seed/knightseven/300/450',
        backdrop: 'https://picsum.photos/seed/knightseven/1280/720',
        trailer: 'https://www.youtube.com/watch?v=GD4V2PT37SE',
        genre: ['Drama', 'Fantasy', 'Adventure'],
        duration: 60,
        rating: 8.0,
        releaseDate: new Date('2025-01-26'),
        format: { is3D: false, is4K: true, isIMAX: false, isDolby: true }
    },
    {
        title: 'Stranger Things',
        description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.',
        poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEJHVHnvgz.jpg',
        trailer: 'https://www.youtube.com/watch?v=b9EkMc79ZSU',
        genre: ['Drama', 'Fantasy', 'Horror'],
        duration: 51,
        rating: 8.7,
        releaseDate: new Date('2016-07-15'),
        format: { is3D: false, is4K: true, isIMAX: false, isDolby: true }
    },
    {
        title: 'The Last of Us',
        description: 'Joel and Ellie, a pair connected through the harshness of the world they live in, are forced to endure brutal circumstances.',
        poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
        trailer: 'https://www.youtube.com/watch?v=uLtkt8BonwM',
        genre: ['Drama', 'Action', 'Adventure'],
        duration: 55,
        rating: 8.8,
        releaseDate: new Date('2023-01-15'),
        format: { is3D: false, is4K: true, isIMAX: false, isDolby: true }
    },
    {
        title: 'True Detective',
        description: 'Seasonal anthology series in which police investigations unearth the personal and professional secrets of those involved.',
        poster: 'https://picsum.photos/seed/truedetective/300/450',
        backdrop: 'https://picsum.photos/seed/truedetective/1280/720',
        trailer: 'https://www.youtube.com/watch?v=fVQUcaO4AvE',
        genre: ['Drama', 'Crime', 'Mystery'],
        duration: 55,
        rating: 8.9,
        releaseDate: new Date('2014-01-12'),
        format: { is3D: false, is4K: true, isIMAX: false, isDolby: true }
    },
    {
        title: 'Vikings',
        description: 'Vikings transports us to the brutal and mysterious world of Ragnar Lothbrok, a Viking warrior and farmer.',
        poster: 'https://image.tmdb.org/t/p/w500/bQLrHIRNEkE3PdIWQrZHynQZazu.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/aq2yEMgRQBPfRkrO0YYe0qXFSn7.jpg',
        trailer: 'https://www.youtube.com/watch?v=9GhzwcwSecc',
        genre: ['Action', 'Drama', 'History'],
        duration: 44,
        rating: 8.5,
        releaseDate: new Date('2013-03-03'),
        format: { is3D: false, is4K: true, isIMAX: false, isDolby: true }
    },
    {
        title: 'Narcos',
        description: 'A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar.',
        poster: 'https://image.tmdb.org/t/p/w500/rTmal9fDbwh5F0waol2hq35U4ah.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/mFb0ygcue4ITixDkdr7wm1Tdarx.jpg',
        trailer: 'https://www.youtube.com/watch?v=xl8zdCY-abw',
        genre: ['Crime', 'Drama', 'Biography'],
        duration: 49,
        rating: 8.8,
        releaseDate: new Date('2015-08-28'),
        format: { is3D: false, is4K: true, isIMAX: false, isDolby: true }
    },
    {
        title: 'Dark',
        description: 'A family saga with a supernatural twist, set in a German town where the disappearance of two young children exposes the relationships among four families.',
        poster: 'https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/3lBDg3i6nn5R0vvQ7PBaWPGKkIH.jpg',
        trailer: 'https://www.youtube.com/watch?v=rrwycJ08PSA',
        genre: ['Drama', 'Mystery', 'Sci-Fi'],
        duration: 60,
        rating: 8.7,
        releaseDate: new Date('2017-12-01'),
        format: { is3D: false, is4K: true, isIMAX: false, isDolby: true }
    },
    {
        title: 'The Boys',
        description: 'A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.',
        poster: 'https://picsum.photos/seed/theboys/300/450',
        backdrop: 'https://picsum.photos/seed/theboys/1280/720',
        trailer: 'https://www.youtube.com/watch?v=tcrNsIaQkb4',
        genre: ['Action', 'Comedy', 'Crime'],
        duration: 60,
        rating: 8.7,
        releaseDate: new Date('2019-07-26'),
        format: { is3D: false, is4K: true, isIMAX: false, isDolby: true }
    }
];

const theaters = [
    'PVR IMAX - Phoenix Mall',
    'INOX Laserplex - Forum Mall',
    'Cinepolis - Orion Mall',
    'PVR Gold - Mantri Mall',
    'INOX - Garuda Mall'
];

const generateSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const seatsPerRow = 12;
    const seats = [];

    rows.forEach(row => {
        for (let i = 1; i <= seatsPerRow; i++) {
            seats.push({
                id: `${row}${i}`,
                row,
                number: i,
                isBooked: Math.random() < 0.15,
                lockedUntil: null
            });
        }
    });

    return seats;
};

const generateShowTimes = (movieId) => {
    const shows = [];
    const basePrices = [180, 220, 280, 350, 420];

    for (let day = 0; day < 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);

        const numTheaters = Math.floor(Math.random() * 2) + 2;
        const selectedTheaters = theaters.slice(0, numTheaters);

        selectedTheaters.forEach(theater => {
            const times = ['10:00', '13:30', '17:00', '20:30', '23:00'];
            const numShows = Math.floor(Math.random() * 3) + 2;

            for (let i = 0; i < numShows; i++) {
                const showDate = new Date(date);
                const [hours, mins] = times[i].split(':');
                showDate.setHours(parseInt(hours), parseInt(mins), 0, 0);

                if (showDate < new Date()) continue;

                shows.push({
                    movie: movieId,
                    theaterName: theater,
                    startTime: showDate,
                    price: basePrices[Math.floor(Math.random() * basePrices.length)],
                    seats: generateSeats()
                });
            }
        });
    }

    return shows;
};

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        await Movie.deleteMany({});
        await Show.deleteMany({});
        console.log('Cleared existing movies and shows');

        const insertedMovies = await Movie.insertMany(movies);
        console.log(`✅ Inserted ${insertedMovies.length} movies/series`);

        let totalShows = 0;
        for (const movie of insertedMovies) {
            const shows = generateShowTimes(movie._id);
            if (shows.length > 0) {
                await Show.insertMany(shows);
                totalShows += shows.length;
            }
        }
        console.log(`✅ Generated ${totalShows} shows`);

        console.log('\n🎬 Database seeding complete!');

        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDatabase();
