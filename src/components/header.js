import React from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  text-align: center;
  border-bottom: 1px solid black;
`;

const Title = styled.h2`
  margin-bottom: 10px;
`;

const Description = styled.span`
  display: inline-block;
  margin-bottom: 20px;
  font-family: 'Consolas';
`;

export default () => (
  <Container>
    <Title>渊虹小站</Title>
    <Description>Have life, have code.</Description>
  </Container>
)