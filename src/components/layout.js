import React from 'react';
import styled from '@emotion/styled';
import { Helmet } from "react-helmet";

import Header from './header';

const Container = styled.div`
  margin: 0 auto;
  max-width: 770px;
  margin-top: 50px;
  padding: 0 20px;
`;

export default ({ children }) => (
  <>
    <Helmet>
      <meta charSet="utf-8" />
      <title>渊虹小站</title>
    </Helmet>
    <Container>
      <Header />
      {children}
    </Container>
  </>

)
