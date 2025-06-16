# Snowflake Cortex Agent Chat Interface

This project provides a chat interface for interacting with Snowflake's Cortex Agent. It allows users to query their Snowflake data using natural language and receive AI-generated responses based on the data.

## Features

- Natural language queries to Snowflake data
- Real-time responses from Snowflake Cortex Agent
- Interactive chat interface
- Support for various data queries including sales, revenue, and contract information

This project consists of a React frontend with serverless API routes that connect to Snowflake. The application is deployed on Vercel.

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Snowflake account with Cortex Agent enabled

### Environment Variables

Before running the application, you need to set up your environment variables:

1. Copy the `.env.example` file to a new file named `.env`
2. Fill in your Snowflake credentials and configuration in the `.env` file

```
REACT_APP_SNOWFLAKE_ACCOUNT=your_account_identifier
REACT_APP_SNOWFLAKE_USERNAME=your_username
REACT_APP_SNOWFLAKE_PASSWORD=your_password
REACT_APP_SNOWFLAKE_WAREHOUSE=your_warehouse
REACT_APP_SNOWFLAKE_DATABASE=your_database
REACT_APP_SNOWFLAKE_SCHEMA=your_schema
REACT_APP_SNOWFLAKE_ROLE=your_role
REACT_APP_SNOWFLAKE_URL=https://your_account.snowflakecomputing.com

# Cortex Agent API settings
REACT_APP_CORTEX_MODEL=claude-4-sonnet
REACT_APP_SEMANTIC_MODEL_PATH=@your_database.your_schema.your_stage/customer_semantic_model.yaml
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
   This will start the React frontend with API routes on port 3000 by default.

2. Open your browser and navigate to http://localhost:3000

## Deploying to Vercel

This project is configured for deployment on Vercel with a simplified setup. Follow these steps to deploy:

1. **Connect your GitHub repository to Vercel**:
   - Create a new project on Vercel
   - Connect your GitHub repository
   - Vercel will automatically detect the React application

2. **Set up environment variables in Vercel**:
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add all the environment variables from your `.env` file
   - Make sure to add the following variables:
     - `REACT_APP_SNOWFLAKE_ACCOUNT`
     - `REACT_APP_SNOWFLAKE_USERNAME`
     - `REACT_APP_SNOWFLAKE_PASSWORD`
     - `REACT_APP_SNOWFLAKE_WAREHOUSE`
     - `REACT_APP_SNOWFLAKE_DATABASE`
     - `REACT_APP_SNOWFLAKE_SCHEMA`

3. **Verify deployment**:
   - Test the chat interface on your deployed Vercel URL
   - Check that API requests are working correctly
   - Verify that data tables are displayed correctly in the chat interface

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
