import React from 'react';
import styled from '@emotion/styled';
import {Link} from 'gatsby';

const Container = styled.div`
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 30px;
`;

const NavContainer = styled.div`
  margin: 30px;

  a{
    margin: 0 15px;
  }
`;

// const Description = styled.span`
//   display: inline-block;
//   margin-bottom: 50px;
// `;

export default () => (
  <Container>
    <Title>渊虹小站</Title>
    {/* <Description>Have life, have code.</Description> */}
    <NavContainer>
      <Link to="/">首页</Link>
      <Link to="/collections">收藏</Link>
    </NavContainer>
  </Container>
)