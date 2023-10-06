import { type Event, type Instrument, PrismaClient, type User, type Prisma } from '@prisma/client';
import type { RequiredInstrumentsJSON } from '~/types';
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

    console.log("PACKAGES: ", { djLive, showbandParty, ShowbandFullday });
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
    const instruments = [drums, bongos, dj, bass, guitar, vocals, saxophone, keys];
    console.log("INSTRUMENTS: ", instruments);
    return instruments;
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
    const steven = await prisma.user.upsert({
        where: { email: 'steven@thedistractionsband.co.uk' },
        update: {},
        create: {
            email: 'steven@thedistractionsband.co.uk',
            name: 'Steven',
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

    const users = [alice, bob, lily, steven, dan, patrick, lee, joe];
    console.log("USERS: ", users);
    return users;
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

    console.log("EVENT TYPES: ", { wedding, corporate, birthdayParty, destination });
};

const seedEvents = async (instruments: Instrument[]) => {

    const convertToInstrumentJSON = (instrument: { name: string; quantity: number; }): RequiredInstrumentsJSON => {
        const id = instruments.find((instr) => instrument.name === instr.name)?.id ?? "";
        if (!id) throw new Error(`Cannot find instrument with name ${instrument.name}`);
        return { id, quantity: instrument.quantity };
    };

    interface CreateEventInput {
        name: string;
        ownerEmail: string;
        eventType: string;
        packages: string[];
        instruments: {
            name: string; quantity: number;
        }[];
        price: number;
        location: string;
        date?: string;
    }

    const createEvent = async ({ name, ownerEmail, eventType, packages, instruments, price, location, date }: CreateEventInput) => {
        return prisma.event.upsert({
            where: {
                name
            },
            update: {},
            create: {
                name,
                date: date ?? new Date().toISOString(),
                EventType: {
                    connect: {
                        name: eventType
                    }
                },
                owner: {
                    connect: {
                        email: ownerEmail,
                    }
                },
                packages: {
                    connect: packages.map((pack) => ({ name: pack }))
                },
                InstrumentsRequired: instruments.map(convertToInstrumentJSON) as unknown as Prisma.EventCreateInput['InstrumentsRequired'],
                price,
                location,
            }
        });
    };

    const event1Config: CreateEventInput = {
        name: "Wedding 1",
        ownerEmail: "alice@thedistractionsband.co.uk",
        eventType: "Wedding",
        packages: ['DJ LIVE'],
        instruments: [{ name: "Bongos", quantity: 1 }, { name: "Vocals", quantity: 1 }, { name: "Saxophone", quantity: 1 }, { name: "DJ", quantity: 1 }],
        price: 2500,
        location: 'The Shard, London, UK, Earth, Milky Way',
        date: new Date(new Date().getDay() + 50).toISOString()
    };
    const event1 = await createEvent(event1Config);

    const event2Config: CreateEventInput = {
        name: "Wedding 2",
        ownerEmail: "bob@thedistractionsband.co.uk",
        eventType: "Wedding",
        packages: ['Showband - Party'],
        instruments: [{ name: "Drums", quantity: 1 }, { name: "Bass", quantity: 1 }, { name: "Saxophone", quantity: 1 }, { name: "Guitar", quantity: 1 }, { name: "Vocals", quantity: 2 }, { name: "Keyboard", quantity: 1 }],
        price: 5000,
        location: 'The Gherkin, London, UK, Earth, Milky Way'
    };
    const event2 = await createEvent(event2Config);

    const event3Config: CreateEventInput = {
        name: "Wedding 3",
        ownerEmail: "djordandrums@gmail.com",
        eventType: "Wedding",
        packages: ['Showband - Full Day'],
        instruments: [{ name: "Drums", quantity: 1 }, { name: "Bass", quantity: 1 }, { name: "Saxophone", quantity: 1 }, { name: "Guitar", quantity: 1 }, { name: "Vocals", quantity: 2 }, { name: "Keyboard", quantity: 1 }],
        price: 7000,
        location: 'Eiffel Tower, Paris, France, Earth, Milky Way'
    };
    const event3 = await createEvent(event3Config);

    const event4Config: CreateEventInput = {
        name: "Corporate 1",
        ownerEmail: "steven@thedistractionsband.co.uk",
        eventType: "Corporate",
        packages: ['DJ LIVE', 'Showband - Party'],
        instruments: [{ name: "Bongos", quantity: 1 }, { name: "Vocals", quantity: 1 }, { name: "Saxophone", quantity: 1 }, { name: "DJ", quantity: 1 }],
        price: 2500,
        location: 'Covent Garden, London, UK, Earth, Milky Way'
    };
    const event4 = await createEvent(event4Config);

    const event5Config: CreateEventInput = {
        name: "Corporate 2",
        ownerEmail: "steven@thedistractionsband.co.uk",
        eventType: "Corporate",
        packages: ['Showband - Party'],
        instruments: [{ name: "Drums", quantity: 1 }, { name: "Bass", quantity: 1 }, { name: "Saxophone", quantity: 1 }, { name: "Guitar", quantity: 1 }, { name: "Vocals", quantity: 2 }, { name: "Keyboard", quantity: 1 }],
        price: 5000,
        location: 'Hackney Coffee Co. London, UK, Earth, Milky Way'
    };
    const event5 = await createEvent(event5Config);

    const event6Config: CreateEventInput = {
        name: "Destination 1",
        ownerEmail: "steven@thedistractionsband.co.uk",
        eventType: "Destination",
        packages: ['Showband - Full Day'],
        instruments: [{ name: "Drums", quantity: 1 }, { name: "Bass", quantity: 1 }, { name: "Saxophone", quantity: 1 }, { name: "Guitar", quantity: 1 }, { name: "Vocals", quantity: 2 }, { name: "Keyboard", quantity: 1 }],
        price: 7000,
        location: 'The Moon, Space, Milky Way'
    };
    const event6 = await createEvent(event6Config);

    const event7Config: CreateEventInput = {
        name: "Birthday Party 1",
        ownerEmail: "djordandrums@gmail.com",
        eventType: "Birthday Party",
        packages: ['Showband - Full Day'],
        instruments: [{ name: "Drums", quantity: 1 }, { name: "Bass", quantity: 1 }, { name: "Saxophone", quantity: 1 }, { name: "Guitar", quantity: 1 }, { name: "Vocals", quantity: 2 }, { name: "Keyboard", quantity: 1 }],
        price: 7000,
        location: 'Wilnecote Miners Welfare Club, Wilnecote, UK',
        date: new Date(new Date().setFullYear(new Date().getFullYear(), new Date().getMonth() + 1, 1)).toISOString()
    };
    const event7 = await createEvent(event7Config);

    const events = [event1, event2, event3, event4, event5, event6, event7];
    console.log("EVENTS: ", events);
    return events;
};

const seedJobs = async (instruments: Instrument[], users: User[], events: Event[]) => {

    const musiciansAndAdmins = users.filter((user) => user.role !== 'client');

    interface CreateJobInput {
        musicianId: string;
        eventId: string;
        instrumentIds: string[];
        pay: number;
        isMd: boolean;
        notes?: string;
        status?: "accepted" | "declined" | "pending";
    }
    const createJob = async ({ musicianId, eventId, instrumentIds, pay, isMd, notes, status }: CreateJobInput) => {
        return prisma.job.upsert({
            where: {
                musicianId_eventId: {
                    eventId: eventId,
                    musicianId: musicianId
                }
            },
            update: {},
            create: {
                musician: {
                    connect: {
                        id: musicianId
                    }
                },
                event: {
                    connect: {
                        id: eventId
                    }
                },
                Instruments: {
                    connect: instrumentIds.map((id) => ({ id }))
                },
                pay,
                isMd,
                notes: notes ?? '',
                status: status ?? ""
            }
        });
    };

    const job1Config: CreateJobInput = {
        musicianId: musiciansAndAdmins.find((musician) => musician.name === 'Dan')?.id ?? '',
        eventId: events.find((event) => event.name === 'Wedding 1')?.id ?? '',
        instrumentIds: [instruments.find((instrument) => instrument.name === 'Bongos')?.id ?? ""],
        pay: 250,
        isMd: false,
        notes: 'Please bring your own bongos',
        status: "pending"
    };
    const job1 = await createJob(job1Config);

    const job2Config: CreateJobInput = {
        musicianId: musiciansAndAdmins.find((musician) => musician.name === 'Dan')?.id ?? '',
        eventId: events.find((event) => event.name === 'Wedding 2')?.id ?? '',
        instrumentIds: [instruments.find((instrument) => instrument.name === 'Drums')?.id ?? ""],
        pay: 250,
        isMd: false,
        status: "pending"
    };
    const job2 = await createJob(job2Config);

    const job3Config: CreateJobInput = {
        musicianId: musiciansAndAdmins.find((musician) => musician.name === 'Dan')?.id ?? '',
        eventId: events.find((event) => event.name === 'Wedding 3')?.id ?? '',
        instrumentIds: [instruments.find((instrument) => instrument.name === 'Drums')?.id ?? ""],
        pay: 250,
        isMd: false,
        status: "pending"
    };
    const job3 = await createJob(job3Config);

    const job4Config: CreateJobInput = {
        musicianId: musiciansAndAdmins.find((musician) => musician.name === 'Dan')?.id ?? '',
        eventId: events.find((event) => event.name === 'Corporate 1')?.id ?? '',
        instrumentIds: [instruments.find((instrument) => instrument.name === 'Drums')?.id ?? ""],
        pay: 250,
        isMd: false,
        status: "pending"
    };
    const job4 = await createJob(job4Config);

    const job5Config: CreateJobInput = {
        musicianId: musiciansAndAdmins.find((musician) => musician.name === 'Dan')?.id ?? '',
        eventId: events.find((event) => event.name === 'Corporate 2')?.id ?? '',
        instrumentIds: [instruments.find((instrument) => instrument.name === 'Drums')?.id ?? ""],
        pay: 250,
        isMd: false,
        status: "accepted"
    };
    const job5 = await createJob(job5Config);

    const job6Config: CreateJobInput = {
        musicianId: musiciansAndAdmins.find((musician) => musician.name === 'Dan')?.id ?? '',
        eventId: events.find((event) => event.name === 'Destination 1')?.id ?? '',
        instrumentIds: [instruments.find((instrument) => instrument.name === 'Drums')?.id ?? ""],
        pay: 250,
        isMd: false,
        status: "accepted"
    };
    const job6 = await createJob(job6Config);

    console.log("JOBS: ", { job1, job2, job3, job4, job5, job6 });
};


const main = async () => {
    try {
        await seedPackages();
        const instruments = await seedInstruments();
        await seedEventTypes();
        const users = await seedUsers();
        const events = await seedEvents(instruments);
        await seedJobs(instruments, users, events);

        await prisma.$disconnect();
    } catch (e) {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    };
};

void main();