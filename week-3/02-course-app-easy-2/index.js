const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
app.use(express.json());
const SECRET_KEY = 'hullapaluza';
//const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });

let ADMINS = [];
let USERS = [];
let COURSES = [];
let USERPURCHASEDCOURSES = {};
// let AUTHTOKEN = new Set();

function generateToken(user) {
  const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
  return token;
}

function validateToken(authorizationHeader) {
  const token = authorizationHeader.substring(7);
  let user = null;
  try {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      user = decoded || null;
    });
  }
  catch (error) {
    return null;
  }
  return user;
}

function isAdmin(username, password) {
  let isUserAdmin = false;
  ADMINS.forEach((admin) => {
    if (admin.username === username && admin.password === password)
      isUserAdmin = true;
  })
  return isUserAdmin;
}

function isUser(username, password) {
  let isValidUser = false;
  USERS.forEach((user) => {
    if (user.username === username && user.password === password)
      isValidUser = true;
  })
  return isValidUser;
}


function validateUsername(username) {
  if (username && typeof username === 'string') return;
  throw new Error("Invalid Username");
}

function validatePassword(password) {
  if (password && typeof password === 'string') return;
  throw new Error("Invalid password");
}

function authenticateAdmin(req) {
  const userName = req.headers.username || null;
  const password = req.headers.password || null;
  validateUsername(userName);
  validatePassword(password);
  if (isAdmin(userName, password)) {
    return true;
  }
  return false;
}

function authenticateUser(req) {
  const userName = req.headers.username || null;
  const password = req.headers.password || null;
  validateUsername(userName);
  validatePassword(password);
  if (isUser(userName, password)) {
    return true;
  }
  return false;
}
// { title: 'course title', description: 'course description', price: 100, imageLink: 'https://linktoimage.com', published: true }
function validateCourse(body) {
  if (!body.title || typeof body.title !== 'string')
    throw new Error("Invalid title");
  if (!body.description || typeof body.description !== 'string')
    throw new Error("Invalid description");
  if (!body.price || typeof body.price !== 'number')
    throw new Error("Invalid price");
  if (!body.imageLink || typeof body.imageLink !== 'string')
    throw new Error("Invalid imageLink");
  if (!body.published || typeof body.published !== 'boolean')
    throw new Error("Invalid published");
}
// Admin routes
app.post('/admin/signup', (req, res) => {
  const userName = req.body.username || null;
  const password = req.body.password || null;
  try {
    validateUsername(userName);
    validatePassword(password);
  }
  catch (error) {
    return res.status(400).json({ message: error.message });
  }
  const user = { username: userName, password: password };
  ADMINS.push(user);
  const token = generateToken(user);
  return res.status(200).json({ message: 'Admin created successfully', token: token });
});

