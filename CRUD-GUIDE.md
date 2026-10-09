# Student Management CRUD

This continues the existing project, Student model, and MongoDB connection. The frontend is src/App.jsx in this project (client/src/App.jsx in the assignment).

## Run

Open two terminals from mern-student-management:

1. Backend: cd server, then node server.js. The existing server/.env must contain a valid MONGO_URI.
2. Frontend: npm run dev. Open the Vite local URL, normally http://localhost:5173.

## Routes

| Operation | Method | Route |
| --- | --- | --- |
| Create | POST | /students |
| Read | GET | /students |
| Update | PUT | /students/:id |
| Delete | DELETE | /students/:id |

Create and update send name, course, and numeric age. Update and delete use the selected MongoDB _id. Invalid input returns 400; absent records return 404.

## Persistence tests and submission screenshots

1. Capture the student form and list.
2. Add Test Student / BSIT / 20. Capture the record, refresh, and verify it remains.
3. Edit age to 21 and click Update Student. Capture the update, refresh, and verify age remains 21.
4. Capture the corresponding document in MongoDB Atlas before deleting it.
5. Delete the test student and confirm. Capture the result, refresh, and verify it remains removed.

React sends Axios requests to Express. Express validates data and uses the existing Mongoose Student model. MongoDB permanently stores changes. React retrieves the latest list after each successful mutation.

Capture screenshots from the actual running app and database.
