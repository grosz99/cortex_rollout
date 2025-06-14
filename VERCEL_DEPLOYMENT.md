# Vercel Deployment Guide

This document provides detailed instructions for deploying the Cortex Agent Chat Interface to Vercel.

## Prerequisites

- A GitHub account with the repository pushed to it
- A Vercel account (you can sign up at [vercel.com](https://vercel.com) using your GitHub account)
- Your Snowflake credentials

## Step 1: Connect Your Repository to Vercel

1. Log in to your Vercel account
2. Click "Add New..." > "Project"
3. Import your GitHub repository (cortex_rollout)
4. Select the repository and click "Import"

## Step 2: Configure Environment Variables

In the Vercel project settings, add the following environment variables:

| Variable Name | Description | Example Value |
|---------------|-------------|--------------|
| `REACT_APP_SNOWFLAKE_ACCOUNT` | Your Snowflake account identifier | `xy12345.us-east-1` |
| `REACT_APP_SNOWFLAKE_USERNAME` | Your Snowflake username | `username` |
| `REACT_APP_SNOWFLAKE_PASSWORD` | Your Snowflake password | `password` |
| `REACT_APP_SNOWFLAKE_WAREHOUSE` | Your Snowflake warehouse | `COMPUTE_WH` |
| `REACT_APP_SNOWFLAKE_DATABASE` | Your Snowflake database | `CORTEX_AGENT_DB` |
| `REACT_APP_SNOWFLAKE_SCHEMA` | Your Snowflake schema | `CORTEX_AGENT_SCHEMA` |
| `NODE_ENV` | Environment setting | `production` |

To add these variables:
1. Go to your project in the Vercel dashboard
2. Click on "Settings" tab
3. Navigate to "Environment Variables" section
4. Add each variable with its corresponding value
5. Make sure to click "Save" after adding all variables

## Step 3: Deploy Your Project

1. In the Vercel dashboard, click on "Deploy"
2. Vercel will automatically build and deploy your project
3. Once deployment is complete, you'll receive a URL for your application

## Step 4: Verify Deployment

1. Visit your deployed application URL
2. Test the chat interface by sending a query
3. Verify that the application can connect to Snowflake and return responses

## Troubleshooting

If you encounter issues with your deployment:

1. **API Connection Issues**:
   - Check that all environment variables are correctly set in Vercel
   - Verify that your Snowflake account is accessible from Vercel's servers

2. **Build Failures**:
   - Check the build logs in Vercel for specific error messages
   - Ensure all dependencies are correctly specified in package.json

3. **CORS Issues**:
   - The API is configured to accept requests from Vercel domains
   - If you're using a custom domain, add it to the CORS configuration in api/index.js

## Updating Your Deployment

Any changes pushed to your GitHub repository's main branch will automatically trigger a new deployment if you've set up automatic deployments.

To manually redeploy:
1. Go to your project in the Vercel dashboard
2. Click on "Deployments"
3. Click "Redeploy" on the deployment you want to update
