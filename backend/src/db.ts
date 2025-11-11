import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const connectDB = async () => {
  try {
    await pool.connect();
    console.log('PostgreSQL connected successfully.');
    await createTables();
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error);
    process.exit(1);
  }
};

const createTables = async () => {
  const createUserTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      plan VARCHAR(20) DEFAULT 'Sonho',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createLoveStoryTableQuery = `
    CREATE TABLE IF NOT EXISTS love_stories (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(100) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      partner1_name VARCHAR(100),
      partner2_name VARCHAR(100),
      start_date DATE,
      story_title VARCHAR(255),
      story_text TEXT,
      youtube_url VARCHAR(255),
      story_password VARCHAR(255),
      entry_button_text VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // New table for story images
  const createStoryImagesTableQuery = `
    CREATE TABLE IF NOT EXISTS story_images (
      id SERIAL PRIMARY KEY,
      story_id INTEGER NOT NULL REFERENCES love_stories(id) ON DELETE CASCADE,
      image_url VARCHAR(255) NOT NULL,
      display_order INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Idempotent script to add the layout_position column if it doesn't exist
  const alterLoveStoryTableQuery = `
    DO $$
    BEGIN
      IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='love_stories' AND column_name='layout_position') THEN
        ALTER TABLE "love_stories" ADD COLUMN "layout_position" VARCHAR(10) DEFAULT 'bottom';
      END IF;
    END $$;
  `;

  // Idempotent script to add the youtube_url column if it doesn't exist
  const alterLoveStoryTableYoutubeQuery = `
    DO $$
    BEGIN
      IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='love_stories' AND column_name='youtube_url') THEN
        ALTER TABLE "love_stories" ADD COLUMN "youtube_url" VARCHAR(255);
      END IF;
    END $$;
  `;

  // Idempotent script to add the story_password column if it doesn't exist
  const alterLoveStoryTablePasswordQuery = `
    DO $$
    BEGIN
      IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='love_stories' AND column_name='story_password') THEN
        ALTER TABLE "love_stories" ADD COLUMN "story_password" VARCHAR(255);
      END IF;
    END $$;
  `;

  // Idempotent script to add the entry_button_text column if it doesn't exist
  const alterLoveStoryTableEntryButtonQuery = `
    DO $$
    BEGIN
      IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='love_stories' AND column_name='entry_button_text') THEN
        ALTER TABLE "love_stories" ADD COLUMN "entry_button_text" VARCHAR(100);
      END IF;
    END $$;
  `;

  // Idempotent script to add the plan column to users table if it doesn't exist
  const alterUserTablePlanQuery = `
    DO $$
    BEGIN
      IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='users' AND column_name='plan') THEN
        ALTER TABLE "users" ADD COLUMN "plan" VARCHAR(20) DEFAULT 'Sonho';
      END IF;
    END $$;
  `;

  try {
    await pool.query(createUserTableQuery);
    await pool.query(alterUserTablePlanQuery); // Ensure plan column exists
    await pool.query(createLoveStoryTableQuery);
    await pool.query(createStoryImagesTableQuery);
    await pool.query(alterLoveStoryTableQuery); // Ensure layout_position column exists
    await pool.query(alterLoveStoryTableYoutubeQuery); // Ensure youtube_url column exists
    await pool.query(alterLoveStoryTablePasswordQuery); // Ensure story_password column exists
    await pool.query(alterLoveStoryTableEntryButtonQuery); // Ensure entry_button_text column exists
    console.log('Tables created or already exist.');
  } catch (error) {
    console.error('Error creating/altering tables:', error);
  }
};
