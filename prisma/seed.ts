import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const seedPackages = async () => {
    const djLive = await prisma.package.upsert({
        where: {
            name: 'DJ LIVE'
        },
        update: {},
        create: {
            name: 'DJ LIVE',
            basePrice: 2500,
            description: 'Looking for something a little different? The Distractions DJ Live is a zesty blend of expertly curated club hits featuring live vocals, saxophone, electric violin and LED percussion. Our artists will perform among your guests to give you a fresh and fully interactive experience.'
        }
    });
    const showbandParty = await prisma.package.upsert({
        where: {
            name: 'Showband - Party'
        },
        update: {},
        create: {
            name: 'Showband - Party',
            basePrice: 5000,
            description: "We're excited to recommend our evening 'Showband' service. It's the perfect combination - you'll begin the night with a classic band and end with the hugely popular DJ- Live.The sun goes down and we turn up - expect medleys, audience interaction and an incredible vibe."
        }
    });
    const ShowbandFullday = await prisma.package.upsert({
        where: {
            name: 'Showband - Full Day'
        },
        update: {},
        create: {
            name: 'Showband - Full Day',
            basePrice: 7000,
            description: "We're excited to recommend our evening 'Showband' service. It's the perfect combination - you'll begin the night with a classic band and end with the hugely popular DJ- Live.The sun goes down and we turn up - expect medleys, audience interaction and an incredible vibe."
        }
    });

    console.log({ djLive, showbandParty, ShowbandFullday });
};

const seedInstruments = async () => {
    const drums = await prisma.instrument.upsert({
        where: {
            name: 'Drums'
        },
        update: {},
        create: {
            name: 'Drums',
        }
    });
    const bongos = await prisma.instrument.upsert({
        where: {
            name: 'Bongos'
        },
        update: {},
        create: {
            name: 'Bongos',
        }
    });
    const dj = await prisma.instrument.upsert({
        where: {
            name: 'DJ'
        },
        update: {},
        create: {
            name: 'DJ',
        }
    });
    const bass = await prisma.instrument.upsert({
        where: {
            name: 'Bass'
        },
        update: {},
        create: {
            name: 'Bass',
        }
    });
    const guitar = await prisma.instrument.upsert({
        where: {
            name: 'Guitar'
        },
        update: {},
        create: {
            name: 'Guitar',
        }
    });
    const vocals = await prisma.instrument.upsert({
        where: {
            name: 'Vocals'
        },
        update: {},
        create: {
            name: 'Vocals',
        }
    });
    const saxophone = await prisma.instrument.upsert({
        where: {
            name: 'Saxophone'
        },
        update: {},
        create: {
            name: 'Saxophone',
        }
    });
    const keys = await prisma.instrument.upsert({
        where: {
            name: 'Keyboard'
        },
        update: {},
        create: {
            name: 'Keyboard',
        }
    });
    console.log({ drums, bongos, bass, guitar, vocals, saxophone, keys });
};

