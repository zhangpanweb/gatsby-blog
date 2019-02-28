import React from 'react';
import styled from '@emotion/styled';

import Header from './header';

const Container = styled.div`
  margin: 0 auto;
  max-width: 770px;
  margin-top: 50px;
  padding: 0 20px;
`;

export default ({ children, hideHeader }) => (
  <Container>
    {!hideHeader ? <Header /> : null}
    {children}
  </Container>
)
