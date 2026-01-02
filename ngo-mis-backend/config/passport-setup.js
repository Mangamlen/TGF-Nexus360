const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // Import crypto module // For hashing passwords if a new user is created with email/password later

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await db.promise().query("SELECT * FROM users WHERE id = ?", [id]);
    if (users.length > 0) {
      done(null, users[0]);
    } else {
      done(new Error("User not found"), null);
    }
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in our db with google_id
        const [existingUsers] = await db.promise().query(
          "SELECT * FROM users WHERE google_id = ?",
          [profile.id]
        );

        if (existingUsers.length > 0) {
          // User already exists, log them in
          done(null, existingUsers[0]);
        } else {
          // Check if a user with the same email already exists (e.g., registered via email/password)
          const [existingEmailUsers] = await db.promise().query(
            "SELECT * FROM users WHERE email = ?",
            [profile.emails[0].value]
          );

          if (existingEmailUsers.length > 0) {
            // User exists with the same email, link Google account
            const user = existingEmailUsers[0];
            await db.promise().query(
              "UPDATE users SET google_id = ? WHERE id = ?",
              [profile.id, user.id]
            );
            done(null, { ...user, google_id: profile.id }); // Return updated user object
          } else {
            // Create new user
            const newUser = {
              name: profile.displayName,
              email: profile.emails[0].value,
              // For social logins, password can be null or a generated hash
              // For simplicity, we can set a dummy password or require them to set one later
              password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10), // Dummy hashed password
              role_id: 3, // Default role for new social users (e.g., 'user' role)
              google_id: profile.id,
            };

            const [result] = await db.promise().query(
              "INSERT INTO users (name, email, password, role_id, google_id) VALUES (?, ?, ?, ?, ?)",
              [newUser.name, newUser.email, newUser.password, newUser.role_id, newUser.google_id]
            );

            // Fetch the newly created user to get the auto-generated ID
            const [createdUsers] = await db.promise().query(
              "SELECT * FROM users WHERE id = ?",
              [result.insertId]
            );
            done(null, createdUsers[0]);
          }
        }
      } catch (err) {
        done(err, null);
      }
    }
  )
);
