import React from 'react';
import Layout from './src/components/layout';

import "./src/styles/index";

export const wrapPageElement = ({ element, props }) => {
  if(props.location.pathname.match(/\post\//)){
    return <>{element}</>;
  }

  return <Layout {...props}>{element}</Layout>;
};