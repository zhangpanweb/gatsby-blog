import React from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 10px;
`;

const Description = styled.span`
  display: inline-block;
  margin-bottom: 20px;
`;

export default () => (
  <Container>
    <Title>渊虹小站</Title>
    <Description>Have life, have code.</Description>
  </Container>
)