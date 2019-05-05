import React from 'react';
import { graphql } from 'gatsby';
import { css } from '@emotion/core';
import styled from '@emotion/styled';


const PostContainer = styled.div`
    margin: 50px auto 50px;
    max-width: 770px;
    padding-top: 50px;
    padding: 50px;
    background: white;
`;

const PostTitle = styled.h2`
  margin-bottom: 50px;
  font-size: 25px;
`;

const contentCSS = css`
  font-size:15px;
  h6{ font-size: 100%};
  h5{font-size:120%};
  h4{ font-size: 140%};
  h2{font-size:200%};
  *{line-height:1.8};
`;

export default ({ data }) => {
  const post = data.markdownRemark;
  return (
    <PostContainer>
      <PostTitle>{post.frontmatter.title}</PostTitle>
      <div dangerouslySetInnerHTML={{ __html: post.html }} css={contentCSS} />
    </PostContainer>
  )
}

export const query = graphql`
  query($postName:String!) {
    markdownRemark(fields:{postName:{eq:$postName}}){
      html
      frontmatter{
        title
      }
    }
  }
`