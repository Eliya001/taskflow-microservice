require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoidGVzdDEyM0B0ZXN0LmNvbSIsIm5hbWUiOiJUZXN0IiwiaWF0IjoxNzg1NjY5OTc1LCJleHAiOjE3ODU3NTYzNzV9.Lw_wR9bn182DABzzLvnrEB3bjdiAoJtl8O2JgGQSb8E";

try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token OK:', decoded);
}   catch(err) {
    console.log('Token ERROR:', err.message);
}

