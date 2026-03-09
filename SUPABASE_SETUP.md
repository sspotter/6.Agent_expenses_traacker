# Supabase Setup Guide

Follow these steps to connect your application to Supabase:

## Step 1: Create a Supabase Project

1. Go to [https://database.new](https://database.new) or [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Project Name**: `agent-expenses-tracker` (or your preferred name)
   - **Database Password**: Choose a strong password (save it somewhere safe)
   - **Region**: Choose the closest region to you
5. Click "Create new project" and wait for it to initialize (~2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase project dashboard, click on the **SQL Editor** in the left sidebar
2. Click "New Query"
3. Open the file `backend/src/db/supabase_schema.sql` from this project
4. Copy ALL the contents and paste into the SQL Editor
5. Click "Run" or press `Ctrl+Enter`
6. You should see "Success. No rows returned" - this is correct!

## Step 3: Get Your API Credentials

1. In your Supabase project, click on the **Settings** icon (gear) in the left sidebar
2. Click on **API** under Project Settings
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys" - a long string starting with `eyJ...`)

## Step 4: Configure Environment Variables

1. Open `frontend/.env.local` in this project
2. Replace the placeholder values with your actual credentials:
   ```
   VITE_SUPABASE_URL=https://your-actual-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```
3. Save the file

## Step 5: Restart the Development Server

1. Stop the current dev server if it's running (Ctrl+C in the terminal)
2. Run: `npm run dev` in the `frontend/` directory
3. Open your browser to the local URL (usually `http://localhost:5173`)

## Step 6: Test the Connection

1. Click on any day in the calendar grid
2. Enter an amount and save
3. Refresh the page - your data should persist!
4. Go to your Supabase dashboard → Table Editor → `daily_collections` to see the saved data

## Troubleshooting

- **"Missing Supabase Environment Variables" warning**: Make sure `.env.local` has the correct values and restart the dev server
- **Data not saving**: Check the browser console (F12) for errors
- **Can't see tables in Supabase**: Make sure you ran the SQL schema in Step 2

---

**Need help?** Let me know which step you're stuck on!
