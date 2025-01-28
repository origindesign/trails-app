# `vernon trails app`

## Getting Started

-   `npm run dev` - Starts a dev server at http://localhost:5173/

-   `npm run build` - Builds for production, emitting to `dist/`

-   `npm run preview` - Starts a server at http://localhost:4173/ to test production build locally

## Getting Started

This is a React ( Preact ) app - https://preactjs.com/

We are connecting to the main Vernon trails site at the `/trail-data/geojson` url. We pull trails data from this url into our app, and then we build the front end from it.

### Component structure

Check out the parent component `section-map.jsx` for where the logic is written.
The child components are both defined and called in this file.

We are using SASS for css compiling. Run the `dev` script to build locally.

### Data Structure

The data comes in as a csv spreadsheet. It is two sets of data that are merged using a python script you can find in the `data/` directory.

It is imported to Drupal, then exported in JSON format for us to read.

### URL Parameters

Users can open specific trails from a URL, by following the URL parameter pattern. Search for the `selectTrailFromURL` function in `section-map.jsx`;
URL Pattern: `?trail=<trail-name>`