const seedUsers = async () => {
    const alice = await prisma.user.upsert({
        where: { email: 'alice@thedistractionsband.co.uk' },
        update: {},
        create: {
            email: 'alice@thedistractionsband.co.uk',
            name: 'Alice',
            role: 'client'
        },
    });
    const bob = await prisma.user.upsert({
        where: { email: 'bob@thedistractionsband.co.uk' },
        update: {},
        create: {
            email: 'bob@thedistractionsband.co.uk',
            name: 'Bob',
            role: 'client'
        },
    });
    const lily = await prisma.user.upsert({
        where: { email: 'lilyrbarker@outlook.com' },
        update: {},
        create: {
            email: 'lilyrbarker@outlook.com',
            name: 'Lily',
            role: 'musician'
        },
    });
    const dan = await prisma.user.upsert({
        where: { email: 'djordandrums@gmail.com' },
        update: {},
        create: {
            email: 'djordandrums@gmail.com',
            name: 'Dan',
            role: 'musician',
            instruments: {
                connect: [
                    { name: 'Drums' },
                    { name: 'Bongos' },
                ]
            }
        },
    });
    const patrick = await prisma.user.upsert({
        where: {
            email: 'patrick@thedistractionsband.co.uk',
        },
        update: {},
        create: {
            email: 'patrick@thedistractionsband.co.uk',
            name: 'Patrick',
            role: 'admin',
            instruments: {
                connect: [{ name: 'Keyboard' }, { name: 'Bass' }]
            }
        },
    });
    const lee = await prisma.user.upsert({
        where: {
            email: 'leepellington@thedistractionsband.co.uk'
        },
        update: {},
        create: {
            email: 'leepellington@thedistractionsband.co.uk',
            name: 'Lee',
            role: 'admin',
            instruments: {
                connect: [{ name: 'Bass' }]
            }
        },
    });
    const joe = await prisma.user.upsert({
        where: { email: 'josephmalik@thedistractionsband.co.uk' },
        update: {},
        create: {
            email: 'josephmalik@thedistractionsband.co.uk',
            name: 'Joe',
            role: 'superAdmin',
            instruments: {
                connect: [{ name: 'Drums' }]
            }
        },
    });

    console.log({ alice, bob, lily, dan, patrick, lee, joe });
};

const seedEventTypes = async () => {
    const wedding = await prisma.eventType.upsert({
        where: {
            name: 'Wedding'
        },
        update: {},
        create: {
            name: 'Wedding',
        }
    });
    const corporate = await prisma.eventType.upsert({
        where: {
            name: 'Corporate'
        },
        update: {},
        create: {
            name: 'Corporate',
        }
    });
    const birthdayParty = await prisma.eventType.upsert({
        where: {
            name: 'Birthday Party'
        },
        update: {},
        create: {
            name: 'Birthday Party',
        }
    });
    const destination = await prisma.eventType.upsert({
        where: {
            name: 'Destination'
        },
        update: {},
        create: {
            name: 'Destination',
        }
    });

    console.log({ wedding, corporate, birthdayParty, destination });
};

const seedEvents = async () => {
    const event1 = await prisma.event.upsert({
        where: {
            name: 'Wedding 1'
        },
        update: {},
        create: {
            name: 'Wedding 1',
            date: new Date().toISOString(),
            EventType: {
                connect: {
                    name: 'Wedding'
                }
            },
            owner: {
                connect: {
                    email: 'alice@thedistractionsband.co.uk',
                }
            },
            packages: {
                connect: {
                    name: 'DJ LIVE'
                }
            },
            InstrumentsRequired: [{ name: "Bongos", quantity: 1 }, { name: "Vocals", quantity: 1 }, { name: "Saxophone", quantity: 1 }, { name: "DJ", quantity: 1 }],
            price: 2500,
            location: 'The Shard, London, UK, Earth, Milky Way',
        }
    });

    const event2 = await prisma.event.upsert({
        where: {
            name: 'Wedding 2'
        },
        update: {},
        create: {
            name: 'Wedding 2',
            date: new Date().toISOString(),
            EventType: {
                connect: {
                    name: 'Wedding'
                }
            },
            owner: {
                connect: {
                    email: 'bob@thedistractionsband.co.uk',
                }
            },
            packages: {
                connect: {
                    name: 'Showband - Party'
                }
            },
            InstrumentsRequired: [{ name: "Drums", quantity: 1 }, { name: "Bass", quantity: 1 }, { name: "Saxophone", quantity: 1 }, { name: "Guitar", quantity: 1 }, { name: "Vocals", quantity: 2 }, { name: "Keyboard", quantity: 1 }],
            price: 7000,
            location: 'The Gherkin, London, UK, Earth, Milky Way',
        }
    });
    console.log({ event1, event2 });
};


const main = async () => {
    try {
        await seedPackages();
        await seedInstruments();
        await seedEventTypes();
        await seedUsers();
        await seedEvents();

        await prisma.$disconnect();
    } catch (e) {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    };
};

void main();