app.post('/admin/login', (req, res) => {
  try {
    const isAdmin = authenticateAdmin(req);
    if (!isAdmin) return res.status(401).json({ message: 'Invalid credentials' });
    const user = { username: req.headers.username, password: req.headers.password };
    const token = generateToken(user);
    return res.status(200).json({ message: 'Logged in successfully', token: token });
  }
  catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.post('/admin/courses', (req, res) => {
  try {
    const token = req.headers.authorization;
    const username = validateToken(token)?.username;
    if (!username) return res.status(401).json({ message: 'Invalid credentials' });
    validateCourse(req.body);
    COURSES.push(
      {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        imageLink: req.body.imageLink,
        published: req.body.published
      }
    )
    return res.status(200).json({ message: 'Course created successfully', courseId: COURSES.length })
  }
  catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.put('/admin/courses/:courseId', (req, res) => {
  try {
    const token = req.headers.authorization;
    const username = validateToken(token)?.username;
    if (!username) return res.status(401).json({ message: 'Invalid credentials' });
    const courseId = parseInt(req.params.courseId);
    if (COURSES.length < courseId) return res.status(404).json({ message: 'course_id not found' });
    validateCourse(req.body);
    COURSES[courseId - 1] =
    {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      imageLink: req.body.imageLink,
      published: req.body.published
    }
    return res.status(200).json({ message: 'Course updated successfully' });
  }
  catch (error) {
    return res.status(400).json({ message: error.message });
  }
  // logic to edit a course
});

app.get('/admin/courses', (req, res) => {
  try {
    const token = req.headers.authorization;
    const username = validateToken(token)?.username;
    if (!username) return res.status(401).json({ message: 'Invalid credentials' });
    let courseList = [];
    COURSES.forEach((course, idx) => {
      courseList.push({
        id: idx + 1,
        title: course.title,
        description: course.description,
        price: course.price,
        imageLink: course.imageLink,
        published: course.published
      })
    })
    return res.status(200).json({ courses: courseList });
  }
  catch (error) {
    return res.status(400).json({ message: error.message });
  }
  // logic to get all courses
});

// User routes
app.post('/users/signup', (req, res) => {
  const userName = req.body.username || null;
  const password = req.body.password || null;
  try {
    validateUsername(userName);
    validatePassword(password);
  }
  catch (error) {
    return res.status(400).json({ message: error.message });
  }
  const user = { username: userName, password: password };
  USERS.push(user);
  const token = generateToken(user);
  return res.status(200).json({ message: 'User created successfully', token: token });
  // logic to sign up user
});

app.post('/users/login', (req, res) => {
  try {
    const isUser = authenticateUser(req);
    if (!isUser) return res.status(401).json({ message: 'Invalid credentials' });
    const user = { username: req.headers.username, password: req.headers.password };
    const token = generateToken(user);
    return res.status(200).json({ message: 'Logged in successfully', token: token });
  }
  catch (error) {
    return res.status(400).json({ message: error.message });
  }
  // logic to log in user
});

app.get('/users/courses', (req, res) => {
  try {
    const username = validateToken(req.headers.authorization)?.username;
    if (!username) return res.status(401).json({ message: 'Invalid credentials' });
    let courseList = [];
    COURSES.forEach((course, idx) => {
      courseList.push({
        id: idx + 1,
        title: course.title,
        description: course.description,
        price: course.price,
        imageLink: course.imageLink,
        published: course.published
      })
    })
    return res.status(200).json({ courses: courseList });
  }
  catch (error) {
    return res.status(400).json({ message: error.message });
  }
  // logic to list all courses
});

app.post('/users/courses/:courseId', (req, res) => {
  try {
    const username = validateToken(req.headers.authorization)?.username;
    if (!username) return res.status(401).json({ message: 'Invalid credentials' });
    const courseId = parseInt(req.params.courseId);
    if (COURSES.length < courseId) return res.status(404).json({ message: 'course_id not found' });
    if (!USERPURCHASEDCOURSES[username]) USERPURCHASEDCOURSES[username] = [];
    USERPURCHASEDCOURSES[username].push(courseId);
    return res.status(200).json({ message: 'Course purchased successfully' });
  }
  catch (error) {
    return res.status(400).json({ message: error.message });
  }
  // logic to purchase a course
});

app.get('/users/purchasedCourses', (req, res) => {
  try {
    const username = validateToken(req.headers.authorization)?.username;
    if (!username) return res.status(401).json({ message: 'Invalid credentials' });
    let userCourseList = [];
    if (!USERPURCHASEDCOURSES[username]) USERPURCHASEDCOURSES[username] = [];
    USERPURCHASEDCOURSES[username].forEach((courseId) => {
      userCourseList.push(
        {
          id: courseId,
          title: COURSES[courseId - 1].title,
          description: COURSES[courseId - 1].description,
          price: COURSES[courseId - 1].price,
          imageLink: COURSES[courseId - 1].imageLink,
          published: COURSES[courseId - 1].published
        }
      )
    })
    return res.status(200).json({ purchasedCourses: userCourseList })
  }
  catch (error) {
    return res.status(400).json({ message: error.message });
  }
  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});