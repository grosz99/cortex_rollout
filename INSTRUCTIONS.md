# Snowflake Cortex Agent Frontend - Instruction Guide

This instruction guide provides detailed information on setting up, configuring, deploying, and using the Snowflake Cortex Agent Frontend application. This guide is intended for developers, administrators, and end users who will be working with the application.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup and Installation](#setup-and-installation)
4. [Configuration](#configuration)
5. [Local Development](#local-development)
6. [Deployment](#deployment)
7. [Usage Guide](#usage-guide)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance and Updates](#maintenance-and-updates)

## Project Overview

The Snowflake Cortex Agent Frontend is a React-based web application that provides a chat interface for interacting with Snowflake's Cortex Agent. It allows users to query their Snowflake data using natural language and receive AI-generated responses based on the data.

**Key Features:**
- Natural language queries to Snowflake data
- Real-time responses from Snowflake Cortex Agent
- Interactive chat interface with message history
- Data visualization through tables
- Suggested queries for quick access

## Architecture

The application follows a modern serverless architecture:

1. **Frontend**: React application with Material UI components
2. **API Layer**: Serverless API routes (Vercel API functions)
3. **Backend Services**:
   - Cortex Agent service for natural language processing
   - Snowflake service for data querying

The application is designed to be deployed on Vercel, which handles both the frontend hosting and serverless backend functions.

## Setup and Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- Snowflake account with Cortex Agent enabled
- GitHub account (for deployment to Vercel)

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/grosz99/cortex_rollout.git
   cd cortex_rollout
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy the `.env.example` file to create `.env`, `.env.development`, and `.env.production` files
   - Fill in the appropriate values for each environment (see [Configuration](#configuration) section)

## Configuration

### Environment Variables

The application requires several environment variables to be set for proper functionality. Create the following files:

#### `.env.development` (for local development)

```
REACT_APP_SNOWFLAKE_ACCOUNT=your_account_identifier
REACT_APP_SNOWFLAKE_USERNAME=your_username
REACT_APP_SNOWFLAKE_PASSWORD=your_password
REACT_APP_SNOWFLAKE_WAREHOUSE=your_warehouse
REACT_APP_SNOWFLAKE_DATABASE=your_database
REACT_APP_SNOWFLAKE_SCHEMA=your_schema
REACT_APP_SNOWFLAKE_ROLE=your_role

# Cortex Agent API settings
REACT_APP_CORTEX_MODEL=claude-4-sonnet
REACT_APP_SEMANTIC_MODEL_PATH=@your_database.your_schema.your_stage/customer_semantic_model.yaml
```

#### `.env.production` (for production deployment)

```
REACT_APP_SNOWFLAKE_ACCOUNT=your_account_identifier
REACT_APP_SNOWFLAKE_USERNAME=your_username
REACT_APP_SNOWFLAKE_PASSWORD=your_password
REACT_APP_SNOWFLAKE_WAREHOUSE=your_warehouse
REACT_APP_SNOWFLAKE_DATABASE=your_database
REACT_APP_SNOWFLAKE_SCHEMA=your_schema
REACT_APP_SNOWFLAKE_ROLE=your_role

# Cortex Agent API settings
REACT_APP_CORTEX_MODEL=claude-4-sonnet
REACT_APP_SEMANTIC_MODEL_PATH=@your_database.your_schema.your_stage/customer_semantic_model.yaml
```

### Snowflake Configuration

1. **Ensure your Snowflake account has Cortex Agent enabled**:
   - Contact your Snowflake account representative if you need to enable this feature
   - Verify that you have the necessary permissions to access Cortex Agent functionality

2. **Set up a semantic model** (if not already done):
   - Create a semantic model in Snowflake that maps your data schema
   - Upload the semantic model YAML file to a Snowflake stage
   - Reference this stage path in your environment variables

## Local Development

### Starting the Development Server

1. **Run the development server**:
   ```bash
   npm run dev
   ```

2. **Access the application**:
   Open your browser and navigate to http://localhost:3000

### Development Workflow

1. **Making changes**:
   - Modify React components in the `src/components` directory
   - Update services in the `src/services` directory
   - API routes are located in the `api` directory

2. **Testing changes**:
   - Run tests with `npm test`
   - Manually test the chat interface by sending queries
   - Verify that data tables are displayed correctly

3. **Committing changes**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin master
   ```

## Deployment

### Deploying to Vercel

1. **Connect your GitHub repository to Vercel**:
   - Create a new project on Vercel
   - Connect your GitHub repository
   - Vercel will automatically detect the React application

2. **Set up environment variables in Vercel**:
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add all the environment variables from your `.env.production` file

3. **Deploy the application**:
   - Vercel will automatically deploy when changes are pushed to the main branch
   - You can also manually trigger deployments from the Vercel dashboard

4. **Verify the deployment**:
   - Test the chat interface on your deployed Vercel URL
   - Check that API requests are working correctly
   - Verify that data tables are displayed correctly

### Custom Domain Setup (Optional)

1. **Add a custom domain in Vercel**:
   - Go to your project settings
   - Navigate to Domains
   - Add your custom domain and follow the verification steps

2. **Update DNS settings**:
   - Configure your DNS provider with the records provided by Vercel
   - Wait for DNS propagation (may take up to 48 hours)

## Usage Guide

### Using the Chat Interface

1. **Starting a conversation**:
   - The chat interface will greet you with a welcome message
   - Type your query in the input field at the bottom of the chat

2. **Asking questions about your data**:
   - Use natural language to ask questions about your Snowflake data
   - Example: "How many sales do we have in total?"
   - Example: "Show me contract details for Acme Corp"

3. **Using suggested queries**:
   - Click on any of the suggested query buttons to quickly ask common questions
   - These queries will be automatically filled in the input field

4. **Viewing data tables**:
   - When the response includes data, it will be displayed as a table
   - Tables can be scrolled horizontally and vertically if they contain many columns or rows

### Example Queries

Here are some example queries you can use with the Cortex Agent:

- "What were our total sales in Q1 2024?"
- "Show me the top 5 customers by revenue"
- "Compare sales performance between regions"
- "What contracts are expiring next month?"
- "Show me customer 360 view for customer ID 12345"
- "What's the average deal size by industry?"

## Troubleshooting

### Common Issues and Solutions

1. **API Error Responses**:
   - Check that your Snowflake credentials are correct in the environment variables
   - Verify that the Cortex Agent is enabled for your Snowflake account
   - Check the browser console for detailed error messages

2. **Data Not Displaying**:
   - Verify that the query is correctly formatted
   - Check that the semantic model path is correct
   - Ensure the user has appropriate permissions to access the data

3. **Deployment Issues**:
   - Check that all environment variables are correctly set in Vercel
   - Review the build logs in Vercel for any errors
   - Verify that the API routes are correctly configured

### Debugging

1. **Local debugging**:
   - Check the browser console for error messages
   - Use React Developer Tools to inspect component state
   - Add console.log statements to debug specific issues

2. **Vercel debugging**:
   - Use Vercel logs to view server-side errors
   - Enable function logs in Vercel for more detailed information
   - Test API endpoints directly using tools like Postman

## Maintenance and Updates

### Regular Maintenance Tasks

1. **Dependency updates**:
   - Regularly update npm packages to ensure security and performance
   - Run `npm audit` to check for vulnerabilities
   - Update packages with `npm update`

2. **Monitoring**:
   - Monitor application performance using Vercel Analytics
   - Set up alerts for API failures or performance issues

### Making Updates

1. **Adding new features**:
   - Create a new branch for feature development
   - Implement and test the feature locally
   - Create a pull request for review
   - Merge to master after approval

2. **Updating the semantic model**:
   - Update the YAML file in your Snowflake stage
   - Update the `REACT_APP_SEMANTIC_MODEL_PATH` if the path changes

3. **Updating environment variables**:
   - Update both local `.env` files and Vercel environment variables
   - Redeploy the application after updating variables in Vercel

---

This instruction guide should help you get started with the Snowflake Cortex Agent Frontend. If you encounter any issues not covered in this guide, please refer to the project repository or contact the development team.
