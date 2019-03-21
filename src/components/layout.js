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

export default ({ children, pageTitle }) => (
  <React.Fragment>
    <Helmet>
      <meta charSet="utf-8" />
      <title>{pageTitle}</title>
    </Helmet>
    <Container>
      <Header />
      {children}
    </Container>
  </React.Fragment>

)
