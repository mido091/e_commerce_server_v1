import db from "./config/db.js";
const [rows] = await db.query("SELECT email, role, password_hash FROM users");
console.log(rows);
process.exit(0);
