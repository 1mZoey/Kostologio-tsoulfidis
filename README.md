## License


**Copyright © 2026 Zoi Tsoulfidou. This project is not licensed for redistribution, modification, or commercial use without written permission.**



# Cost Estimator (Kostologio)

Kostologio is a desktop cost calculation application built for a stone-processing workflow. It combines a React + Vite frontend, an Express + MongoDB backend, and Electron packaging to provide a fast internal tool for estimating production costs, packaging, and VAT.

## Overview

The app helps users:
- Search products and materials quickly.
- Calculate total production cost based on product, finish, source, quantity, and packaging.
- View cost breakdowns per m² and final totals with VAT.
- Manage overhead costs from an admin panel.
- Use a desktop-style interface optimized for fast internal workflows.

## Features

- Desktop app built with Electron.
- Fast product/material search with keyboard navigation.
- Cost calculator with:
  - raw material cost
  - processing cost
  - packaging cost
  - VAT breakdown
- Admin page for editing overhead costs.
- Dark mode UI.
- Modular frontend and backend structure.
- MongoDB Atlas integration.

## Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

**Backend**
- Node.js
- Express.js
- Mongoose
- MongoDB Atlas
- dotenv
- cors

**Desktop**
- Electron

**Development Tools**
- concurrently
- nodemon

## Screenshots

<img width="1381" height="913" alt="Screenshot 2026-03-28 214413" src="https://github.com/user-attachments/assets/d0977a30-9f19-4aa3-a9b1-06c3de2a4057" />


<img width="1372" height="895" alt="Screenshot 2026-03-28 214451" src="https://github.com/user-attachments/assets/b2c4fdb5-3000-4157-b704-b7f09baaee27" />


## Project Structure

- `Client/` — React frontend
- `server/` — Express API and MongoDB logic
- `main.js` — Electron entry point

## Setup

### Prerequisites
- Node.js
- MongoDB Atlas account or local MongoDB connection
- npm

### Install dependencies
```bash
npm install
cd Client
npm install
cd ../server
npm install
```

### Environment variables

Create a `.env` file inside `server/` with your MongoDB connection details.

Example:
```env
MONGODB_URI=your_connection_string
PORT=5000
```

### Run the app in development

From the root project folder:

```bash
npm run dev
```

Or run frontend and backend separately if needed.

## Key Routes

- `/api/products`
- `/api/cost-items`
- `/api/calculator/available-finishes/:productName`
- `/api/calculator/calculate`
- `/api/admin/overhead`
- `/api/history`

## Notes

This project is actively being expanded with additional cost analysis features, production routing logic, and purchase management tools.

## Future Improvements

- Detailed overhead breakdown by category.
- Machine-level labor cost analysis.
- Purchase tracking for raw materials.
- Offer/email generation workflow.
- Production route management.
- History and reporting improvements.

