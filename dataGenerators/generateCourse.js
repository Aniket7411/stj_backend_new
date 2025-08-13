const { faker } = require('@faker-js/faker');
const Course = require('../models/course.models'); // Ensure the path to Course model is correct

const getRandomTime = () => ({
    hour: faker.number.int({ min: 1, max: 12 }),
    mins: faker.helpers.arrayElement([0, 15, 30, 45]),
    am_pm: faker.helpers.arrayElement(['AM', 'PM']),
});

const getRandomDays = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return faker.helpers.arrayElements(days, faker.number.int({ min: 1, max: 7 }));
};


const courseTitles = [
    "Introduction to Cybersecurity",
    "Advanced Java Programming",
    "Data Science and Machine Learning",
    "Web Development with React",
    "Mobile App Development with Flutter",
    "Creative Writing for Beginners",
    "Business Management Essentials",
    "Digital Marketing Strategies",
    "Photography Basics and Beyond",
    "Graphic Design with Adobe Illustrator",
    "AI and Deep Learning",
    "Python for Data Analysis",
    "Cloud Computing with AWS",
    "Blockchain Technology Explained",
    "Leadership and Communication Skills",
    "Financial Planning for Professionals",
    "SEO Optimization Masterclass",
    "Video Editing with Premiere Pro",
    "Game Development with Unity",
    "Cooking Masterclass: Italian Cuisine",
];

const indianCities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", 
    "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", 
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal", 
    "Patna", "Vadodara", "Ludhiana", "Agra", "Nashik"
];

const generateCourses = async (numCourses = 150) => {
    const courses = [];
    for (let i = 0; i < numCourses; i++) {
        const course = new Course({
            // userDetails: {
            //     userId: faker.string.uuid(), // Corrected UUID generator
            // },
            courseDetails: {
                title: faker.helpers.arrayElement(courseTitles),
                startDate: faker.date.future(),
                endDate: faker.date.future(),
                startTime: getRandomTime(),
                endTime: getRandomTime(),
                category: faker.helpers.arrayElement(['Technology', 'Cyber Security', 'Software Development', 'Art']),
                duration: faker.number.int({ min: 10, max: 100 }),
                days: getRandomDays(),
                amount: faker.number.int({ min: 50, max: 500 }),
                enrollmentLimit: faker.number.int({ min: 10, max: 50 }),
                address: {
                    address: faker.location.streetAddress(),
                    postCode: parseInt(faker.location.zipCode().replace(/\D/g, ''), 10),
                    country: "India", // Fixed to India
                    town_city: faker.helpers.arrayElement(indianCities),
                },
            },
            courseRequirement: {
                courseDescription: faker.lorem.paragraph(),
                courseRequirements: faker.lorem.words(3).split(' '),
                courseIsFor: faker.lorem.words(3).split(' '),
            },
            courseCertificates: {
                courseImage: faker.image.urlPlaceholder(),
                certificateImage: faker.image.urlPlaceholder(),
                declaration: faker.datatype.boolean(),
            },
        });

        courses.push(course);
    }

    await Course.insertMany(courses);
    console.log(`${numCourses} courses successfully added to the database!`);
};

module.exports = { generateCourses };
