import React from "react";
import Layout from "./src/components/Layout";

/**
 * Thses code fix the problem: 
 * when only using wrapPageElement in gatsby-browser.js, under the 
 * circumstance of 'gatsby build', the Layout component will not 
 * appear the first time page loading completed. When you navigate
 * to anthother page and come back, then the Layout component will
 * display it as normal.
 */
export const wrapPageElement = ({ element, props }) => {
  return <Layout {...props}>{element}</Layout>;
};
