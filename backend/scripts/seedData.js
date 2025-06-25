import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB, getDB, closeDB } from '../config/database.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    const db = getDB();

    await db.collection('users').deleteMany({});
    await db.collection('questions').deleteMany({});
    await db.collection('answers').deleteMany({});

    console.log('🗑️  Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const usersData = [
      {
        username: 'john_dev',
        email: 'john@example.com',
        password: hashedPassword,
        bio: 'Full-stack developer with 5+ years of experience in React and Node.js',
        location: 'San Francisco, CA',
        website: 'https://johndev.com',
        reputation: 1250,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'sarah_tech',
        email: 'sarah@example.com',
        password: hashedPassword,
        bio: 'Frontend specialist, React enthusiast, and UI/UX designer',
        location: 'New York, NY',
        reputation: 890,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'mike_backend',
        email: 'mike@example.com',
        password: hashedPassword,
        bio: 'Backend engineer specializing in Node.js, databases, and cloud architecture',
        location: 'Austin, TX',
        reputation: 2100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'alice_mobile',
        email: 'alice@example.com',
        password: hashedPassword,
        bio: 'Mobile app developer working with React Native and Flutter',
        location: 'Seattle, WA',
        reputation: 750,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'bob_devops',
        email: 'bob@example.com',
        password: hashedPassword,
        bio: 'DevOps engineer passionate about automation and cloud infrastructure',
        location: 'Denver, CO',
        reputation: 1100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    const userResult = await db.collection('users').insertMany(usersData);
    const users = usersData.map((user, index) => ({
      ...user,
      _id: userResult.insertedIds[index]
    }));

    console.log('👥 Created users');

    const questionsData = [
      {
        title: 'How to implement React Context with TypeScript properly?',
        content: 'I\'m trying to implement a React Context with TypeScript but getting type errors. I want to create a context for user authentication that includes login, logout, and user state. What\'s the best way to type the context and provider?',
        tags: ['react', 'typescript', 'context'],
        author: users[0]._id,
        views: 245,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Best practices for Node.js API design and error handling',
        content: 'What are the best practices when designing RESTful APIs with Node.js and Express? I\'m particularly interested in error handling, validation, and response formatting. Should I use middleware for everything?',
        tags: ['nodejs', 'express', 'api', 'best-practices'],
        author: users[1]._id,
        views: 189,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Understanding MongoDB aggregation pipeline for complex queries',
        content: 'I need help understanding how MongoDB aggregation pipeline works for complex queries. I have a collection of orders and need to group by customer, calculate totals, and filter by date range. Can someone explain the stages?',
        tags: ['mongodb', 'database', 'aggregation'],
        author: users[2]._id,
        views: 156,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'React useEffect cleanup function - when and why?',
        content: 'When should I use the cleanup function in useEffect and how does it work? I\'m building a chat application and want to make sure I\'m handling subscriptions and event listeners correctly.',
        tags: ['react', 'hooks', 'useeffect'],
        author: users[3]._id,
        views: 298,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'JWT authentication in Express.js - security best practices',
        content: 'How do I implement secure JWT authentication in an Express.js application? What are the security considerations I should be aware of? Should I store JWTs in localStorage or httpOnly cookies?',
        tags: ['nodejs', 'jwt', 'authentication', 'security'],
        author: users[4]._id,
        views: 334,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'CSS Grid vs Flexbox: When to use which layout method?',
        content: 'I\'m confused about when to use CSS Grid vs Flexbox. Can someone explain the differences and provide examples of when each is more appropriate? I\'m working on a responsive dashboard layout.',
        tags: ['css', 'grid', 'flexbox', 'layout'],
        author: users[0]._id,
        views: 412,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Optimizing React performance with useMemo and useCallback',
        content: 'My React app is getting slow with large datasets. How can I use useMemo and useCallback to optimize performance? When should I use each hook and what are the common pitfalls?',
        tags: ['react', 'performance', 'usememo', 'optimization'],
        author: users[1]._id,
        views: 267,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Database indexing strategies for better query performance',
        content: 'What are effective database indexing strategies for better query performance? I\'m working with a large dataset and queries are becoming slow. Should I index every column I query on?',
        tags: ['database', 'indexing', 'performance', 'sql'],
        author: users[2]._id,
        views: 178,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Handling async errors in JavaScript - promises vs async/await',
        content: 'How should I properly handle async errors in JavaScript applications? What\'s the difference between error handling with promises vs async/await? I keep getting unhandled promise rejections.',
        tags: ['javascript', 'async', 'error-handling', 'promises'],
        author: users[3]._id,
        views: 223,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
        updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Responsive design with Tailwind CSS - mobile-first approach',
        content: 'What\'s the best way to implement responsive design using Tailwind CSS? I want to follow a mobile-first approach but I\'m not sure about the breakpoint strategy and utility classes.',
        tags: ['css', 'tailwind', 'responsive', 'mobile-first'],
        author: users[4]._id,
        views: 145,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'State management in large React apps - Context vs Redux',
        content: 'How do you manage state in large React applications? Should I use Context API or Redux? What are the pros and cons of each approach? My app is getting complex with multiple data flows.',
        tags: ['react', 'state-management', 'context', 'redux'],
        author: users[0]._id,
        views: 389,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), // 11 days ago
        updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'RESTful API design principles and HTTP status codes',
        content: 'What are the key principles of RESTful API design that I should follow? How do I choose the right HTTP status codes for different scenarios? I want to build a consistent API.',
        tags: ['api', 'rest', 'design', 'http'],
        author: users[1]._id,
        views: 201,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Docker containerization for web applications - best practices',
        content: 'How can I containerize my web application using Docker effectively? What are the best practices for Dockerfile optimization, multi-stage builds, and container security?',
        tags: ['docker', 'containerization', 'deployment', 'devops'],
        author: users[2]._id,
        views: 167,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 days ago
        updatedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'TypeScript generic constraints and conditional types',
        content: 'I\'m struggling with TypeScript generic constraints and conditional types. Can someone help explain how to use them effectively? I want to create more flexible and type-safe utility functions.',
        tags: ['typescript', 'generics', 'constraints', 'types'],
        author: users[3]._id,
        views: 134,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'SQL vs NoSQL database choice for modern web applications',
        content: 'How do I decide between SQL and NoSQL databases for my project? What are the trade-offs and when is each more appropriate? I\'m building a social media platform.',
        tags: ['database', 'sql', 'nosql', 'architecture'],
        author: users[4]._id,
        views: 278,
        isActive: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
    ];

    const questionResult = await db.collection('questions').insertMany(questionsData);
    const questions = questionsData.map((question, index) => ({
      ...question,
      _id: questionResult.insertedIds[index]
    }));

    console.log('❓ Created questions');

    const answersData = [];
    
    const answerContents = [
      'Great question! Here\'s how I approach this problem...',
      'I\'ve dealt with this issue before. The solution that worked for me was...',
      'This is a common problem. Here are a few different approaches you can try...',
      'I recommend checking the official documentation for this. However, here\'s a quick solution...',
      'I had the same issue last week. After some research, I found that...',
      'This depends on your specific use case, but generally I would suggest...',
      'Here\'s a step-by-step solution that should work for your scenario...',
      'I\'ve been working with this technology for years. The best practice is...',
      'There are several ways to handle this. Let me show you the most efficient approach...',
      'This is actually a well-known pattern in the community. Here\'s how to implement it...',
    ];

    questions.forEach((question, qIndex) => {
      const numAnswers = Math.floor(Math.random() * 4) + 1;
      
      for (let i = 0; i < numAnswers; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const baseContent = answerContents[Math.floor(Math.random() * answerContents.length)];
        
        const detailedContent = `${baseContent}

Here's a detailed explanation:

1. First, you need to understand the core concept
2. Then, implement the basic structure
3. Add error handling and edge cases
4. Test thoroughly with different scenarios

\`\`\`javascript
// Example code snippet
const example = () => {
  console.log('This is how you implement it');
};
\`\`\`

Hope this helps! Let me know if you have any questions.`;

        const likes = [];
        const dislikes = [];
        
        const likeCount = Math.floor(Math.random() * 8);
        for (let l = 0; l < likeCount; l++) {
          const randomLiker = users[Math.floor(Math.random() * users.length)];
          likes.push({ user: randomLiker._id });
        }
        
        const dislikeCount = Math.floor(Math.random() * 2);
        for (let d = 0; d < dislikeCount; d++) {
          const randomDisliker = users[Math.floor(Math.random() * users.length)];
          dislikes.push({ user: randomDisliker._id });
        }

        answersData.push({
          content: detailedContent,
          question: question._id,
          author: randomUser._id,
          likes,
          dislikes,
          isActive: true,
          isEdited: false,
          createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000)
        });
      }
    });

    await db.collection('answers').insertMany(answersData);
    console.log('💬 Created answers');

    console.log('🎉 Database seeded successfully!');
    console.log('📧 Demo login: john@example.com');
    console.log('🔑 Password: password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await closeDB();
  }
};

seedData();